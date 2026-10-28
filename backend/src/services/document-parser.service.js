/**
 * Extracts plain text from the files the admin uploads to train the AI.
 *
 * Supported formats: PDF, DOC, DOCX, CSV and TXT. Text is read as UTF-8
 * (with UTF-16 BOM detection) so Kinyarwanda accents and special
 * characters survive the extraction intact.
 */
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
const WordExtractor = require('word-extractor');

export const MAX_TEXT_LENGTH = 500000;

export const SUPPORTED_EXTENSIONS = ['csv', 'pdf', 'doc', 'docx', 'txt'];

/**
 * Cleans extracted text while preserving the original language characters.
 */
export const normalizeExtractedText = (value) =>
  String(value ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\0/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);

const readTextFile = async (filePath) => {
  const buffer = await fs.readFile(filePath);

  // UTF-16 little endian (common for exported Word/CSV files).
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString('utf16le');
  }

  // UTF-16 big endian - swap the bytes before decoding.
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.from(buffer);
    for (let index = 0; index + 1 < swapped.length; index += 2) {
      const byte = swapped[index];
      swapped[index] = swapped[index + 1];
      swapped[index + 1] = byte;
    }
    return swapped.toString('utf16le');
  }

  return buffer.toString('utf8');
};

const detectDelimiter = (sample) => {
  const candidates = [',', ';', '\t'];
  let best = ',';
  let bestCount = 0;

  candidates.forEach((delimiter) => {
    const count = sample.split(delimiter).length - 1;
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  });

  return best;
};

/**
 * RFC-4180 style CSV parser: supports quoted fields, escaped quotes and
 * multi-line values.
 */
const parseCsvRows = (input, delimiter) => {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => String(cell).trim() !== ''));
};

const csvToText = (raw) => {
  const input = raw.replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(input.split('\n').slice(0, 5).join('\n'));
  const rows = parseCsvRows(input, delimiter);

  if (rows.length === 0) return '';

  const firstRow = rows[0].map((cell) => String(cell).trim());
  const looksLikeHeader =
    firstRow.length > 1 &&
    firstRow.every((cell) => cell !== '' && !/^-?\d+([.,]\d+)?$/.test(cell));

  const headers = looksLikeHeader
    ? firstRow
    : firstRow.map((_, index) => `Column ${index + 1}`);
  const startIndex = looksLikeHeader ? 1 : 0;

  const lines = [];

  for (let rowIndex = startIndex; rowIndex < rows.length; rowIndex += 1) {
    const cells = rows[rowIndex];

    const parts = cells
      .map((cell, cellIndex) => {
        const label = headers[cellIndex] || `Column ${cellIndex + 1}`;
        const value = String(cell).trim();
        return value ? `${label}: ${value}` : '';
      })
      .filter(Boolean);

    if (parts.length > 0) lines.push(parts.join(' | '));
  }

  return lines.join('\n');
};

/**
 * Extracts the readable text of a training document.
 *
 * @param {string} filePath Absolute path of the uploaded file.
 * @param {string} extension Lower-case extension without the dot.
 * @returns {Promise<string>}
 */
export const extractDocumentText = async (filePath, extension) => {
  const ext = String(extension ?? '').toLowerCase();

  if (ext === 'pdf') {
    const buffer = await fs.readFile(filePath);
    const parsed = await pdfParse(buffer);
    return parsed.text ?? '';
  }

  if (ext === 'doc' || ext === 'docx') {
    const extractor = new WordExtractor();
    const document = await extractor.extract(filePath);
    return document.getBody() ?? '';
  }

  if (ext === 'csv') {
    const raw = await readTextFile(filePath);
    return csvToText(raw);
  }

  if (ext === 'txt') {
    return readTextFile(filePath);
  }

  throw new Error(`Unsupported file type: .${ext}`);
};

export default extractDocumentText;
