import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

function SafeMiniKitProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      MiniKit.install();
    } catch (error) {
      console.warn("MiniKit install failed", error);
    } finally {
      setReady(true);
    }
  }, []);

  return <>{ready ? children : children}</>;
}

export default SafeMiniKitProvider;
