import { MiniKit } from "@worldcoin/minikit-js";

function createNonce(length = 16) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function getWorldAppContext() {
  const isBrowser = typeof window !== "undefined";
  const fallbackWorldApp = isBrowser ? window.WorldApp : null;

  try {
    return {
      isInstalled: MiniKit.isInstalled(),
      user: MiniKit.user || fallbackWorldApp?.user || null,
      deviceProperties: MiniKit.deviceProperties || fallbackWorldApp?.deviceProperties || null,
      location: MiniKit.location || fallbackWorldApp?.location || null,
    };
  } catch {
    return {
      isInstalled: Boolean(fallbackWorldApp),
      user: fallbackWorldApp?.user || null,
      deviceProperties: fallbackWorldApp?.deviceProperties || null,
      location: fallbackWorldApp?.location || null,
    };
  }
}

export async function connectWithWorldAppWallet() {
  if (!MiniKit.isInstalled()) {
    throw new Error("Open this app inside World App to continue with wallet authentication.");
  }

  const nonce = createNonce();
  const result = await MiniKit.walletAuth({
    nonce,
    statement: "Sign in to TMpesa inside World App",
    expirationTime: new Date(Date.now() + 1000 * 60 * 10),
  });

  if (result.executedWith === "fallback") {
    throw new Error("Wallet authentication fell back to the browser flow.");
  }

  return {
    walletAddress: result.data.address,
    signature: result.data.signature,
    nonce,
    username: MiniKit.user?.username || "",
    fullName: MiniKit.user?.username || "World App user",
    preferredCurrency: MiniKit.user?.preferredCurrency || "KES",
    worldAppVersion: MiniKit.deviceProperties?.worldAppVersion || null,
  };
}
