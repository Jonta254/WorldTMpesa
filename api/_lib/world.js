const WORLD_APP_ID = "app_02bd6decc052fc1dfa29487444f6c6f";

export function createServerNonce(length = 24) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function getWorldPortalConfig() {
  return {
    appId: process.env.APP_ID || WORLD_APP_ID,
    apiKey: process.env.DEV_PORTAL_API_KEY || "",
  };
}

export function hasWorldPortalConfig() {
  const config = getWorldPortalConfig();
  return Boolean(config.appId && config.apiKey);
}
