import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import { toFlag, emptyToNull } from '../utils/strings.js';

/**
 * Normalises a request payload against a field whitelist.
 * Unknown keys are dropped so the API can never write arbitrary fields.
 */
export const pickFields = (payload, fields) => {
  const result = {};
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      result[field] = payload[field];
    }
  });
  return result;
};

/**
 * Applies type coercion rules to a whitelisted payload.
 * `flags`  -> 0/1 integers
 * `dates`  -> Date instances or null
 * `json`   -> parsed JSON (falls back to the raw string)
 */
export const coercePayload = (payload, { flags = [], dates = [], json = [] } = {}) => {
  const result = { ...payload };

  flags.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(result, field)) {
      const flag = toFlag(result[field]);
      result[field] = flag === undefined ? 0 : flag;
    }
  });

  dates.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(result, field)) {
      const value = emptyToNull(result[field]);
      result[field] = value === null || value === undefined ? null : new Date(value);
    }
  });

  json.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(result, field)) {
      const value = result[field];
      if (typeof value === 'string') {
        try {
          result[field] = JSON.parse(value);
        } catch {
          /* keep the raw string when it is not valid JSON */
        }
      }
    }
  });

  return result;
};

/**
 * Builds a REST controller for a simple Mongo model.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} options
 * @param {string[]} options.fields      writable fields
 * @param {string[]} [options.flags]     boolean-ish fields stored as 0/1
 * @param {string[]} [options.dates]     date fields
 * @param {string[]} [options.json]      fields parsed from JSON strings
 * @param {object}   [options.sort]      default sort
 * @param {string[]} [options.search]    fields searched by the `search` query param
 */
export const createCrudController = (Model, options = {}) => {
  const {
    fields = [],
    flags = [],
    dates = [],
    json = [],
    sort = { sort_order: 1, created_at: -1 },
    search = [],
    label = Model.modelName,
  } = options;

  const buildQuery = (query = {}) => {
    const filters = { ...query };
    if (filters.deleted_at === undefined && Model.schema.path('deleted_at')) {
      filters.deleted_at = null;
    }
    return filters;
  };

  /**
   * Copies whitelisted query params into a Mongo filter, coercing ObjectIds.
   */
  const queryFilters = (req) => {
    const filters = {};
    (options.filters ?? []).forEach((key) => {
      const value = req.query[key];
      if (value === undefined || value === '') return;

      if (Model.schema.path(key)?.instance === 'ObjectId') {
        if (mongoose.isValidObjectId(String(value))) filters[key] = String(value);
        return;
      }
      filters[key] = value;
    });
    return filters;
  };

  const list = async (req, res) => {
    const filters = buildQuery(queryFilters(req));
    const term = req.query.search?.trim();

    if (term && search.length > 0) {
      const or = search.map((field) => ({ [field]: new RegExp(escapeRegExp(term), 'i') }));
      filters.$or = or;
    }

    const limit = Math.min(Number.parseInt(req.query.limit ?? '100', 10) || 100, 500);
    const skip = Math.max(Number.parseInt(req.query.skip ?? '0', 10) || 0, 0);

    const rows = await Model.find(filters).sort(sort).skip(skip).limit(limit).lean();
    const total = await Model.countDocuments(filters);

    return res.json({
      success: true,
      message: 'Success',
      data: rows,
      meta: { total, limit, skip },
    });
  };

  const getOne = async (req, res) => {
    const filters = buildQuery({ _id: req.params.id });
    const row = await Model.findOne(filters).lean();
    if (!row) throw ApiError.notFound(`${label} not found`);
    return res.json({ success: true, message: 'Success', data: row });
  };

  const create = async (req, res) => {
    const payload = coercePayload(pickFields(req.body, fields), { flags, dates, json });
    const created = await Model.create(payload);
    return res
      .status(201)
      .json({ success: true, message: `${label} created successfully`, data: created });
  };

  const update = async (req, res) => {
    const payload = coercePayload(pickFields(req.body, fields), { flags, dates, json });
    const filters = buildQuery({ _id: req.params.id });
    const updated = await Model.findOneAndUpdate(filters, { $set: payload }, { new: true });
    if (!updated) throw ApiError.notFound(`${label} not found`);
    return res.json({ success: true, message: `${label} updated successfully`, data: updated });
  };

  const remove = async (req, res) => {
    const filters = buildQuery({ _id: req.params.id });

    if (Model.schema.path('deleted_at')) {
      const updated = await Model.findOneAndUpdate(
        filters,
        { $set: { deleted_at: new Date() } },
        { new: true },
      );
      if (!updated) throw ApiError.notFound(`${label} not found`);
      return res.json({ success: true, message: `${label} deleted successfully`, data: updated });
    }

    const deleted = await Model.findOneAndDelete(filters);
    if (!deleted) throw ApiError.notFound(`${label} not found`);
    return res.json({ success: true, message: `${label} deleted successfully`, data: deleted });
  };

  return { list, getOne, create, update, remove };
};

export const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default createCrudController;
