import { useEffect, useState } from "react";
import { getExchangeRate, subscribeToRateUpdates } from "../services";

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState(getExchangeRate());

  useEffect(() => {
    const unsubscribe = subscribeToRateUpdates(() => {
      setExchangeRate(getExchangeRate());
    });

    return unsubscribe;
  }, []);

  return exchangeRate;
}
