export const APP_CONFIG = {
  appName: "TMpesa",
  repoName: "WorldTMpesa",
  defaultSettings: {
    ratesKes: {
      WLD: 120,
      USDT: 128,
    },
    sellWalletAddress: "0xWORLDTMPESA-WLD-WALLET-001",
    mpesaPaybillNumber: "522522",
    mpesaTillName: "TMpesa Exchange",
    supportEmail: "brianokind02022@gmail.com",
    worldAppId: "",
  },
  supportedAssets: ["WLD", "USDT"],
  worldPaySupportedAssets: ["WLD"],
};

export const STORAGE_KEYS = {
  users: "worldtmpesa_users",
  currentUser: "worldtmpesa_current_user",
  orders: "worldtmpesa_orders",
  settings: "worldtmpesa_settings",
};
