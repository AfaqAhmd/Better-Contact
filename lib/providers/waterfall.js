import bettercontact from "./bettercontact";
import prospeo from "./prospeo";
import contactout from "./contactout";

const PROVIDERS = { bettercontact, prospeo, contactout };
const DEFAULT_ORDER = ["bettercontact", "prospeo", "contactout"];

// PROVIDER_ORDER env var lets the sequence be changed without a redeploy,
// e.g. PROVIDER_ORDER=prospeo,bettercontact,contactout
function resolveProviderOrder() {
  const configuredOrder = String(process.env.PROVIDER_ORDER || "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

  const order = configuredOrder.length ? configuredOrder : DEFAULT_ORDER;
  return order.filter((name) => Boolean(PROVIDERS[name]));
}

function configuredProviderNames() {
  return resolveProviderOrder().filter((name) => PROVIDERS[name].isConfigured());
}

// Tries each provider in order, stopping at the first one that returns a phone.
async function lookupPhoneWaterfall(input) {
  const order = resolveProviderOrder();
  const attempts = [];

  for (const name of order) {
    const provider = PROVIDERS[name];

    if (!provider.isConfigured()) {
      attempts.push({ provider: name, found: false, status: "skipped", reason: "not_configured" });
      continue;
    }

    try {
      const result = await provider.lookupPhone(input);
      attempts.push({ provider: name, ...result });

      if (result.found && result.phone) {
        return {
          found: true,
          phone: result.phone,
          provider: name,
          status: result.status,
          reason: result.reason,
          requestId: result.requestId,
          attempts,
        };
      }
    } catch (error) {
      attempts.push({
        provider: name,
        found: false,
        status: "error",
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const last = attempts[attempts.length - 1];
  return {
    found: false,
    phone: null,
    provider: null,
    status: last?.status || "not_found",
    reason: last?.reason || "not_found",
    requestId: last?.requestId,
    attempts,
  };
}

export { resolveProviderOrder, configuredProviderNames, lookupPhoneWaterfall };
