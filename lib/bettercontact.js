const BETTERCONTACT_BASE_URL = "https://app.bettercontact.rocks/api/v2";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 120;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitName(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return {};
  }

  const trimmed = fullName.trim();
  if (!trimmed) {
    return {};
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { first_name: parts[0] };
  }

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  };
}

function extractPhone(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const seen = new WeakSet();
  const candidateKeys = new Set([
    "contact_phone_number",
    "contact_mobile_phone_number",
    "contact_phone",
    "contact_mobile_phone",
    "phone_number",
    "mobile_phone_number",
    "phone",
    "mobile_phone",
    "direct_phone",
    "work_phone",
    "phones",
    "phone_numbers",
  ]);

  function visit(value, keyHint = "") {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;

      // Better Contact can sometimes return placeholders like "Secret phone provider"
      // under fields that include the word "phone". Only accept values that look
      // like an actual phone number.
      const hasLetters = /[A-Za-z]/.test(trimmed);
      const digits = trimmed.replace(/\D/g, "");
      const looksLikePhone = !hasLetters && digits.length >= 7;
      if (looksLikePhone) return trimmed;
      return null;
    }

    if (!value || typeof value !== "object") {
      return null;
    }

    if (seen.has(value)) return null;
    seen.add(value);

    if (Array.isArray(value)) {
      for (const entry of value) {
        const found = visit(entry, keyHint);
        if (found) return found;
      }
      return null;
    }

    for (const [key, nestedValue] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      if (candidateKeys.has(normalizedKey) || normalizedKey.includes("phone")) {
        const found = visit(nestedValue, normalizedKey);
        if (found) return found;
      }
    }

    for (const [key, nestedValue] of Object.entries(value)) {
      const found = visit(nestedValue, key);
      if (found) return found;
    }

    return null;
  }

  return visit(item);
}

function normalizeInput(body) {
  const source = body && typeof body === "object" ? body : {};

  const asString = (value) => {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    return undefined;
  };

  return {
    fullName: asString(source.fullName),
    email: asString(source.email),
    linkedinUrl: asString(source.linkedinUrl),
    companyDomain: asString(source.companyDomain),
    companyName: asString(source.companyName),
  };
}

function buildAsyncCreatePayload(input) {
  const { first_name, last_name } = splitName(input.fullName);

  return {
    data: [
      {
        first_name,
        last_name,
        email: input.email,
        linkedin_url: input.linkedinUrl,
        company_domain: input.companyDomain,
        company: input.companyName,
      },
    ],
    enrich_email_address: false,
    enrich_phone_number: true,
  };
}

function findPhoneFromPollResponse(raw) {
  const directPhone = extractPhone(raw);
  if (directPhone) {
    return directPhone;
  }

  const buckets = [raw?.data, raw?.result, raw?.items];

  for (const bucket of buckets) {
    if (Array.isArray(bucket)) {
      for (const item of bucket) {
        const phone = extractPhone(item);
        if (phone) {
          return phone;
        }
      }
      continue;
    }

    const phone = extractPhone(bucket);
    if (phone) {
      return phone;
    }
  }

  return null;
}

export {
  BETTERCONTACT_BASE_URL,
  POLL_INTERVAL_MS,
  MAX_POLL_ATTEMPTS,
  sleep,
  splitName,
  extractPhone,
  normalizeInput,
  buildAsyncCreatePayload,
  findPhoneFromPollResponse,
};
