import {
  BETTERCONTACT_BASE_URL,
  POLL_INTERVAL_MS,
  MAX_POLL_ATTEMPTS,
  sleep,
  buildAsyncCreatePayload,
  findPhoneFromPollResponse,
} from "../bettercontact";
import { safeReadResponse } from "./shared";

const TERMINAL_STATUSES = new Set([
  "completed",
  "terminated",
  "done",
  "success",
  "finished",
  "failed",
  "error",
  "not_found",
  "no_data",
  "cancelled",
  "canceled",
]);

function isConfigured() {
  return Boolean(process.env.BETTERCONTACT_API_KEY);
}

function hasResultPayload(pollData) {
  if (!pollData || typeof pollData !== "object") return false;
  return (
    typeof pollData.data !== "undefined" ||
    typeof pollData.result !== "undefined" ||
    typeof pollData.items !== "undefined"
  );
}

async function lookupPhone(input) {
  const createPayload = buildAsyncCreatePayload(input);

  const createResponse = await fetch(`${BETTERCONTACT_BASE_URL}/async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.BETTERCONTACT_API_KEY,
    },
    body: JSON.stringify(createPayload),
    cache: "no-store",
  });

  const createData = await safeReadResponse(createResponse);
  if (!createResponse.ok) {
    return { found: false, phone: null, status: "error", reason: "upstream_error", raw: createData };
  }

  const requestId = createData?.request_id || createData?.id;
  if (!requestId) {
    return { found: false, phone: null, status: "error", reason: "missing_request_id", raw: createData };
  }

  let lastPollData = null;
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
    const pollResponse = await fetch(`${BETTERCONTACT_BASE_URL}/async/${requestId}`, {
      method: "GET",
      headers: {
        "X-API-Key": process.env.BETTERCONTACT_API_KEY,
      },
      cache: "no-store",
    });

    const pollData = await safeReadResponse(pollResponse);
    if (!pollResponse.ok) {
      return { found: false, phone: null, status: "error", reason: "poll_failed", requestId, raw: pollData };
    }

    lastPollData = pollData;
    const status = String(pollData?.status || "").toLowerCase();
    const phone = findPhoneFromPollResponse(pollData);

    if (phone) {
      return {
        found: true,
        phone,
        status: pollData?.status || "terminated",
        reason: "found",
        requestId,
        raw: pollData,
      };
    }

    if (TERMINAL_STATUSES.has(status)) {
      return {
        found: false,
        phone: null,
        status: pollData?.status || "terminated",
        reason: "not_found",
        requestId,
        raw: pollData,
      };
    }

    if (attempt < MAX_POLL_ATTEMPTS) {
      await sleep(POLL_INTERVAL_MS);
    }
  }

  if (hasResultPayload(lastPollData)) {
    return {
      found: false,
      phone: null,
      status: lastPollData?.status || "unknown",
      reason: "not_found",
      requestId,
      raw: lastPollData,
    };
  }

  return {
    found: false,
    phone: null,
    status: lastPollData?.status || "pending",
    reason: "poll_window_ended",
    requestId,
    raw: lastPollData || {},
  };
}

export default { name: "bettercontact", isConfigured, lookupPhone };
