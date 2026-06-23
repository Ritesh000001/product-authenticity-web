


// Perplexity code




import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import QRCode from "qrcode";

function Labels() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      const q = query(
        collection(db, "batches"),
        where("companyId", "==", user.uid),
        where("status", "==", "approved")
      );

      const snap = await getDocs(q);

      let allLabels = [];

      for (const doc of snap.docs) {
        const batch = doc.data();

        for (let i = 0; i < batch.quantity; i++) {
          const productId = `PID-${batch.batch}-${i + 1}`;

          const scratchCode = Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();

          const qrData = JSON.stringify({
            productId,
            batch: batch.batch
          });

          const qrImage = await QRCode.toDataURL(qrData);

          allLabels.push({
            name: batch.name,
            productId,
            scratchCode,
            qrImage
          });
        }
      }

      setLabels(allLabels);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading labels...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">Print Labels</h1>

      <button
        onClick={() => window.print()}
        className="mb-6 bg-blue-500 text-white px-6 py-2 rounded"
      >
        Print All Labels
      </button>

      <div className="grid grid-cols-3 gap-4">

        {labels.map((p, i) => (
          <div key={i} className="bg-white p-4 border rounded text-center">

            {/* QR */}
            <img src={p.qrImage} alt="QR" className="mx-auto w-24" />

            {/* Name */}
            <p className="font-bold mt-2">{p.name}</p>

            {/* Product ID */}
            <p className="text-sm mt-1">{p.productId}</p>

            {/* Scratch */}
            <p className="text-xs mt-1">
              Scratch: {p.scratchCode}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Labels;