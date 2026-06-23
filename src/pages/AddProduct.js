
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { db, auth } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";

function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    type: "",
    batch: "",
    quantity: "",
    image: ""
  });

  const [loading, setLoading] = useState(false);
  const [customType, setCustomType] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (msg, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 p-4 rounded-xl text-white ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 validation
    if (!form.name || !form.type || !form.batch || !form.quantity) {
      showToast("All fields required", "error");
      return;
    }

    if (form.type === "Other" && !customType) {
      showToast("Enter custom type", "error");
      return;
    }

    const user = auth.currentUser;

    try {
      setLoading(true);

      const finalType =
        form.type === "Other" ? customType : form.type;

      await addDoc(collection(db, "batches"), {
        name: form.name,
        type: finalType,
        batch: form.batch,
        quantity: Number(form.quantity),
        companyId: user.uid,
        status: "pending",
        image: form.image || "", // 🔥 URL save
        createdAt: new Date().toISOString()
      });

      showToast("Batch submitted successfully ✅");

      // reset form
      setForm({
        name: "",
        type: "",
        batch: "",
        quantity: "",
        image: ""
      });

      setCustomType("");

    } catch (err) {
      console.error(err);
      showToast("Error submitting batch", "error");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />

     <div className="ml-64 flex justify-center items-center w-full p-8 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">

  <div className="bg-gray-100/90 backdrop-blur-md border border-gray-200 p-10 rounded-3xl shadow-xl w-full max-w-xl">

    <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
      Add Product Batch
    </h1>

    <form onSubmit={handleSubmit} className="space-y-6">

      {/* IMAGE URL */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          Product Image URL
        </label>

        <input
          type="text"
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="Paste product image URL"
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />

        {form.image && (
          <img
            src={form.image}
            alt="preview"
            className="w-28 h-28 mt-4 mx-auto rounded-xl border shadow-md hover:scale-105 transition"
          />
        )}
      </div>

      {/* PRODUCT NAME */}
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Product Name"
        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* TYPE */}
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Select Type</option>
        <option value="Electronics">Electronics</option>
        <option value="Mobile Phones">Mobile Phones</option>
        <option value="Pharma">Pharma</option>
        <option value="Other">Other</option>
      </select>

      {/* OTHER TYPE INPUT */}
      {form.type === "Other" && (
        <input
          type="text"
          placeholder="Enter custom product type"
          value={customType}
          onChange={(e) => setCustomType(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
      )}

      {/* BATCH */}
      <input
        type="text"
        name="batch"
        value={form.batch}
        onChange={handleChange}
        placeholder="Batch Number"
        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* QUANTITY */}
      <input
        type="number"
        name="quantity"
        value={form.quantity}
        onChange={handleChange}
        placeholder="Quantity"
        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* BUTTON */}
      <button
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all duration-300"
      >
        {loading ? "Submitting..." : "🚀 Submit Batch"}
      </button>

    </form>
  </div>
</div>
    </div>
  );
}

export default AddProduct;

