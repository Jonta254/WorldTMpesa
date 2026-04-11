import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [phone, setPhone] = useState("");
  const nav = useNavigate();

  const login = () => {
    localStorage.setItem("user", JSON.stringify({ phone }));
    nav("/");
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input className="input" onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
      <button className="btn" onClick={login}>Login</button>
    </div>
  );
}
