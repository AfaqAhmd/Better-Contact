import {
  BETTERCONTACT_BASE_URL,
  POLL_INTERVAL_MS,
  MAX_POLL_ATTEMPTS,
  sleep,
  normalizeInput,
  buildAsyncCreatePayload,
  findPhoneFromPollResponse,
} from "../../../lib/bettercontact";

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

function jsonResponse(body, status = 200) {
  return Response.json(body, { status });
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function safeReadResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

export async function POST(request) {
  try {
    const pollIntervalMs = toPositiveInt(process.env.BETTERCONTACT_POLL_INTERVAL_MS, POLL_INTERVAL_MS);
    const maxPollAttempts = toPositiveInt(process.env.BETTERCONTACT_MAX_POLL_ATTEMPTS, MAX_POLL_ATTEMPTS);

    if (!process.env.BETTERCONTACT_API_KEY) {
      return jsonResponse(
        {
          success: false,
          code: "CONFIG_ERROR",
          error: "Missing BETTERCONTACT_API_KEY on server.",
        },
        500,
      );
    }

    const input = normalizeInput(await request.json());
    if (!input.fullName && !input.email && !input.linkedinUrl) {
      return jsonResponse(
        {
          success: false,
          code: "INVALID_INPUT",
          error: "Provide at least fullName, email, or linkedinUrl.",
        },
        400,
      );
    }

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
      return jsonResponse(
        {
          success: false,
          code: "UPSTREAM_ERROR",
          error: "Failed to create Better Contact async request.",
          details: createData,
        },
        502,
      );
    }

    const requestId = createData?.request_id || createData?.id;
    if (!requestId) {
      return jsonResponse(
        {
          success: false,
          code: "UPSTREAM_ERROR",
          error: "Better Contact response did not include request id.",
          details: createData,
        },
        502,
      );
    }

    let lastPollData = null;
    for (let attempt = 1; attempt <= maxPollAttempts; attempt += 1) {
      const pollResponse = await fetch(`${BETTERCONTACT_BASE_URL}/async/${requestId}`, {
        method: "GET",
        headers: {
          "X-API-Key": process.env.BETTERCONTACT_API_KEY,
        },
        cache: "no-store",
      });

      const pollData = await safeReadResponse(pollResponse);
      if (!pollResponse.ok) {
        return jsonResponse(
          {
            success: false,
            code: "UPSTREAM_ERROR",
            error: "Better Contact polling failed.",
            requestId,
            details: pollData,
          },
          502,
        );
      }

      lastPollData = pollData;
      const status = String(pollData?.status || "").toLowerCase();
      const phone = findPhoneFromPollResponse(pollData);

      // Return early whenever a phone is present, even if status labels vary.
      if (phone) {
        return jsonResponse({
          success: true,
          found: true,
          phone,
          status: pollData?.status || "terminated",
          requestId,
          raw: pollData,
        });
      }

      if (TERMINAL_STATUSES.has(status)) {
        return jsonResponse({
          success: true,
          found: false,
          phone: null,
          status: pollData?.status || "terminated",
          requestId,
          raw: pollData,
        });
      }

      if (attempt < maxPollAttempts) {
        await sleep(pollIntervalMs);
      }
    }

    return jsonResponse(
      {
        success: false,
        code: "TIMEOUT",
        error: "Timed out waiting for Better Contact async result. Try again or increase BETTERCONTACT_MAX_POLL_ATTEMPTS.",
        requestId,
        details: lastPollData,
      },
      504,
    );
  } catch (error) {
    return jsonResponse(
      {
        success: false,
        code: "INTERNAL_ERROR",
        error: "Unexpected server error.",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}
