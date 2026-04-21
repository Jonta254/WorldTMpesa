export function createServerNonce(length = 24) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function getWorldPortalConfig() {
  return {
    appId: process.env.APP_ID || "",
    apiKey: process.env.DEV_PORTAL_API_KEY || "",
  };
}

export function hasWorldPortalConfig() {
  const config = getWorldPortalConfig();
  return Boolean(config.appId && config.apiKey);
}
