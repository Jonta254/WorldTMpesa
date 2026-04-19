import { APP_CONFIG, STORAGE_KEYS } from "../config/appConfig";
import { readStorage, writeStorage } from "./localStorage";

const RATE_UPDATED_EVENT = "worldtmpesa:rate-updated";

function emitRateUpdate(nextRate) {
  window.dispatchEvent(new CustomEvent(RATE_UPDATED_EVENT, { detail: nextRate }));
}

export function initializeSettings() {
  const settings = readStorage(STORAGE_KEYS.settings, null);

  if (!settings || typeof settings.rateKesPerWld !== "number") {
    writeStorage(STORAGE_KEYS.settings, {
      rateKesPerWld: APP_CONFIG.defaultRateKesPerWld,
    });
  }
}

export function getSettings() {
  return readStorage(STORAGE_KEYS.settings, {
    rateKesPerWld: APP_CONFIG.defaultRateKesPerWld,
  });
}

export function getExchangeRate() {
  return getSettings().rateKesPerWld || APP_CONFIG.defaultRateKesPerWld;
}

export function updateExchangeRate(nextRate) {
  const parsedRate = Number(nextRate);

  if (!parsedRate || parsedRate <= 0) {
    throw new Error("Enter a valid exchange rate above zero.");
  }

  const settings = {
    ...getSettings(),
    rateKesPerWld: parsedRate,
    updatedAt: new Date().toISOString(),
  };

  writeStorage(STORAGE_KEYS.settings, settings);
  emitRateUpdate(parsedRate);
  return settings.rateKesPerWld;
}

export function subscribeToRateUpdates(callback) {
  const handleRateUpdate = (event) => {
    callback(event.detail);
  };

  window.addEventListener(RATE_UPDATED_EVENT, handleRateUpdate);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(RATE_UPDATED_EVENT, handleRateUpdate);
    window.removeEventListener("storage", callback);
  };
}
