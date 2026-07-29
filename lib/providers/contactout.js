import { safeReadResponse, extractPhoneDeep } from "./shared";

const CONTACTOUT_BASE_URL = "https://api.contactout.com";

function isConfigured() {
  return Boolean(process.env.CONTACTOUT_API_KEY);
}

async function lookupPhone(input) {
  let url;
  if (input.linkedinUrl) {
    url = `${CONTACTOUT_BASE_URL}/v1/people/linkedin?profile=${encodeURIComponent(input.linkedinUrl)}&include_phone=true`;
  } else if (input.email) {
    url = `${CONTACTOUT_BASE_URL}/v1/email/enrich?email=${encodeURIComponent(input.email)}`;
  } else {
    return { found: false, phone: null, status: "skipped", reason: "insufficient_input", raw: null };
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      token: process.env.CONTACTOUT_API_KEY,
      authorization: "basic",
    },
    cache: "no-store",
  });

  const body = await safeReadResponse(response);
  if (!response.ok) {
    return { found: false, phone: null, status: "error", reason: "upstream_error", raw: body };
  }

  const phone = extractPhoneDeep(body?.profile);
  return {
    found: Boolean(phone),
    phone,
    status: phone ? "found" : "not_found",
    reason: phone ? "found" : "not_found",
    raw: body,
  };
}

export default { name: "contactout", isConfigured, lookupPhone };
