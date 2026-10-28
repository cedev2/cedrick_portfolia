/**
 * Cedrick AI — retrieval-augmented assistant.
 *
 * Ported from the legacy `backend/api/ai/chat.php`. The intent engine, the
 * Kinyarwanda detection, the RAG context builder and every response template
 * are preserved so the chatbot keeps answering exactly the same questions.
 */
import env from '../config/env.js';
import {
  Achievement,
  AiConversation,
  AiDocument,
  AiMessage,
  AiSetting,
  Certificate,
  Education,
  Experience,
  Project,
  Service,
  Setting,
  SiteInformation,
  Skill,
} from '../models/index.js';

export const OWNER_NAME = 'NIBISHAKA CEDRICK';

/* ------------------------------------------------------------------ *
 * Kinyarwanda detection
 * ------------------------------------------------------------------ */

const KINYARWANDA_WORDS = [
  'ndabizi', 'amakuru', 'muraho', 'murabeho', 'ndabaye', 'ndakunda',
  'ndagukunda', 'urakoze', 'ndakoze', 'sawa', 'yego', 'oya', 'ni',
  'ndi', 'uri', 'turabaye', 'mwaramutse', 'mwiriwe', 'meze',
  'bite', 'kubera', 'kuko', 'ndetse', 'kandi', 'cyangwa', 'cyane',
  'nka', 'ku', 'mu', 'kuri', 'igihe', 'ubu', 'nano', 'uriya',
  'se', 'ni', 'ari', 'ko', 'uba', 'ubwo', 'aha', 'nhere',
  'ibyo', 'urya', 'iyo', 'uburyo', 'umuntu', 'abantu', 'ikintu',
  'ibintu', 'umwuga', 'akazi', 'amazi', 'amahera', 'isuku',
  'ibukuru', 'icyumweru', 'kwezi', 'umwaka', 'iminsi', 'ijoro',
  'umunsi', 'igitondo', 'izuba', 'umuheto', 'isaha', 'iminota',
  'ibibanza', 'umudugudu', 'akarere', 'uturere', 'igihugu',
  'ibyangombwa', 'amahitamo', 'ubushakashatsi', 'ubuvuzi',
  'ubujyanama', 'ubuhinzi', 'ubukorikori', 'umusaruro',
  'ubucuruzi', 'ubwubatsi', 'ubuhinga', 'urukingingo',
  'ingendo', 'ubukwe', 'inkoko', 'inka', 'ingurube', 'ihene',
  'ibinyabuzima', 'ubusambanyi', 'icyubahiro', 'uburenganzira',
  'ubwigenge', 'ubusabane', 'ubumwe', 'amajyambere',
  'ibyiza', 'amahoro', 'ubuntu', 'umurimo', 'akazi',
  'ndabizi', 'soma', 'andika', 'jya', 'uja', 'reka', 'tuja',
  'twiza', 'twende', 'njye', 'wowe', 'we', 'bo', 'bonyine',
  'nyene', 'rwose', 'buri', 'rimwe', 'kabiri', 'gatatu',
];

const KINYARWANDA_MORPHOLOGY = /\b(nda|uwa|tur|mw|tw|bw|rw|kw|gw|cw|nw|sw|fw|pw)\w{2,}\b/;

export const detectLanguage = (message = '') => {
  const msg = String(message).toLowerCase().trim();

  for (const word of KINYARWANDA_WORDS) {
    if (msg.includes(word)) return 'kinyarwanda';
  }

  if (KINYARWANDA_MORPHOLOGY.test(msg)) return 'kinyarwanda';

  return 'english';
};

/* ------------------------------------------------------------------ *
 * RAG context
 * ------------------------------------------------------------------ */

const SECTION_QUERIES = [
  {
    header: '\n=== SKILLS ===',
    model: Skill,
    sort: { sort_order: 1 },
    build: (row) =>
      `- ${row.name} (${row.category} ${row.percentage}%)`,
  },
  {
    header: '\n=== PROJECTS ===',
    model: Project,
    sort: { sort_order: 1 },
    limit: 10,
    build: (row) => {
      let line = `- ${row.title}`;
      if (row.description) line += `: ${row.description}`;
      if (row.technologies) line += ` [Tech: ${row.technologies}]`;
      return line;
    },
  },
  {
    header: '\n=== EXPERIENCE ===',
    model: Experience,
    sort: { sort_order: 1 },
    build: (row) => `- ${row.title} at ${row.company}${row.description ? `: ${row.description}` : ''}`,
  },
  {
    header: '\n=== EDUCATION ===',
    model: Education,
    sort: { sort_order: 1 },
    build: (row) =>
      `- ${row.title} at ${row.institution}${row.description ? `: ${row.description}` : ''}`,
  },
  {
    header: '\n=== CERTIFICATES ===',
    model: Certificate,
    sort: { sort_order: 1 },
    limit: 10,
    build: (row) =>
      `- ${row.title} from ${row.organization}${row.description ? `: ${row.description}` : ''}`,
  },
  {
    header: '\n=== SERVICES ===',
    model: Service,
    sort: { sort_order: 1 },
    build: (row) => {
      let line = `- ${row.title}: ${row.description}`;
      if (row.pricing) line += ` [Price: ${row.pricing}]`;
      if (row.pricing_note) line += ` (${row.pricing_note})`;
      return line;
    },
  },
  {
    header: '\n=== ACHIEVEMENTS ===',
    model: Achievement,
    sort: { sort_order: 1 },
    build: (row) => `- ${row.title}: ${row.count}`,
  },
];

