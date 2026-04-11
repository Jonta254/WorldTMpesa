import { useState } from "react";

export default function Sell() {
  const [amount, setAmount] = useState("");
  const rate = 120;

  return (
    <div className="container">
      <h2>💸 Sell $WLD</h2>
      <input className="input" placeholder="Amount" onChange={e=>setAmount(e.target.value)} />
      <div className="card">You get: {amount * rate || 0} KES</div>
      <button className="btn">Place Sell Order</button>
    </div>
  );
}
