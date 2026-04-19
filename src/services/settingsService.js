import { APP_CONFIG, STORAGE_KEYS } from "../config/appConfig";
import { readStorage, writeStorage } from "./localStorage";

const RATE_UPDATED_EVENT = "worldtmpesa:rate-updated";

function emitRateUpdate(nextRate) {
  window.dispatchEvent(new CustomEvent(RATE_UPDATED_EVENT, { detail: nextRate }));
}

export function initializeSettings() {
  const settings = readStorage(STORAGE_KEYS.settings, null);

  if (!settings || !settings.ratesKes) {
    writeStorage(STORAGE_KEYS.settings, {
      ratesKes: APP_CONFIG.defaultRatesKes,
    });
    return;
  }

  if (typeof settings.rateKesPerWld === "number" && !settings.ratesKes.WLD) {
    writeStorage(STORAGE_KEYS.settings, {
      ratesKes: {
        ...APP_CONFIG.defaultRatesKes,
        WLD: settings.rateKesPerWld,
      },
      updatedAt: settings.updatedAt || new Date().toISOString(),
    });
  }
}

export function getSettings() {
  return readStorage(STORAGE_KEYS.settings, {
    ratesKes: APP_CONFIG.defaultRatesKes,
  });
}

export function getExchangeRates() {
  const settings = getSettings();

  return {
    ...APP_CONFIG.defaultRatesKes,
    ...(settings.ratesKes || {}),
  };
}

export function getExchangeRate(asset = "WLD") {
  return getExchangeRates()[asset] || APP_CONFIG.defaultRatesKes[asset] || 0;
}

export function updateExchangeRates(nextRates) {
  const parsedRates = Object.entries(nextRates).reduce((accumulator, [asset, value]) => {
    const parsedRate = Number(value);

    if (!parsedRate || parsedRate <= 0) {
      throw new Error(`Enter a valid exchange rate above zero for ${asset}.`);
    }

    accumulator[asset] = parsedRate;
    return accumulator;
  }, {});

  const previousSettings = getSettings();

  const settings = {
    ...previousSettings,
    ratesKes: {
      ...APP_CONFIG.defaultRatesKes,
      ...(previousSettings.ratesKes || {}),
      ...parsedRates,
    },
    updatedAt: new Date().toISOString(),
  };

  writeStorage(STORAGE_KEYS.settings, settings);
  emitRateUpdate(settings.ratesKes);
  return settings.ratesKes;
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
