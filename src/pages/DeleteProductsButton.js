import React from "react";
import { collection, getDocs, limit, query, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";

export default function DeleteProductsButton() {
  const deleteAllProducts = async () => {
    const ok = window.confirm("Products collection ka sara data delete karna hai?");
    if (!ok) return;

    try {
      while (true) {
        const q = query(collection(db, "products"), limit(400));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          alert("Products collection ka sara data delete ho gaya.");
          break;
        }

        const batch = writeBatch(db);

        snapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });

        await batch.commit();

        if (snapshot.size < 400) {
          alert("Products collection ka sara data delete ho gaya.");
          break;
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed: " + error.message);
    }
  };

  return (
    <button
      onClick={deleteAllProducts}
      style={{
        background: "red",
        color: "white",
        padding: "12px 18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Delete All Products
    </button>
  );
}