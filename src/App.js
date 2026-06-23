import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AddProduct from "./pages/AddProduct";
import ProductList from "./pages/ProductList";
import ScanTest from "./pages/ScanTest";
import VerifyProduct from "./pages/VerifyProduct";
import Labels from "./pages/Labels";
import AdminProducts from "./pages/AdminProducts";
import ScanHistory from "./pages/ScanHistory";
import ApprovedProducts from "./pages/ApprovedProducts";
import AdminBatches from "./pages/AdminBatches";
import PrintLabels from "./pages/PrintLabels";
import BatchPrint from "./pages/BatchPrint";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyApprovals from "./pages/CompanyApprovals";
import AdminAnalytics from "./pages/AdminAnalytics";
import ScanMap from "./pages/ScanMap";
import TermsAndConditions from "./pages/TermsAndConditions";

function CompanyRoute({ children }) {
  const isCompanyLoggedIn = localStorage.getItem("isCompany") === "true";
  return isCompanyLoggedIn ? children : <Navigate to="/login/company" replace />;
}

function AdminRoute({ children }) {
  const isAdminLoggedIn = localStorage.getItem("isAdmin") === "true";
  return isAdminLoggedIn ? children : <Navigate to="/login/admin" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT LANDING PAGE */}
        <Route path="/" element={<Landing />} />

        {/* LOGIN PAGES */}
        <Route path="/login/:role" element={<Login />} />
        <Route path="/signup" element={<Login />} />

        {/* Backward compatible routes */}
        <Route path="/logincompany" element={<Navigate to="/login/company" replace />} />
        <Route path="/loginadmin" element={<Navigate to="/login/admin" replace />} />

        {/* USER ROUTES */}
        <Route
          path="/dashboard"
          element={
            <CompanyRoute>
              <Dashboard />
            </CompanyRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <CompanyRoute>
              <AddProduct />
            </CompanyRoute>
          }
        />
        <Route
          path="/products"
          element={
            <CompanyRoute>
              <ProductList />
            </CompanyRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <CompanyRoute>
              <ScanTest />
            </CompanyRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <CompanyRoute>
              <VerifyProduct />
            </CompanyRoute>
          }
        />
        <Route
          path="/labels"
          element={
            <CompanyRoute>
              <Labels />
            </CompanyRoute>
          }
        />
        <Route
          path="/history"
          element={
            <CompanyRoute>
              <ScanHistory />
            </CompanyRoute>
          }
        />
        <Route
          path="/scan-map"
          element={
            <CompanyRoute>
              <ScanMap />
            </CompanyRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/approved-products"
          element={
            <AdminRoute>
              <ApprovedProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-batches"
          element={
            <AdminRoute>
              <AdminBatches />
            </AdminRoute>
          }
        />
        <Route
          path="/company-approvals"
          element={
            <AdminRoute>
              <CompanyApprovals />
            </AdminRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          }
        />

        {/* PRINT ROUTES */}
        <Route
          path="/print-labels"
          element={
            <CompanyRoute>
              <PrintLabels />
            </CompanyRoute>
          }
        />
        <Route
          path="/batch-print"
          element={
            <CompanyRoute>
              <BatchPrint />
            </CompanyRoute>
          }
        />

        {/* EXTRA PAGES */}
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

        {/* Optional fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;