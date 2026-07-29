import { normalizeInput, sleep } from "../../../lib/bettercontact";
import { configuredProviderNames, lookupPhoneWaterfall } from "../../../lib/providers/waterfall";

function jsonResponse(body, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request) {
  try {
    const isFreezeEnabled = String(process.env.BETTERCONTACT_FREEZE || "").toLowerCase() === "true";

    if (!isFreezeEnabled && configuredProviderNames().length === 0) {
      return jsonResponse(
        {
          success: false,
          code: "CONFIG_ERROR",
          error: "Missing API_KEYs on server.",
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

    // Freeze/mock mode (for testing the UI animation without calling any provider).
    if (isFreezeEnabled) {
      const mode = String(process.env.BETTERCONTACT_FREEZE_MODE || "found").toLowerCase();
      const delayMs = Number.parseInt(String(process.env.BETTERCONTACT_FREEZE_DELAY_MS || "12000"), 10);
      const phone =
        process.env.BETTERCONTACT_FREEZE_PHONE || "+1 (555) 123-4567";

      const requestId = `FREEZE_${Date.now().toString(36)}`;

      await sleep(Number.isFinite(delayMs) && delayMs > 0 ? delayMs : 12000);

      const found = mode !== "not_found" && mode !== "none" && mode !== "false";
      return jsonResponse({
        success: true,
        found,
        phone: found ? phone : null,
        status: "terminated",
        reason: found ? "found" : "not_found",
        provider: found ? "freeze" : null,
        requestId,
        raw: {
          mocked: true,
          mode,
          input,
        },
      });
    }

    // Waterfall: tries BetterContact, then Prospeo, then ContactOut (order configurable
    // via PROVIDER_ORDER), stopping at the first one that returns a phone.
    const result = await lookupPhoneWaterfall(input);

    return jsonResponse({
      success: true,
      found: result.found,
      phone: result.phone,
      status: result.status,
      reason: result.reason,
      provider: result.provider,
      requestId: result.requestId,
      raw: result.attempts,
    });
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
