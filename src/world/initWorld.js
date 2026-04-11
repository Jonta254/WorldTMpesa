import { MiniKit } from "@worldcoin/minikit-js";
import { WORLD_APP_ID } from "../config/world";

export const initWorld = () => {
  try {
    MiniKit.install(WORLD_APP_ID);
    console.log("World MiniKit initialized");
  } catch (e) {
    console.log("World init failed", e);
  }
};