export const buildRAGContext = async () => {
  const context = [];

  try {
    const info = await SiteInformation.getAllMap();

    context.push('=== OWNER PROFILE ===');
    context.push(`Name: ${info.owner_name || OWNER_NAME}`);
    context.push(`Email: ${info.owner_email || 'cedrickrwa@gmail.com'}`);
    context.push(`Phone: ${info.owner_phone || '+250791801839'}`);
    context.push(`Location: ${info.owner_location || 'Kigali, Rwanda'}`);
    context.push(`Languages: ${info.owner_languages || 'English, Kinyarwanda'}`);
    context.push(`Experience: ${info.owner_experience_years || '3+'} years`);
    context.push(`Nationality: ${info.owner_nationality || 'Rwandan'}`);
    context.push(`Date of Birth: ${info.owner_dob || 'Not specified'}`);

    if (info.owner_bio) {
      context.push('\n=== PERSONAL BIO ===');
      context.push(info.owner_bio);
    }
    if (info.owner_story) {
      context.push('\n=== LIFE STORY ===');
      context.push(info.owner_story);
    }
    if (info.owner_hobbies) {
      context.push('\n=== HOBBIES & INTERESTS ===');
      context.push(info.owner_hobbies);
    }
    if (info.owner_goals) {
      context.push('\n=== GOALS & VISION ===');
      context.push(info.owner_goals);
    }
    if (info.owner_fun_facts) {
      context.push('\n=== FUN FACTS ===');
      context.push(info.owner_fun_facts);
    }
  } catch {
    /* owner profile is optional */
  }

  for (const query of SECTION_QUERIES) {
    try {
      const findQuery = query.model.find({ deleted_at: null }).sort(query.sort);
      if (query.limit) findQuery.limit(query.limit);
      const rows = await findQuery.lean();
      if (rows.length === 0) continue;

      context.push(query.header);
      rows.forEach((row) => context.push(query.build(row)));
    } catch {
      /* a missing collection should not break the assistant */
    }
  }

  return context.join('\n');
};

/**
 * Appends pricing + availability context taken from the settings stores.
 */
export const appendPricingContext = async (context, aiSettings = {}) => {
  try {
    const settings = await Setting.getAllMap();
    const pick = (key) => aiSettings[key] ?? settings[key] ?? '';

    const pricingInfo = pick('pricing_info');
    const pricingMin = pick('pricing_min');
    const pricingPayment = pick('pricing_payment');
    const pricingNote = pick('pricing_note');
    const availability = pick('availability_status');

    if (pricingInfo || pricingMin || pricingPayment || pricingNote || availability) {
      const block = ['\n=== PRICING & AVAILABILITY ==='];
      if (pricingInfo) block.push(`Pricing Overview: ${pricingInfo}`);
      if (pricingMin) block.push(`Minimum Project Price: ${pricingMin}`);
      if (pricingPayment) block.push(`Payment Methods: ${pricingPayment}`);
      if (pricingNote) block.push(`Pricing Notes: ${pricingNote}`);
      if (availability) block.push(`Availability Status: ${availability}`);
      return `${context}${block.join('\n')}`;
    }
  } catch {
    /* pricing context is optional */
  }

  return context;
};

/* ------------------------------------------------------------------ *
 * Admin training documents (CSV / PDF / DOC / DOCX / TXT)
 * ------------------------------------------------------------------ */

const MAX_TRAINING_CONTEXT_CHARS = 24000;
const MAX_TRAINING_DOC_CHARS = 8000;

/**
 * Appends the knowledge base uploaded from the admin dashboard to the RAG
 * context. Each document becomes its own `=== ... ===` section so the
 * provider receives it as a separate retrievable document.
 */
export const buildTrainingContext = async () => {
  try {
    const documents = await AiDocument.find({ status: 'ready' })
      .sort({ created_at: 1 })
      .select('title original_name text')
      .lean();

    if (documents.length === 0) return '';

    const blocks = [];
    let remaining = MAX_TRAINING_CONTEXT_CHARS;

    for (const document of documents) {
      if (remaining <= 0) break;

      const text = String(document.text ?? '').trim();
      if (!text) continue;

      const slice = text.slice(0, Math.min(MAX_TRAINING_DOC_CHARS, remaining));
      const title = String(document.title || document.original_name || 'Document')
        .replace(/[=\n]+/g, ' ')
        .trim();

      blocks.push(`=== TRAINING DOCUMENT: ${title} ===`);
      blocks.push(slice);
      remaining -= slice.length;
    }

    return blocks.join('\n\n');
  } catch {
    return '';
  }
};

/* ------------------------------------------------------------------ *
 * Built-in (offline) intent engine
 * ------------------------------------------------------------------ */

