import { useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

function SafeMiniKitProvider({ children }) {
  useEffect(() => {
    try {
      MiniKit.install();
    } catch (error) {
      console.warn("MiniKit install failed", error);
    }
  }, []);

  return children;
}

export default SafeMiniKitProvider;
