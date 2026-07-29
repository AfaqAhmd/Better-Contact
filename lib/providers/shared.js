async function safeReadResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

// Recursively searches an API response for a field whose key mentions "phone" or
// "mobile" and whose value looks like a real phone number (not a masked/placeholder
// string). Shared across providers since each returns phone data under a different
// shape (e.g. Prospeo nests it under person.mobile.mobile, ContactOut under profile.phone).
function extractPhoneDeep(value, seen = new WeakSet()) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const hasLetters = /[A-Za-z]/.test(trimmed);
    const digits = trimmed.replace(/\D/g, "");
    const looksLikePhone = !hasLetters && digits.length >= 7;
    return looksLikePhone ? trimmed : null;
  }

  if (!value || typeof value !== "object") return null;
  if (seen.has(value)) return null;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = extractPhoneDeep(entry, seen);
      if (found) return found;
    }
    return null;
  }

  const entries = Object.entries(value);

  for (const [key, nested] of entries) {
    if (/phone|mobile/i.test(key)) {
      const found = extractPhoneDeep(nested, seen);
      if (found) return found;
    }
  }

  for (const [key, nested] of entries) {
    if (/phone|mobile/i.test(key)) continue;
    const found = extractPhoneDeep(nested, seen);
    if (found) return found;
  }

  return null;
}

export { safeReadResponse, extractPhoneDeep };