const SERVICE_KEYWORDS = {
  website: ['website', 'site', 'web page', 'landing page'],
  'web application': ['web app', 'application', 'app', 'platform', 'system'],
  'ui/ux design': ['design', 'ui', 'ux', 'interface', 'mockup', 'figma'],
  api: ['api', 'rest api', 'backend api', 'endpoint'],
  database: ['database', 'db', 'mongodb', 'mongo', 'nosql', 'schema'],
  'bug fixing': ['bug', 'fix', 'debug', 'issue', 'error', 'crash'],
  maintenance: ['maintenance', 'update', 'support', 'monthly'],
  'system integration': ['integration', 'integrate', 'connect', 'third-party'],
};

const MARKET_PRICES = {
  website: [
    'Starting from **$500** for a simple site, up to **$2,500** for a complex multi-page website with custom features.',
    'A basic landing page: $500-$800 | Business website: $1,000-$1,500 | E-commerce: $1,500-$2,500',
  ],
  'web application': [
    'Starting from **$1,000** for a basic app, up to **$5,000+** for a full-scale application.',
    'Simple CRUD app: $1,000-$2,000 | Dashboard: $2,000-$3,500 | Full-stack platform: $3,500-$5,000+',
  ],
  'ui/ux design': [
    'Starting from **$300** for basic design, up to **$1,500** for comprehensive UI/UX.',
    'Landing page design: $300-$500 | Multi-page app: $800-$1,500 | Full redesign: $1,000-$1,500',
  ],
  api: [
    'Starting from **$400** for basic APIs, up to **$2,000** for complex systems.',
    'Simple REST API: $400-$800 | Complex API: $1,000-$1,500 | API + documentation: $1,500-$2,000',
  ],
  database: [
    'Starting from **$200** for simple schemas, up to **$1,000** for complex designs.',
    'Simple schema: $200-$400 | Normalized DB: $500-$800 | Data migration + design: $800-$1,000',
  ],
  'bug fixing': [
    'Starting from **$50** per bug, with discounts for bulk fixes.',
    'Simple fix: $50-$100 | Complex bug: $100-$200 | Critical/emergency: $150-$250',
  ],
  maintenance: [
    'Starting from **$100/month** for basic maintenance.',
    'Basic (updates + security): $100/month | Standard (updates + content): $200/month | Premium (full support): $300/month',
  ],
  'system integration': [
    'Starting from **$300** for simple integrations, up to **$2,000** for complex systems.',
    'Single API integration: $300-$600 | Multi-service: $800-$1,500 | Enterprise: $1,500-$2,000',
  ],
};

const DEFAULT_SYSTEM_PROMPT = `You are Cedrick AI, the personal AI assistant of ${OWNER_NAME}, a Full Stack Software Developer based in Kigali, Rwanda.

Your role:
- Answer ALL questions about Cedrick: his life story, background, skills, projects, experience, services, and pricing.
- Speak warmly and personally, as if you know Cedrick very well.
- Use the portfolio context provided - never invent facts.
- The context may contain TRAINING DOCUMENTS uploaded as CSV, PDF, DOC, DOCX or TXT files. Treat them as the primary source of truth for questions about Cedrick's life, background and personal details. Quote or summarise them faithfully, and keep Kinyarwanda text exactly as written.
- If the user asks in Kinyarwanda, answer in Kinyarwanda even if the documents are in another language.
- Be conversational, friendly, and helpful.
- If asked something not in the context, say honestly you don't have that detail yet, and suggest visiting the contact form.
- Never answer questions unrelated to Cedrick.

PRICING GUIDELINES (give market-aware estimates based on complexity):
- Website Development: $500-$2,500 depending on pages and features
- Web Application Development: $1,000-$5,000+ depending on features and scale
- UI/UX Design: $300-$1,500 depending on number of screens and revisions
- REST API Development: $400-$2,000 depending on endpoints and complexity
- Database Design: $200-$1,000 depending on size and complexity
- Bug Fixing & Support: $50-$200 per issue, or monthly retainer
- Website Maintenance: $100-$300/month
- System Integration: $300-$2,000 depending on systems involved

Always explain that final pricing depends on project requirements and offer a free consultation.`;

export const getSystemPrompt = () => DEFAULT_SYSTEM_PROMPT;

/**
 * Splits the flat RAG context into named sections (`=== SKILLS ===` -> `skills`).
 */
const parseSections = (context) => {
  const sections = {};
  let currentSection = 'general';

  String(context ?? '')
    .split('\n')
    .forEach((rawLine) => {
      const match = /^=== (.+) ===$/.exec(rawLine);
      if (match) {
        currentSection = match[1].trim().toLowerCase();
        sections[currentSection] = [];
        return;
      }
      if (rawLine.trim() !== '') {
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(rawLine.trim());
      }
    });

  return sections;
};

/** Strips a leading "- " bullet the way PHP's `ltrim($v, '- ')` does. */
const stripBullet = (value = '') => value.replace(/^[- ]+/, '');

/** Case-insensitive `includes` that mirrors PHP's `stripos`. */
const containsInsensitive = (haystack, needle) =>
  String(haystack).toLowerCase().includes(String(needle).toLowerCase());

