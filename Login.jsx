import { MiniKit } from "@worldcoin/minikit-js";
import { WORLD_APP_ID } from "../config/world";

export default function WorldIdLogin() {

  const login = async () => {
    try {
      const res = await MiniKit.commandsAsync.verify({
        app_id: WORLD_APP_ID,
        action: "login",
        signal: "worldtmpesa-user"
      });

      if (res.success) {
        localStorage.setItem("user", JSON.stringify({
          worldId: res.nullifier_hash
        }));

        window.location.href = "/";
      }
    } catch (err) {
      console.log("World ID login failed", err);
      alert("Verification failed");
    }
  };

  return (
    <div className="container">
      <h2>🌍 World ID Verification</h2>
      <button className="btn" onClick={login}>
        Continue with World ID
      </button>
    </div>
  );
}
