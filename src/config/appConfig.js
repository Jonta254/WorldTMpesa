export const APP_CONFIG = {
  appName: "TMpesa",
  repoName: "WorldTMpesa",
  defaultSettings: {
    ratesKes: {
      WLD: 120,
      USDT: 128,
    },
    sellWalletAddress: "0x0f029f35a9da4043ff84b2c98a023d0a68eb64b4",
    mpesaPaybillNumber: "5698981",
    mpesaTillName: "TMpesa Exchange",
    supportEmail: "brianokindo2022@gmail.com",
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