/** Case-sensitive replacement that mirrors PHP's `str_replace`. */
const replaceExact = (haystack, needle, replacement = '') =>
  String(haystack).split(needle).join(replacement);

const SEARCH_STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'was', 'were', 'what', 'who', 'how', 'when',
  'where', 'why', 'which', 'about', 'tell', 'please', 'can', 'could', 'you',
  'your', 'his', 'her', 'him', 'she', 'they', 'them', 'this', 'that', 'these',
  'those', 'with', 'from', 'have', 'has', 'had', 'does', 'did', 'doing', 'but',
  'not', 'any', 'all', 'some', 'more', 'most', 'also', 'into', 'over', 'such',
]);

const tokenizeForSearch = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !SEARCH_STOP_WORDS.has(word));

/**
 * Finds the most relevant lines inside the uploaded training documents for
 * the built-in (offline) assistant.
 */
const findDocumentMatches = (message, sections) => {
  const terms = [...new Set(tokenizeForSearch(message))];
  if (terms.length === 0) return [];

  const matches = [];

  Object.entries(sections).forEach(([key, lines]) => {
    if (!key.startsWith('training document')) return;

    lines.forEach((line) => {
      const text = stripBullet(line).trim();
      if (text.length < 6) return;

      const lower = text.toLowerCase();
      const hits = terms.filter((term) => lower.includes(term));

      if (hits.length === 0) return;

      matches.push({
        text,
        hits: hits.length,
        score: hits.reduce((total, term) => total + Math.min(term.length, 12), 0),
      });
    });
  });

  if (matches.length === 0) return [];

  matches.sort((a, b) => b.hits - a.hits || b.score - a.score || a.text.length - b.text.length);

  const best = matches[0];
  const minimumHits = Math.min(2, terms.length);

  if (best.hits < minimumHits) return [];

  const seen = new Set();

  return matches
    .filter((entry) => entry.hits >= best.hits - 1)
    .filter((entry) => {
      if (seen.has(entry.text)) return false;
      seen.add(entry.text);
      return true;
    })
    .slice(0, 3);
};

