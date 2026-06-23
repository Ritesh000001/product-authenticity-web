// import React from "react";
// import { db } from "../firebase/config";
// import { collection, addDoc } from "firebase/firestore";

// function ScanTest() {

//   const handleScan = async () => {
//     await addDoc(collection(db, "scans"), {
//       productId: "test123",
//       location: "India",
//       time: new Date()
//     });

//     alert("Scan saved");
//   };

//   return (
//     <div>
//       <h2>Scan Test</h2>
//       <button onClick={handleScan}>Simulate Scan</button>
//     </div>
//   );
// }

// export default ScanTest;




// Perplexity code




import React from "react";
import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";

function ScanTest() {
  const handleScan = async () => {
    try {
      await addDoc(collection(db, "scans"), {
        productId: "test123",
        location: "India",
        time: new Date().toISOString(),
        lat: 20.5937 + (Math.random() - 0.5) * 10, // Random lat around India
        lng: 78.9629 + (Math.random() - 0.5) * 10, // Random lng around India
        fraud: Math.random() > 0.7 // 30% fraud chance for testing
      });
      
      // Success animation
      const btn = document.getElementById('scan-btn');
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = 'scale(1)', 150);
      
      showToast('✅ Scan saved successfully!');
    } catch (error) {
      console.error("Scan error:", error);
      showToast('❌ Scan failed!');
    }
  };

  const showToast = (message) => {
    const toast = document.getElementById('scan-toast');
    toast.textContent = message;
    toast.classList.remove('translate-x-full');
    setTimeout(() => {
      toast.classList.add('translate-x-full');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            QR Scan Test
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            Simulate product scans to test your fraud detection system
          </p>
        </div>

        {/* Scan Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Scan</h3>
            <p className="text-gray-600">Click below to simulate QR scan</p>
          </div>

          {/* Scan Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              id="scan-btn"
              onClick={handleScan}
              className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transform transition-all duration-300 overflow-hidden flex items-center gap-3 min-w-[200px] border-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>🔍 Scan QR</span>
                <div className="w-2 h-2 bg-white rounded-full group-hover:animate-ping"></div>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -skew-x-12 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>

            <button
              onClick={() => window.location.href = '/scan-map'}
              className="px-8 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0"
            >
              🗺️ View Map
            </button>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
            <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">📊</div>
              <p className="text-sm text-gray-600 mt-2">Test scans add to history</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-green-50 to-emerald-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">🗺️</div>
              <p className="text-sm text-gray-600 mt-2">Random India locations</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-pink-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">⚠️</div>
              <p className="text-sm text-gray-600 mt-2">30% fraud probability</p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <div
          id="scan-toast"
          className="fixed bottom-8 right-8 bg-white shadow-2xl border border-gray-200 rounded-2xl px-6 py-4 font-semibold text-lg transform translate-x-full transition-transform duration-300 z-50 backdrop-blur-sm"
        >
          Ready
        </div>
      </div>
    </div>
  );
}

export default ScanTest;