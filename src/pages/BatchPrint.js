
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { db, auth } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function BatchPrint() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, []);

  const fetchBatches = async () => {
    try {
      const user = auth.currentUser;
      const snap = await getDocs(collection(db, "batches"));

      let list = [];
      snap.forEach((d) => {
        const data = d.data();
        if (
          data.companyId === user.uid &&
          data.status === "approved"
        ) {
          list.push(data);
        }
      });

      setBatches(list);
    } catch (error) {
      showToast("Failed to fetch batches", "error");
    }
  };

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      let list = [];
      snap.forEach((d) => {
        list.push(d.data());
      });
      setProducts(list);
    } catch (error) {
      showToast("Failed to fetch products", "error");
    }
  };

  // ✅ SAME PDF LOGIC - ZERO CHANGE
  const generatePDF = async () => {
    setGeneratingPDF(true);
    try {
      const element = document.getElementById("print-area");
      if (!element) {
        showToast("No batch selected", "error");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Calculate dimensions
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10;
      pdf.addImage(imgData, "PNG", 10, position, imgWidth - 20, imgHeight);
      heightLeft -= pageHeight;

      // Multi-page support
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth - 20, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`batch_${selectedBatch}_labels_${new Date().toISOString().slice(0,10)}.pdf`);
      showToast("PDF generated successfully!", "success");
    } catch (error) {
      showToast("PDF generation failed", "error");
      console.error(error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.batch === selectedBatch &&
      p.status === "approved"
  );

  const currentBatch = batches.find(b => b.batch === selectedBatch);

  // Toast
  const showToast = (message, type = "error") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-[1000] p-4 rounded-xl shadow-2xl transform translate-x-full transition-all duration-300 max-w-sm ${
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    }`;
    toast.innerHTML = `<div class="flex items-center space-x-2">${type === "success" ? "✅" : "❌"} ${message}</div>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.replace("translate-x-full", "translate-x-0"), 100);
    setTimeout(() => toast.remove(), 4000);
  };

  const copyBatchInfo = () => {
    const text = `${currentBatch?.name || 'Batch'} (${selectedBatch})\nTotal Labels: ${filteredProducts.length}\nReady for printing`;
    navigator.clipboard.writeText(text);
    showToast("Batch info copied!", "success");
  };

  return (
    <div className="flex bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 min-h-screen">
      <Sidebar />

      <div className="ml-64 p-8 w-full">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text mb-4">
            Batch Label Printer
          </h1>
          <p className="text-xl text-gray-600">Generate print-ready PDF labels with QR codes</p>
        </div>

        {/* Batch Selector */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
            <div className="flex-1">
              <label className="block text-lg font-bold text-gray-700 mb-4 uppercase tracking-wide">
                Select Approved Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full lg:w-96 p-4 border-2 border-gray-200 rounded-2xl text-lg font-semibold focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg hover:shadow-xl bg-white"
              >
                <option value="">Choose a batch to print labels...</option>
                {batches.map((b, i) => (
                  <option key={i} value={b.batch}>
                    📦 {b.batch} - {b.name} ({b.quantity} labels)
                  </option>
                ))}
              </select>
            </div>

            {selectedBatch && currentBatch && (
              <div className="text-center lg:text-left space-y-2">
                <div className="text-2xl font-black text-emerald-600">
                  {filteredProducts.length} Labels Ready
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={copyBatchInfo}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Info
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Print Controls */}
        {selectedBatch && filteredProducts.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 p-6 rounded-3xl mb-8 shadow-xl">
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setShowPreview(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all uppercase tracking-wide flex items-center space-x-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview</span>
              </button>
              
              <button
                onClick={generatePDF}
                disabled={generatingPDF}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide flex items-center space-x-3 group"
              >
                {generatingPDF ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10l-5.5 5.5m0 0L8 18l5.5-5.5M12 10l5.5 5.5m-5.5 0L16 18l-5.5-5.5M12 10V5m0 0L7 10m5-5l5 5" />
                    </svg>
                    <span>Download PDF ({filteredProducts.length} labels)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all uppercase tracking-wide flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v.5" />
                </svg>
                <span>Print Directly</span>
              </button>
            </div>
          </div>
        )}

        {/* Print Area - Professional Labels */}
        {selectedBatch && filteredProducts.length > 0 && (
          <div className="bg-white shadow-2xl border-4 border-gray-100 rounded-3xl p-8 mb-8 print:p-4 print:rounded-none print:shadow-none print:border-0">
            <div id="print-area" className="max-w-6xl mx-auto">
              
              {/* Print Header */}
              <div className="hidden print:block mb-8 text-center pb-8 border-b-2 border-gray-200">
                <h2 className="text-3xl font-black text-gray-800 mb-2">{currentBatch?.name}</h2>
                <p className="text-xl text-gray-600">Batch: {selectedBatch} | Total Labels: {filteredProducts.length}</p>
                <p className="text-sm text-gray-500 mt-4">Scan QR Code + Enter Scratch Code to Verify</p>
              </div>

              {/* Label Grid - Print Optimized */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 print:grid-cols-3 print:gap-4">
                {filteredProducts.map((p, i) => (
                  <div 
                    key={i} 
                    className="group relative bg-gradient-to-b from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-[280px] flex flex-col justify-between print:shadow-none print:hover:shadow-none print:hover:translate-y-0 print:border print:bg-white print:h-auto"
                  >
                    {/* QR Code */}
                    <div className="flex-1 flex items-center justify-center mb-4 print:mb-2">
                      <div className="w-28 h-28 p-3 bg-white rounded-2xl shadow-lg border-4 border-gray-100 group-hover:shadow-2xl transition-all print:w-20 print:h-20 print:p-2">
                        <img 
                          src={p.qrImage} 
                          alt="QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="text-center space-y-2">
                      <h4 className="font-bold text-lg text-gray-800 truncate print:text-sm">{p.name}</h4>
                      <div className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700 uppercase tracking-wide print:text-xs">
                        {p.batch}
                      </div>
                      <div className="font-mono text-sm bg-blue-50 text-blue-800 px-3 py-1 rounded-lg print:text-xs print:bg-gray-50 print:text-gray-800">
                        {p.productId}
                      </div>
                      <div className="font-mono text-xs text-gray-600 italic bg-green-50 px-2 py-1 rounded print:text-[10px]">
                        Scratch: {p.scratchCode}
                      </div>
                    </div>

                    {/* Print Helper (hidden on print) */}
                    <div className="hidden print:hidden absolute -top-3 -right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ✓ Ready
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedBatch && (
          <div className="text-center py-24">
            <div className="text-8xl text-gray-300 mb-8 mx-auto">🖨️</div>
            <h3 className="text-3xl font-black text-gray-800 mb-4">Select a Batch to Print</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose an approved batch from the dropdown above to generate professional QR code labels ready for printing.
            </p>
            {batches.length === 0 && (
              <p className="text-lg text-gray-500 mb-8">No approved batches found. Create and get your batches approved first.</p>
            )}
          </div>
        )}

        {selectedBatch && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <div className="text-8xl text-gray-300 mb-8 mx-auto">📦</div>
            <h3 className="text-3xl font-black text-gray-800 mb-4">No Products Found</h3>
            <p className="text-xl text-gray-600 mb-8">This batch has no approved products yet.</p>
            <button
              onClick={() => {
                setSelectedBatch("");
                fetchProducts();
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Select Another Batch
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800">Print Preview</h3>
                <div className="flex gap-3">
                  <button
                    onClick={generatePDF}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div id="print-area" className="print:hidden" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default BatchPrint;