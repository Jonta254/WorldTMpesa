import { useEffect, useState } from "react";
import { getExchangeRate, getExchangeRates, subscribeToRateUpdates } from "../services";

export function useExchangeRate(asset = "WLD") {
  const [exchangeRate, setExchangeRate] = useState(getExchangeRate(asset));

  useEffect(() => {
    const unsubscribe = subscribeToRateUpdates(() => {
      setExchangeRate(getExchangeRate(asset));
    });

    return unsubscribe;
  }, [asset]);

  return exchangeRate;
}

export function useExchangeRates() {
  const [exchangeRates, setExchangeRates] = useState(getExchangeRates());

  useEffect(() => {
    const unsubscribe = subscribeToRateUpdates(() => {
      setExchangeRates(getExchangeRates());
    });

    return unsubscribe;
  }, []);

  return exchangeRates;
}
