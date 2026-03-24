const BETTERCONTACT_BASE_URL = "https://app.bettercontact.rocks/api/v2";
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 20;

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

  const candidates = [
    item.contact_phone_number,
    item.contact_mobile_phone_number,
    item.contact_phone,
    item.contact_mobile_phone,
    item.phone_number,
    item.mobile_phone_number,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
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
