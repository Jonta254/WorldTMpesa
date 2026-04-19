import { STORAGE_KEYS } from "../config/appConfig";
import { readStorage, removeStorage, writeStorage } from "./localStorage";

const seedAdminUser = {
  id: "admin-001",
  fullName: "WorldTMpesa Admin",
  phone: "0700000000",
  password: "admin123",
  walletAddress: "",
  username: "tmpesa-admin",
  authMethod: "local",
  isAdmin: true,
  createdAt: new Date().toISOString(),
};

export function initializeUsers() {
  const users = readStorage(STORAGE_KEYS.users, []);
  if (!users.some((user) => user.id === seedAdminUser.id)) {
    writeStorage(STORAGE_KEYS.users, [seedAdminUser, ...users]);
  }
}

export function getUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

export function getCurrentUser() {
  return readStorage(STORAGE_KEYS.currentUser, null);
}

export function signupUser(payload) {
  const users = getUsers();
  const exists = users.some((user) => user.phone === payload.phone);

  if (exists) {
    throw new Error("A user with that phone number already exists.");
  }

  const user = {
    id: crypto.randomUUID(),
    fullName: payload.fullName,
    phone: payload.phone,
    password: payload.password,
    walletAddress: "",
    username: "",
    authMethod: "local",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  writeStorage(STORAGE_KEYS.users, [...users, user]);
  writeStorage(STORAGE_KEYS.currentUser, user);
  return user;
}

export function loginUser({ phone, password }) {
  const user = getUsers().find((entry) => entry.phone === phone && entry.password === password);

  if (!user) {
    throw new Error("Invalid phone number or password.");
  }

  writeStorage(STORAGE_KEYS.currentUser, user);
  return user;
}

export function loginWithWorldApp(profile) {
  const users = getUsers();
  const existingUser = users.find((entry) => entry.walletAddress === profile.walletAddress);
  const user = {
    id: existingUser?.id || crypto.randomUUID(),
    fullName: profile.fullName || profile.username || "World App user",
    phone: existingUser?.phone || "",
    password: existingUser?.password || "",
    walletAddress: profile.walletAddress,
    username: profile.username || existingUser?.username || "",
    authMethod: "world-app",
    preferredCurrency: profile.preferredCurrency || "KES",
    worldAppVersion: profile.worldAppVersion || null,
    isAdmin: existingUser?.isAdmin || false,
    createdAt: existingUser?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const nextUsers = existingUser
    ? users.map((entry) => (entry.id === existingUser.id ? user : entry))
    : [...users, user];

  writeStorage(STORAGE_KEYS.users, nextUsers);
  writeStorage(STORAGE_KEYS.currentUser, user);
  return user;
}

export function logoutUser() {
  removeStorage(STORAGE_KEYS.currentUser);
}
