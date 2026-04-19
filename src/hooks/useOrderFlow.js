import { useMemo, useState } from "react";
import { APP_CONFIG, createOrder, updateOrder } from "../services";

export function useOrderFlow(type, initialAsset = "WLD") {
  const [asset, setAsset] = useState(initialAsset);
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [step, setStep] = useState(1);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [error, setError] = useState("");

  const kesAmount = useMemo(() => {
    const parsedAmount = Number(cryptoAmount);
    if (!parsedAmount || parsedAmount < 0) {
      return 0;
    }

    return parsedAmount * APP_CONFIG.rateKesPerWld;
  }, [cryptoAmount]);

  const placeOrder = () => {
    setError("");

    if (!cryptoAmount || Number(cryptoAmount) <= 0) {
      setError("Enter a valid crypto amount before placing your order.");
      return null;
    }

    if (type === "buy" && !walletAddress.trim()) {
      setError("Enter the wallet address that should receive the crypto.");
      return null;
    }

    const order = createOrder({
      type,
      asset,
      cryptoAmount,
      kesAmount,
      walletAddress: walletAddress.trim(),
    });

    setCurrentOrder(order);
    setStep(2);
    return order;
  };

  const markAsPaid = (nextReference) => {
    setError("");

    if (!nextReference.trim()) {
      setError(
        type === "sell"
          ? "Enter the blockchain transaction hash before continuing."
          : "Enter the M-Pesa transaction code before submitting.",
      );
      return null;
    }

    const formattedReference =
      type === "buy" ? nextReference.trim().toUpperCase() : nextReference.trim();
    const updated = updateOrder(currentOrder.id, {
      paymentReference: formattedReference,
      status: "paid",
    });

    setPaymentReference(formattedReference);
    setCurrentOrder(updated);
    setStep(3);
    return updated;
  };

  return {
    asset,
    setAsset,
    cryptoAmount,
    setCryptoAmount,
    walletAddress,
    setWalletAddress,
    paymentReference,
    setPaymentReference,
    step,
    currentOrder,
    error,
    kesAmount,
    placeOrder,
    markAsPaid,
    supportedAssets: APP_CONFIG.supportedAssets,
  };
}
