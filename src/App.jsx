import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState } from "react";

// Pages
import POS from "./pages/POS";
import SalesHistory from "./pages/Sales";
import ProductManagement from "./pages/ProductManagement";

function App() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const location = useLocation();

  const navigate = useNavigate();

  const handleAccessProducts = () => {
    if (adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsPasswordModalOpen(false);
      setAdminPassword("");
      setPasswordError("");
      navigate("/products");
    } else {
      setPasswordError("Incorrect password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white p-4 flex justify-between sticky top-0 z-50 shadow-md">
        <div className="space-x-4">
          <Link
            to="/"
            className={`hover:underline ${
              location.pathname === "/"
                ? "text-yellow-400 font-bold"
                : ""
            }`}
          >
            POS
          </Link>

          <Link
            to="/sales"
            className={`hover:underline ${
              location.pathname === "/sales"
                ? "text-yellow-400 font-bold"
                : ""
            }`}
          >
            Sales History
          </Link>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className={`hover:underline ${
              location.pathname === "/products"
                ? "text-yellow-400 font-bold"
                : ""
            }`}
          >
            Product Management
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<POS />} />
        <Route path="/sales" element={<SalesHistory />} />
        <Route path="/products" element={<ProductManagement />} />
      </Routes>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-3">Admin Access</h2>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-2">{passwordError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setAdminPassword("");
                  setPasswordError("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAccessProducts}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
