// import React, { useState } from "react";
// import { db } from "../firebase/config";
// import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";

// function VerifyProduct() {

//   const [productId, setProductId] = useState("");
//   const [scratch, setScratch] = useState("");
//   const [message, setMessage] = useState("");

//   const handleVerify = async () => {

//     const snapshot = await getDocs(collection(db, "products"));

//     let found = null;

//     snapshot.forEach((d) => {
//       const data = d.data();

//       if (data.productId === productId) {
//         found = { id: d.id, ...data };
//       }
//     });

//     // ❌ Not found
//     if (!found) {
//       setMessage("❌ Fake Product");
//       return;
//     }

//     // ❌ Wrong scratch
//     if (found.scratchCode !== scratch) {
//       setMessage("❌ Invalid Scratch Code");
//       return;
//     }

//     // ❌ Already used
//     if (found.isUsed) {
//       setMessage("⚠️ Already Used → Fraud Alert");

//       // save scan
//       await addDoc(collection(db, "scans"), {
//         productId,
//         time: new Date().toISOString(),
//         fraud: true
//       });

//       return;
//     }

//     // ✅ VALID
//     setMessage("✅ Product Verified");

//     await updateDoc(doc(db, "products", found.id), {
//       isUsed: true
//     });

//     await addDoc(collection(db, "scans"), {
//       productId,
//       time: new Date().toISOString(),
//       fraud: false
//     });
//   };

//   return (
//     <div className="p-6 text-center">

//       <h1 className="text-2xl mb-4">Verify Product</h1>

//       <input
//         placeholder="Enter Product ID"
//         className="border p-2 mb-2"
//         onChange={(e) => setProductId(e.target.value)}
//       /><br />

//       <input
//         placeholder="Enter Scratch Code"
//         className="border p-2 mb-2"
//         onChange={(e) => setScratch(e.target.value)}
//       /><br />

//       <button 
//         onClick={handleVerify}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Verify
//       </button>

//       <p className="mt-4 text-xl">{message}</p>

//     </div>
//   );
// }

// export default VerifyProduct;


// Perplexity code



import React, { useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function VerifyProduct() {
  const [productId, setProductId] = useState("");
  const [scratch, setScratch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const navigate = useNavigate();

  const resetForm = () => {
    setProductId("");
    setScratch("");
    setMessage("");
    setIsValid(null);
  };

  const handleVerify = async () => {
    if (!productId || !scratch) {
      showMessage("⚠️ Please fill both fields", "warning");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const q = query(
        collection(db, "products"),
        where("productId", "==", productId)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        showMessage("❌ Fake Product", "error");
        return;
      }

      const docRef = snap.docs[0];
      const found = { id: docRef.id, ...docRef.data() };

      if (found.scratchCode !== scratch) {
        showMessage("❌ Invalid Scratch Code", "error");
        return;
      }

      if (found.isUsed) {
        setMessage("🚨 Already Used → Fraud Alert");
        setIsValid(false);

        await addDoc(collection(db, "scans"), {
          productId,
          time: new Date().toISOString(),
          fraud: true,
          lat: 20.5937 + (Math.random() - 0.5) * 10,
          lng: 78.9629 + (Math.random() - 0.5) * 10
        });

        return;
      }

      setMessage("✅ Product Verified Successfully!");
      setIsValid(true);

      await updateDoc(doc(db, "products", found.id), {
        isUsed: true
      });

      await addDoc(collection(db, "scans"), {
        productId,
        time: new Date().toISOString(),
        fraud: false,
        lat: 20.5937 + (Math.random() - 0.5) * 10,
        lng: 78.9629 + (Math.random() - 0.5) * 10
      });

    } catch (error) {
      console.error("Verification error:", error);
      showMessage("❌ Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setIsValid(type === "success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      {/* ✅ HOME BUTTON - LEFT TOP CORNER */}
      <div className="fixed top-4 left-4 z-50 md:top-6 md:left-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium backdrop-blur-sm border border-gray-200/50"
        >
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </button>
      </div>

      <div className="max-w-md mx-auto pt-20 md:pt-24"> {/* Less top padding */}
        {/* Header - Compact */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
            <span className="text-2xl md:text-3xl">🔍</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Verify Product
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-sm mx-auto leading-relaxed px-2">
            Enter Product ID & Scratch Code to check authenticity
          </p>
        </div>

        {/* Verification Card - Tighter padding */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/60">
          <div className="space-y-4 md:space-y-6">
            {/* Product ID Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                🆔 Product ID
              </label>
              <input
                type="text"
                placeholder="Enter 8-digit Product ID"
                className="w-full px-4 py-3 md:px-5 md:py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50 transition-all duration-300 text-base md:text-lg shadow-sm hover:shadow-md"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Scratch Code Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                🧾 Scratch Code
              </label>
              <input
                type="text"
                placeholder="Scratch & enter hidden code"
                className="w-full px-4 py-3 md:px-5 md:py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100/50 transition-all duration-300 text-base md:text-lg shadow-sm hover:shadow-md"
                value={scratch}
                onChange={(e) => setScratch(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className={`w-full py-4 md:py-5 px-6 md:px-8 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-xl md:shadow-2xl transform transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-2xl md:hover:shadow-3xl hover:-translate-y-0.5 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <span>🔎 Verify Product</span>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
                </>
              )}
            </button>
          </div>

          {/* Result */}
          {message && (
            <div className={`mt-6 md:mt-8 p-5 md:p-6 rounded-xl md:rounded-2xl shadow-lg transform transition-all duration-500 ${
              isValid === null 
                ? 'bg-yellow-50 border-2 border-yellow-200' 
                : isValid 
                ? 'bg-emerald-50 border-2 border-emerald-200 animate-bounce' 
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className={`text-2xl md:text-3xl mb-2 md:mb-3 ${
                isValid === null ? 'text-yellow-500' : isValid ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {message.includes('Fake') && '❌'}
                {message.includes('Invalid') && '❌'}
                {message.includes('Used') && '⚠️'}
                {message.includes('Verified') && '✅'}
              </div>
              <p className="font-semibold text-base md:text-lg text-center">{message}</p>
              {isValid !== null && (
                <button
                  onClick={resetForm}
                  className="mt-3 md:mt-4 w-full py-2.5 md:py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg md:rounded-xl font-semibold transition-all duration-300 text-sm md:text-base"
                >
                  🔄 New Verification
                </button>
              )}
            </div>
          )}

          {/* Quick Links - TIGHTER & HIGHER */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 md:gap-3">
            <button
              onClick={() => window.location.href = '/scan'}
              className="flex-1 py-2.5 md:py-3 px-4 md:px-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg md:rounded-xl font-semibold hover:shadow-lg transition-all text-sm md:text-base"
            >
              📱 Test Scanner
            </button>
            <button
              onClick={() => window.location.href = '/history'}
              className="flex-1 py-2.5 md:py-3 px-4 md:px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg md:rounded-xl font-semibold hover:shadow-lg transition-all text-sm md:text-base"
            >
              📊 View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyProduct;