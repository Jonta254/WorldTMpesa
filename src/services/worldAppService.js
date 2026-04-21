import { MiniKit } from "@worldcoin/minikit-js";
import { APP_CONFIG } from "../config/appConfig";
import {
  completeSiweVerification,
  confirmWorldPayment,
  createPaymentReference,
  requestServerNonce,
} from "./backendService";
import { getSettings } from "./settingsService";

const TOKEN_DECIMALS = {
  WLD: 18,
  USDT: 6,
};

function toTokenUnits(amount, decimals) {
  const stringAmount = String(amount).trim();

  if (!/^\d+(\.\d+)?$/.test(stringAmount)) {
    throw new Error("Enter a valid amount before sending the payment.");
  }

  const [wholePart, fractionPart = ""] = stringAmount.split(".");
  const normalizedFraction = `${fractionPart}${"0".repeat(decimals)}`.slice(0, decimals);
  const units = `${wholePart}${normalizedFraction}`.replace(/^0+(?=\d)/, "");

  return units || "0";
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

  const { nonce } = await requestServerNonce();
  const result = await MiniKit.walletAuth({
    nonce,
    statement: "Sign in to TMpesa inside World App",
    expirationTime: new Date(Date.now() + 1000 * 60 * 10),
  });

  if (result.executedWith === "fallback") {
    throw new Error("Wallet authentication fell back to the browser flow.");
  }

  const verification = await completeSiweVerification(result.data, nonce);

  if (!verification.isValid) {
    throw new Error("Wallet authentication could not be verified by the backend.");
  }

  let resolvedUser = MiniKit.user;

  if (!resolvedUser?.username && verification.address) {
    try {
      resolvedUser = await MiniKit.getUserByAddress(verification.address);
    } catch {
      resolvedUser = MiniKit.user;
    }
  }

  return {
    walletAddress: verification.address || result.data.address,
    signature: result.data.signature,
    nonce,
    username: resolvedUser?.username || "",
    fullName: resolvedUser?.username || "World App user",
    preferredCurrency: MiniKit.user?.preferredCurrency || "KES",
    worldAppVersion: MiniKit.deviceProperties?.worldAppVersion || null,
  };
}

export function canUseWorldPay(asset) {
  return APP_CONFIG.worldPaySupportedAssets.includes(asset);
}

export function buildWorldAppDeeplink(path = "/") {
  const appId = getSettings().worldAppId;

  if (!appId) {
    return "";
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `https://world.org/mini-app?app_id=${encodeURIComponent(appId)}&path=${encodeURIComponent(normalizedPath)}`;
}

export async function requestWorldPayment({ amount, asset = "WLD", description, to }) {
  if (!MiniKit.isInstalled()) {
    throw new Error("Open TMpesa inside World App to send WLD without leaving the mini app.");
  }

  if (!canUseWorldPay(asset)) {
    throw new Error(`${asset} payments inside TMpesa are not enabled yet.`);
  }

  if (!to?.trim()) {
    throw new Error("Set the sell wallet address in the admin dashboard before using in-app send.");
  }

  const paymentReference = (await createPaymentReference()).reference;

  const result = await MiniKit.pay({
    reference: paymentReference,
    to: to.trim(),
    tokens: [
      {
        symbol: asset,
        token_amount: toTokenUnits(amount, TOKEN_DECIMALS[asset] || 18),
      },
    ],
    description,
    fallback: () => undefined,
  });

  if (result.executedWith === "fallback") {
    throw new Error("This payment needs to be completed inside World App.");
  }

  const confirmation = await confirmWorldPayment(result.data);

  return {
    chain: result.data.chain,
    from: result.data.from,
    reference: result.data.reference,
    timestamp: result.data.timestamp,
    transactionId: result.data.transactionId,
    verified: confirmation.verified,
    transactionStatus: confirmation.transactionStatus,
  };
}