export const builtinAIResponse = (message, context, _aiSettings = {}, language = 'english') => {
  const msg = String(message).toLowerCase().trim();
  const name = OWNER_NAME;
  const kinyarwanda = language === 'kinyarwanda';

  const sections = parseSections(context);
  const profile = sections['owner profile'] ?? [];
  const skills = sections.skills ?? [];
  const projects = sections.projects ?? [];
  const experience = sections.experience ?? [];
  const education = sections.education ?? [];
  const services = sections.services ?? [];
  const certs = sections.certificates ?? [];
  const achieve = sections.achievements ?? [];

  const profileValue = (label, fallback) => {
    let value = fallback;
    profile.forEach((line) => {
      if (containsInsensitive(line, `${label}:`)) {
        value = replaceExact(line, `${label}: `);
      }
    });
    return value;
  };

  const answerFromDocuments = () => {
    const matches = findDocumentMatches(message, sections);
    if (matches.length === 0) return null;

    const body = matches.map((match) => `- ${match.text}`).join('\n');

    if (kinyarwanda) {
      return `Dore ibyo nabonye mu nyandiko z'ubumenyi bwa ${name}:\n\n${body}`;
    }

    return `Here is what I found in ${name}'s training documents:\n\n${body}`;
  };

  /* 1. Greeting */
  if (
    /\b(hi|hello|hey|good (morning|afternoon|evening)|greet|muraho|mwaramutse|amakuru)\b/.test(msg)
  ) {
    if (kinyarwanda) {
      return `Muraho! Ndine Cedrick AI, umufasha w'ibanze wa ${name}. Nshobora kukubwira ibyo yazi, ibyo yakoze, uburambe, uburezi, serivisi, n'ibindi. Nshobora kukubera iki uyu munsi?`;
    }
    return `Hello! I'm Cedrick AI, the personal assistant for ${name}. I can tell you about his skills, projects, experience, education, services, and more. How can I help you today?`;
  }

  /* 2. Name */
  if (/\bname\b/.test(msg)) {
    if (kinyarwanda) {
      return `Umuyobozi wa portfolio ni **${name}** — Umukoresha wa Softiwe yuzuye w'umwuga uri mu mujyi wa Kigali, Rwanda.`;
    }
    return `The portfolio owner is **${name}** — a passionate Full Stack Software Developer based in Kigali, Rwanda.`;
  }

  /* 3. Contact */
  if (/\b(contact|email|phone|reach|message|whatsapp|tuganira|twandikire|duhuze)\b/.test(msg)) {
    const email = profileValue('Email', 'cedrickrwa@gmail.com');
    const phone = profileValue('Phone', '+250791801839');
    if (kinyarwanda) {
      return `Usobanukirwa ${name} rero:\n\n**Email:** ${email}\n**Telefone:** ${phone}\n\nCyangwa koresha ifishi yo kuganira kuri iyi portfolio!`;
    }
    return `You can contact ${name} via:\n\n**Email:** ${email}\n**Phone:** ${phone}\n\nOr use the Contact form on this portfolio page!`;
  }

  /* 4. Location */
  if (/\b(location|where|based|country|city|live|ahantu|aho|ubitwaro)\b/.test(msg)) {
    const location = profileValue('Location', 'Kigali, Rwanda');
    if (kinyarwanda) {
      return `${name} ahurira mu **${location}**.`;
    }
    return `${name} is based in **${location}**.`;
  }

  /* 5. Experience */
  if (
    /\b(experience|years?|senior|junior|level|uburambe|umwaka)\b/.test(msg) &&
    !/\b(work|job|company|role)\b/.test(msg)
  ) {
    const years = profileValue('Experience', '3+');
    if (kinyarwanda) {
      return `${name} afise imyaka **${years}** y'uburambe mu gukora softiwe, yiteguye mu gukora porogaramu yuzuye.`;
    }
    return `${name} has **${years} years** of professional software development experience, specializing in Full Stack Web Development.`;
  }

  /* 6. Pricing */
  if (
    /\b(price|pricing|cost|charge|rate|fee|budget|quote|how much|expensive|cheap|affordable|payment|pay|ibiciro|igiciro|amahera|kwishura|kwishyura)\b/.test(
      msg,
    )
  ) {
    let pricingInfo = '';
    let pricingMin = '';
    let pricingPayment = '';
    let pricingNote = '';
    let availability = '';

    Object.entries(sections).forEach(([key, sectionLines]) => {
      if (key.includes('pricing') || key.includes('availability')) {
        sectionLines.forEach((line) => {
          if (containsInsensitive(line, 'Pricing Overview:')) {
            pricingInfo = replaceExact(line, 'Pricing Overview: ');
          }
          if (containsInsensitive(line, 'Minimum Project Price:')) {
            pricingMin = replaceExact(line, 'Minimum Project Price: ');
          }
          if (containsInsensitive(line, 'Payment Methods:')) {
            pricingPayment = replaceExact(line, 'Payment Methods: ');
          }
          if (containsInsensitive(line, 'Pricing Notes:')) {
            pricingNote = replaceExact(line, 'Pricing Notes: ');
          }
          if (containsInsensitive(line, 'Availability Status:')) {
            availability = replaceExact(line, 'Availability Status: ');
          }
        });
      }
    });

    const servicePricing = {};
    services.forEach((service) => {
      const match = /^- (.+?): (.+?) \[Price: (.+?)\]/.exec(service);
      if (match) servicePricing[match[1].toLowerCase()] = { desc: match[2], price: match[3] };
    });

    let matchedService = null;
    outer: for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (msg.includes(keyword)) {
          matchedService = service;
          break outer;
        }
      }
    }

    const lines = [];
    if (matchedService && servicePricing[matchedService]) {
      const entry = servicePricing[matchedService];
      lines.push(`**${matchedService}:** ${entry.desc}`);
      lines.push(`**Pricing:** ${entry.price}`);
      lines.push('');
      lines.push(
        '💡 *Final pricing depends on project complexity, features, and timeline. Cedrick offers free consultations to discuss your specific needs and provide an accurate quote.*',
      );
    } else if (matchedService && MARKET_PRICES[matchedService]) {
      const [headline, breakdown] = MARKET_PRICES[matchedService];
      lines.push(`**${matchedService} pricing:**`);
      lines.push(headline);
      lines.push('');
      lines.push(`**Market rate breakdown:** ${breakdown}`);
      lines.push('');
      lines.push(
        '💡 *These are estimates based on current market rates. Final pricing depends on specific requirements, complexity, and timeline. Cedrick offers a free consultation!*',
      );
    } else {
      if (pricingInfo) {
        lines.push(`**Pricing Overview:**\n${pricingInfo}`);
      } else {
        lines.push(`**${name}'s Service Pricing:**`);
        lines.push('');
        lines.push('• **Website Development:** $500 - $2,500');
        lines.push('• **Web Application:** $1,000 - $5,000+');
        lines.push('• **UI/UX Design:** $300 - $1,500');
        lines.push('• **REST API Development:** $400 - $2,000');
        lines.push('• **Database Design:** $200 - $1,000');
        lines.push('• **Bug Fixing:** $50 - $250 per issue');
        lines.push('• **Maintenance:** $100 - $300/month');
        lines.push('• **System Integration:** $300 - $2,000');
      }
      lines.push('');
    }

    if (pricingMin) lines.push(`**Minimum Price:** ${pricingMin}`);
    if (pricingPayment) lines.push(`**Payment Methods:** ${pricingPayment}`);
    if (pricingNote) lines.push(`**Notes:** ${pricingNote}`);
    if (availability) lines.push(`**Availability:** ${availability}`);

    lines.push(
      `\n📧 For an accurate quote, contact ${name} via email or the Contact form — consultations are **free**!`,
    );
    return lines.join('\n\n');
  }

  /* 7. Skills */
  if (
    /\b(skill|tech|stack|know|language|framework|tool|use|proficient|expertise|uburambe|ubushobozi)\b/.test(
      msg,
    )
  ) {
    if (skills.length === 0) {
      if (kinyarwanda) {
        return `${name} afise uburambe mu buryo bwo kubona uburyo bushya bw'urubuga nka React, Node.js, PHP, MongoDB, JavaScript, Python, Tailwind CSS, n'ibindi!`;
      }
      return `${name} is skilled in modern web technologies including React, Node.js, PHP, MongoDB, JavaScript, Python, Tailwind CSS, and more!`;
    }

    const grouped = {};
    skills.forEach((skill) => {
      const match = /^- ([^(]+) \(([^)]+)\)$/.exec(skill);
      if (match) {
        const category = match[2].trim().split(' ')[0];
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(match[1].trim());
      }
    });

    const lines = [`Here are ${name}'s technical skills:\n`];
    Object.entries(grouped).forEach(([category, items]) => {
      lines.push(`**${category}:** ${items.join(', ')}`);
    });
    return lines.join('\n');
  }

  /* 8. Projects */
  if (
    /\b(project|build|built|portfolio|work|app|application|website|develop|ibikorwa|porogaramu|urubuga)\b/.test(
      msg,
    )
  ) {
    if (projects.length === 0) {
      if (kinyarwanda) {
        return `${name} yakoze porogaramu nyinshi z'urubuga mu gihe cy'amashanyarazi, REST APIs, sisitemu y'ubuyobozi, n'ibindi. Reba ibice by'ibikorwa!`;
      }
      return `${name} has built numerous web applications including e-commerce platforms, REST APIs, management systems, and more. Check the Projects section!`;
    }
    const lines = [`Here are some of ${name}'s featured projects:\n`];
    projects.slice(0, 4).forEach((project) => {
      lines.push(`- ${stripBullet(project)}`);
    });
    return lines.join('\n');
  }

  /* 9. Education */
  if (
    /\b(education|degree|study|school|university|college|certif|graduate|amashuri|uburezi)\b/.test(msg)
  ) {
    if (education.length === 0) {
      if (kinyarwanda) {
        return `${name} afise digirii mu Bichi y'Ibikorana n'Ikoranabuhanga kandi arakomeza kwiga mu mahugurwa y'interineti n'ipeturo.`;
      }
      return `${name} holds a BSc in Computer Science and continuously learns through online courses and certifications.`;
    }
    const lines = [`${name}'s education:\n`];
    education.forEach((item) => lines.push(`- ${stripBullet(item)}`));
    return lines.join('\n');
  }

  /* 10. Work experience */
  if (
    /\b(work|job|company|employer|role|position|career|professional|akazi|umurimo|isera)\b/.test(msg)
  ) {
    if (experience.length === 0) {
      if (kinyarwanda) {
        return `${name} yakoze n'uko yakoresha umukoresha yuzuye mu bikorwa bitandukanye mu mujyi wa Kigali, Rwanda.`;
      }
      return `${name} has worked as a Full Stack Developer at various companies in Kigali, Rwanda.`;
    }
    const lines = [`${name}'s work experience:\n`];
    experience.forEach((item) => lines.push(`- ${stripBullet(item)}`));
    return lines.join('\n');
  }

  /* 11. Services */
  if (
    /\b(service|offer|provide|hire|freelance|available|serivisi|twakorera|dukorana)\b/.test(msg)
  ) {
    if (services.length === 0) {
      if (kinyarwanda) {
        return `${name} atanga serivisi z'uko yakora softiwe yuzuye, UI/UX Engineering, kwakora API, Kubaka Ububikoshinga, no kugenzura urubuga.`;
      }
      return `${name} offers Full Stack Development, UI/UX Engineering, API Development, Database Design, and website maintenance services.`;
    }
    const lines = [`${name} offers the following services:\n`];
    services.forEach((service) => {
      const match = /^- (.+?): (.+?) \[Price: (.+?)\]/.exec(service);
      if (match) {
        lines.push(`- **${match[1]}**: ${match[2]} — Starting at ${match[3]}`);
      } else {
        lines.push(`- ${stripBullet(service)}`);
      }
    });
    lines.push(
      '\n💡 *All prices are estimates based on market rates. Final pricing depends on your specific requirements. Free consultation available!*',
    );
    return lines.join('\n');
  }

  /* 12. Certificates */
  if (
    /\b(certificate|certification|award|achievement|accomplishment|ipeturo|ubushobozi)\b/.test(msg)
  ) {
    if (certs.length === 0 && achieve.length === 0) {
      if (kinyarwanda) {
        return `${name} afise ipeturo ryinshi mu kuba yakora softiwe yuzuye, React, n'ibindi bintu.`;
      }
      return `${name} holds multiple certifications in Full Stack Development, React, and other technologies.`;
    }
    const lines = [];
    if (certs.length > 0) {
      lines.push(`${name}'s certifications:\n`);
      certs.forEach((item) => lines.push(`- ${stripBullet(item)}`));
    }
    return lines.join('\n') || 'Please check the Certificates section for details!';
  }

  /* 13. Availability / hire */
  if (
    /\b(hire|avail|free|work together|collab|project|opportun|twarabana|twakorana|dushoboye|abikorwa)\b/.test(
      msg,
    )
  ) {
    let avail = '';
    Object.entries(sections).forEach(([key, sectionLines]) => {
      if (key.includes('availability')) {
        sectionLines.forEach((line) => {
          if (containsInsensitive(line, 'Availability Status:')) {
            avail = replaceExact(line, 'Availability Status: ');
          }
        });
      }
    });
    const availText = avail ? `Status: **${avail}**\n\n` : '';
    return `Yes! ${name} is **available for new projects and collaborations**.\n\n${availText}You can reach out via:\nEmail: cedrickrwa@gmail.com\n\nOr use the Contact section on this page!`;
  }

  /* 14. Who / about */
  if (
    /\b(who|about|introduc|tell me|describe|background|story|life|yourself|person|character|passion|dream|motivat|intore|ubwoko|bwose|amakuru)\b/.test(
      msg,
    )
  ) {
    const bio = (sections['personal bio'] ?? []).join(' ');
    const story = (sections['life story'] ?? []).join(' ');

    if (bio.trim() !== '' || story.trim() !== '') {
      let out = `**${name}** — Full Stack Software Developer from Kigali, Rwanda\n\n`;
      if (bio.trim() !== '') out += `${bio.trim()}\n\n`;
      if (story.trim() !== '') out += story.trim();
      return out;
    }

    const documentAnswer = answerFromDocuments();
    if (documentAnswer) return documentAnswer;

    return `**${name}** is a passionate Full Stack Software Developer from Kigali, Rwanda.\n\nHe specializes in building modern, scalable web applications and APIs. With 3+ years of experience, he delivers clean, user-friendly digital solutions using technologies like React, Node.js, PHP, MongoDB, and more.\n\nHe's available for freelance projects, collaborations, and full-time opportunities!`;
  }

  /* 15. Hobbies & interests */
  if (/\b(hobb|interest|like|enjoy|love|passion|free time|leisure|fun|sport)\b/.test(msg)) {
    const hobbies = (sections['hobbies & interests'] ?? []).join(' ');
    if (hobbies.trim() !== '') {
      return `**${name}'s hobbies & interests:**\n\n${hobbies.trim()}`;
    }
    return `${name} enjoys coding, building new projects, learning new technologies, and exploring creative ways to solve real-world problems!`;
  }

  /* 16. Goals & vision */
  if (/\b(goal|vision|future|plan|aspir|dream|aim|ambition)\b/.test(msg)) {
    const goals = (sections['goals & vision'] ?? []).join(' ');
    if (goals.trim() !== '') {
      return `**${name}'s goals & vision:**\n\n${goals.trim()}`;
    }
    return `${name} aims to build impactful software that solves real-world problems, grow as a full-stack engineer, and contribute to innovative tech projects globally.`;
  }

  /* 17. Fun facts */
  if (/\b(fun fact|interesting|surprising|unique|special|trivia)\b/.test(msg)) {
    const facts = (sections['fun facts'] ?? []).join(' ');
    if (facts.trim() !== '') {
      return `**Fun facts about ${name}:**\n\n${facts.trim()}`;
    }
    return `Here's a fun fact: ${name} can speak both English and Kinyarwanda fluently, and loves turning complex problems into elegant solutions!`;
  }

  /* 18. Uploaded training documents */
  const documentAnswer = answerFromDocuments();
  if (documentAnswer) return documentAnswer;

  /* 19. Default */
  return `I'm ${name}'s AI assistant! I can answer questions about:\n\n- **Life story & background**\n- **Skills & Technologies**\n- **Projects**\n- **Work Experience**\n- **Education & Certificates**\n- **Services offered**\n- **Hobbies & interests**\n- **Goals & vision**\n- **Contact information**\n\nWhat would you like to know about ${name}?`;
};

