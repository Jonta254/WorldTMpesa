import { useState } from "react";
import { createOrder } from "../services/orderService";

export default function Buy() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");

  const handleOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const order = {
      type: "buy",
      amount: Number(amount),
      wallet,
      phone: user?.phone,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const id = await createOrder(order);
    alert("Deposit submitted ✅ ID: " + id);
  };

  return (
    <div className="container">
      <h2>🟢 Buy WLD</h2>

      <input
        className="input"
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        className="input"
        placeholder="Wallet address"
        onChange={(e) => setWallet(e.target.value)}
      />

      <button className="btn" onClick={handleOrder}>
        Submit Deposit
      </button>
    </div>
  );
}
