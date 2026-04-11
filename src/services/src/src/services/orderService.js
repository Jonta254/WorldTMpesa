import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export const createOrder = async (order) => {
  const ref = await addDoc(collection(db, "orders"), order);
  return ref.id;
};

export const getUserOrders = async (phone) => {
  const q = query(collection(db, "orders"), where("phone", "==", phone));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllOrders = async () => {
  const snap = await getDocs(collection(db, "orders"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
