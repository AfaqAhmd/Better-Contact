import { safeReadResponse, extractPhoneDeep } from "./shared";

const PROSPEO_BASE_URL = "https://api.prospeo.io";

function isConfigured() {
  return Boolean(process.env.PROSPEO_API_KEY);
}

function buildPersonData(input) {
  const data = {};
  if (input.linkedinUrl) data.linkedin_url = input.linkedinUrl;
  if (input.email) data.email = input.email;
  if (input.fullName) data.full_name = input.fullName;
  if (input.companyDomain) data.company_website = input.companyDomain;
  if (input.companyName) data.company_name = input.companyName;
  return data;
}

// Prospeo's enrich-person endpoint requires linkedin_url, email, or (name + company)
// to find a match.
function hasEnoughIdentifiers(data) {
  if (data.linkedin_url || data.email) return true;
  return Boolean(data.full_name && (data.company_name || data.company_website));
}

async function lookupPhone(input) {
  const data = buildPersonData(input);
  if (!hasEnoughIdentifiers(data)) {
    return { found: false, phone: null, status: "skipped", reason: "insufficient_input", raw: null };
  }

  const response = await fetch(`${PROSPEO_BASE_URL}/enrich-person`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-KEY": process.env.PROSPEO_API_KEY,
    },
    body: JSON.stringify({
      data,
      enrich_mobile: true,
      only_verified_mobile: false,
    }),
    cache: "no-store",
  });

  const body = await safeReadResponse(response);
  if (!response.ok || body?.error) {
    return {
      found: false,
      phone: null,
      status: "error",
      reason: body?.error_code || "upstream_error",
      raw: body,
    };
  }

  const phone = extractPhoneDeep(body?.person?.mobile) || extractPhoneDeep(body?.person);
  return {
    found: Boolean(phone),
    phone,
    status: phone ? "found" : "not_found",
    reason: phone ? "found" : "not_found",
    raw: body,
  };
}

export default { name: "prospeo", isConfigured, lookupPhone };
