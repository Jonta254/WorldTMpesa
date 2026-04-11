import { db } from "./firebase";
import { collection, addDoc, doc, updateDoc, getDocs } from "firebase/firestore";

export const createOrder = async (order) => {
  const ref = await addDoc(collection(db, "orders"), order);
  return ref.id;
};

export const updateOrder = async (id, data) => {
  await updateDoc(doc(db, "orders", id), data);
};

export const getAllOrders = async () => {
  const snap = await getDocs(collection(db, "orders"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
