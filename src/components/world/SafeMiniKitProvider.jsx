import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";

function SafeMiniKitProvider({ children }) {
  return <MiniKitProvider>{children}</MiniKitProvider>;
}

export default SafeMiniKitProvider;