/* ------------------------------------------------------------------ *
 * EJOLABS provider (EJoAI API)
 * ------------------------------------------------------------------ */

const EJOLABS_URL = 'https://api.ejolabs.com/api/v1/subiza';
const EJOLABS_TIMEOUT_MS = 30000;

/**
 * Turns the flat RAG context into the `documents` payload the provider
 * expects for retrieved-context mode.
 */
export const buildDocuments = (context) => {
  const sections = parseSections(context);

  return Object.entries(sections)
    .filter(([, lines]) => lines.length > 0)
    .map(([name, lines], index) => ({
      id: `portfolio-${index + 1}`,
      source: name.replace(/\s+/g, '-'),
      text: lines.join('\n'),
    }));
};

const postToEjoLabs = async (apiKey, payload) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EJOLABS_TIMEOUT_MS);

  try {
    const response = await fetch(EJOLABS_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.status !== 200) {
      const body = await response.text().catch(() => '');
      console.error(`[ai] EJO Labs API error: HTTP ${response.status} - ${body.slice(0, 200)}`);
      return null;
    }

    const result = await response.json();
    // Retrieved-context mode answers with `answer`, chat mode with `choices`.
    return result?.answer ?? result?.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error('[ai] EJO Labs API error:', error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Calls EJOLABS. Retrieved-context mode is tried first (the portfolio
 * context is sent as documents); if the provider rejects it, the request is
 * retried as a plain chat turn with the context inlined in the system prompt.
 */
export const callEjoLabs = async (apiKey, options) => {
  const {
    messages = [],
    input = null,
    documents = [],
    temperature = 0.7,
    maxTokens = 2048,
    sessionId = null,
  } = options ?? {};

  const base = {
    temperature: Math.min(Math.max(Number(temperature) || 0.7, 0), 1),
    max_tokens: Math.min(Math.max(Number(maxTokens) || 2048, 1), 8192),
  };

  if (sessionId) base.session_id = sessionId;

  if (input && documents.length > 0) {
    const ragResponse = await postToEjoLabs(apiKey, {
      ...base,
      input,
      documents,
      messages,
    });
    if (ragResponse) return ragResponse;
  }

  return postToEjoLabs(apiKey, { ...base, messages });
};

/* ------------------------------------------------------------------ *
 * Orchestration
 * ------------------------------------------------------------------ */

export const getAiSettings = async () => {
  try {
    return await AiSetting.getAllMap();
  } catch {
    return {};
  }
};

export const resolveAiSettings = async () => {
  const aiSettings = await getAiSettings();
  const settings = await Setting.getAllMap();

  const merged = { ...settings, ...aiSettings };

  if (env.ejolabsApiKey && env.ejolabsApiKey !== 'ejolabs_placeholder_key_here') {
    merged.ejolabs_api_key = env.ejolabsApiKey;
  }

  merged.temperature = Number.parseFloat(merged.temperature ?? '0.7') || 0.7;
  merged.max_tokens = Number.parseInt(merged.max_tokens ?? '2048', 10) || 2048;
  merged.conversation_length = Number.parseInt(merged.conversation_length ?? '10', 10) || 10;
  merged.ai_enabled = merged.ai_enabled ?? '1';

  return merged;
};

/**
 * Full chat turn: builds the RAG context, calls EJOLABS and falls back to the
 * built-in intent engine when the provider is unavailable.
 */
export const runChatTurn = async ({
  message,
  history = [],
  sessionId,
  ipAddress = 'unknown',
  preferredLanguage = 'auto',
}) => {
  const aiSettings = await resolveAiSettings();

  if (aiSettings.ai_enabled !== '1') {
    const error = new Error('AI assistant is currently disabled');
    error.status = 503;
    throw error;
  }

  let context = await buildRAGContext();
  context = await appendPricingContext(context, aiSettings);

  const trainingContext = await buildTrainingContext();
  if (trainingContext) {
    context = `${context}\n\n${trainingContext}`;
  }

  const detectedLanguage =
    preferredLanguage === 'rw'
      ? 'kinyarwanda'
      : preferredLanguage === 'en'
        ? 'english'
        : detectLanguage(message);

  const systemPrompt = aiSettings.system_prompt?.trim()
    ? aiSettings.system_prompt
    : DEFAULT_SYSTEM_PROMPT;

  const systemContent =
    detectedLanguage === 'kinyarwanda'
      ? `${systemPrompt}\n\nIMPORTANT: The user is writing in Kinyarwanda. You MUST respond in Kinyarwanda (Ikinyarwanda). Use simple, clear Kinyarwanda that anyone can understand. If you need to use technical terms, you can keep them in English but explain them in Kinyarwanda.`
      : systemPrompt;

  // Persist the conversation (best effort - never blocks the reply).
  let conversationId = null;
  try {
    let conversation = await AiConversation.findOne({ session_id: sessionId, is_active: 1 });
    if (!conversation) {
      conversation = await AiConversation.create({ session_id: sessionId, ip_address: ipAddress });
    }
    conversationId = conversation._id;
    await AiMessage.create({ conversation_id: conversationId, role: 'user', content: message });
  } catch {
    /* conversation tracking is optional */
  }

  const messages = [
    { role: 'system', content: `${systemContent}\n\nHere is the portfolio context:\n\n${context}` },
  ];

  history.slice(-aiSettings.conversation_length).forEach((entry) => {
    if (!entry || !entry.role || !entry.content) return;
    messages.push({ role: entry.role, content: String(entry.content) });
  });

  messages.push({ role: 'user', content: message });

  let response = null;
  let provider = 'builtin';
  const startedAt = Date.now();

  const apiKey = aiSettings.ejolabs_api_key;
  if (apiKey && apiKey !== 'ejolabs_placeholder_key_here' && apiKey !== 'your_ejolabs_api_key_here') {
    response = await callEjoLabs(apiKey, {
      messages,
      input: message,
      documents: buildDocuments(context),
      temperature: aiSettings.temperature,
      maxTokens: aiSettings.max_tokens,
      sessionId,
    });
    if (response) provider = 'ejolabs';
  }

  if (!response) {
    response = builtinAIResponse(message, context, aiSettings, detectedLanguage);
    provider = 'builtin';
  }

  const latency = Date.now() - startedAt;

  if (conversationId) {
    try {
      await AiMessage.create({
        conversation_id: conversationId,
        role: 'assistant',
        content: response,
        provider,
        latency_ms: latency,
      });
      await AiConversation.updateOne({ _id: conversationId }, { $inc: { message_count: 1 } });
    } catch {
      /* ignore */
    }
  }

  return {
    response,
    provider,
    session_id: sessionId,
    language: detectedLanguage,
    latency_ms: latency,
  };
};

export default runChatTurn;
