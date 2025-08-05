import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

// Pages
import POS from "./pages/POS";
import SalesHistory from "./pages/Sales";
import ProductManagement from "./pages/ProductManagement";

function App() {
  const [cashOnHand, setCashOnHand] = useState(() => {
    const stored = localStorage.getItem("cashOnHand");
    return stored ? parseFloat(stored) : 0;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("cashOnHand");
    setCashOnHand(stored ? parseFloat(stored) : 0);

    const sync = () => {
      const latest = localStorage.getItem("cashOnHand");
      setCashOnHand(latest ? parseFloat(latest) : 0);
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

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

  // Add Cash on Drawer(Cash on Hand)
  const handleAddCash = () => {
    if (adminPassword !== import.meta.env.VITE_ADMIN_PASSWORD) {
      setError("Incorrect password.");

      return;
    }

    const current = parseFloat(localStorage.getItem("cashOnHand") || "0");
    const amount = parseFloat(amountToAdd);

    if (isNaN(amount) || amount <= 0) {
      setError("Enter valid amount.");
      return;
    }

    const updated = current + amount;
    localStorage.setItem("cashOnHand", updated);
    window.dispatchEvent(new Event("storage"));
    toast.success(`₱${amount.toFixed(2)} added to drawer.`);
    setIsModalOpen(false);
    setAmountToAdd("");
    setAdminPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white px-2 py-1.5 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="space-x-4">
          <Link
            to="/"
            className={`hover:underline ${
              location.pathname === "/" ? "text-yellow-400 font-bold" : ""
            }`}
          >
            POS
          </Link>

          <Link
            to="/sales"
            className={`hover:underline ${
              location.pathname === "/sales" ? "text-yellow-400 font-bold" : ""
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

        <div className="flex items-start">
          <div className="flex flex-col">
            {location.pathname === "/products" ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-semibold bg-blue-600 text-white rounded"
              >
                Manage Cash to Drawer
              </button>
            ) : (
              <span
                className={`text-xs font-semibold ${
                  cashOnHand < 500 &&
                  (location.pathname === "/" || location.pathname === "/sales")
                    ? "text-yellow-300"
                    : "text-white"
                }`}
              >
                {cashOnHand < 500 &&
                (location.pathname === "/" || location.pathname === "/sales")
                  ? "⚠️ Low cash in drawer"
                  : "Cash on drawer:"}
              </span>
            )}

            <span className="text-3xl text-white font-bold">
              ₱{cashOnHand.toFixed(2)}
            </span>
          </div>
        </div>
      </nav>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<POS />} />
        <Route path="/sales" element={<SalesHistory />} />
        <Route path="/products" element={<ProductManagement />} />
      </Routes>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-sm animate-slideDown space-y-3">
            <h2 className="text-lg font-bold text-center">
              Add Cash to Drawer
            </h2>

            <div className="text-sm text-gray-600 text-center">
              Current:{" "}
              <span className="font-semibold text-black">
                \u20b1{cashOnHand.toFixed(2)}
              </span>
            </div>

            <input
              type="text"
              value={amountToAdd}
              readOnly
              placeholder="0"
              className="w-full text-right border px-3 py-2 text-2xl font-bold rounded bg-gray-100"
            />

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {[100, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() =>
                    setAmountToAdd((prev) => String(Number(prev || 0) + val))
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm"
                >
                  +\u20b1{val}
                </button>
              ))}
              <button
                onClick={() => setAmountToAdd("")}
                className="bg-gray-400 hover:bg-gray-500 text-white py-2 rounded text-sm"
              >
                Clear
              </button>
            </div>

            {/* KEYPAD */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                ".",
                "0",
                "\u2190",
              ].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === "\u2190") {
                      setAmountToAdd((prev) => prev.slice(0, -1));
                    } else {
                      setAmountToAdd((prev) => (prev + key).slice(0, 10));
                    }
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-xl font-medium py-2 rounded"
                >
                  {key}
                </button>
              ))}
            </div>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full border px-3 py-2 rounded text-sm mt-2"
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setAmountToAdd("");
                  setAdminPassword("");
                  setError("");
                }}
                className="px-3 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCash}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add \u20b1{amountToAdd || 0}
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-xs flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-sm animate-slideDown space-y-3">
            <h2 className="text-lg font-bold text-center">
              Add Cash to Drawer
            </h2>

            <div className="text-sm text-gray-600 text-center flex justify-center items-center gap-2">
              Current:{" "}
              <span className="font-semibold text-black">
                \u20b1{cashOnHand.toFixed(2)}
              </span>
              <button
                onClick={() => {
                  if (adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
                    if (
                      confirm("Reset cash to \u20b10? This cannot be undone.")
                    ) {
                      localStorage.setItem("cashOnHand", "0");
                      setCashOnHand(0);
                      setAmountToAdd("");
                      toast.success("Cash on hand reset to \u20b10.", {
                        duration: 3000,
                        style: {
                          background: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fcd34d",
                        },
                      });
                    }
                  } else {
                    setError("Incorrect password.");
                  }
                }}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Reset to \u20b10"
              >
                \U0001f501
              </button>
            </div>

            <input
              type="text"
              value={amountToAdd}
              readOnly
              placeholder="0"
              className="w-full text-right border px-3 py-2 text-2xl font-bold rounded bg-gray-100"
            />

            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() =>
                    setAmountToAdd((prev) => String(Number(prev || 0) + val))
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm"
                >
                  +\u20b1{val}
                </button>
              ))}
              <button
                onClick={() => setAmountToAdd("")}
                className="bg-gray-400 hover:bg-gray-500 text-white py-2 rounded text-sm"
              >
                Clear
              </button>
            </div>

            {/* KEYPAD */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                ".",
                "0",
                "\u2190",
              ].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === "\u2190") {
                      setAmountToAdd((prev) => prev.slice(0, -1));
                    } else {
                      setAmountToAdd((prev) => (prev + key).slice(0, 10));
                    }
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-xl font-medium py-2 rounded"
                >
                  {key}
                </button>
              ))}
            </div>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full border px-3 py-2 rounded text-sm mt-2"
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setAmountToAdd("");
                  setAdminPassword("");
                  setError("");
                }}
                className="px-3 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCash}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add \u20b1{amountToAdd || 0}
              </button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-sm animate-slideDown space-y-3">
            <h2 className="text-lg font-bold text-center">
              Add Cash to Drawer
            </h2>

            <div className="text-sm text-gray-600 text-center flex justify-center items-center gap-2">
              Current:{" "}
              <span className="font-semibold text-black">
                ₱{cashOnHand.toFixed(2)}
              </span>
              <button
                onClick={() => {
                  if (adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
                    if (confirm("Reset cash to ₱0? This cannot be undone.")) {
                      localStorage.setItem("cashOnHand", "0");
                      setCashOnHand(0);
                      setAmountToAdd("");
                      toast.success("Cash on hand reset to ₱0.", {
                        duration: 3000,
                        style: {
                          background: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fcd34d",
                        },
                      });
                    }
                  } else {
                    setError("Incorrect password.");
                  }
                }}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Reset to ₱0"
              >
                🔁
              </button>
            </div>

            <input
              type="text"
              value={amountToAdd}
              readOnly
              placeholder="0"
              className="w-full text-right border px-3 py-2 text-2xl font-bold rounded bg-gray-100"
            />

            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() =>
                    setAmountToAdd((prev) => String(Number(prev || 0) + val))
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm"
                >
                  +₱{val}
                </button>
              ))}
              <button
                onClick={() => setAmountToAdd("")}
                className="bg-gray-400 hover:bg-gray-500 text-white py-2 rounded text-sm"
              >
                Clear
              </button>
            </div>

            {/* KEYPAD */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "←"].map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === "←") {
                        setAmountToAdd((prev) => prev.slice(0, -1));
                      } else {
                        setAmountToAdd((prev) => (prev + key).slice(0, 10));
                      }
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-xl font-medium py-2 rounded"
                  >
                    {key}
                  </button>
                )
              )}
            </div>

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full border px-3 py-2 rounded text-sm mt-2"
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setAmountToAdd("");
                  setAdminPassword("");
                  setError("");
                }}
                className="px-3 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCash}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add ₱{amountToAdd || 0}
              </button>
            </div>
          </div>
        </div>
      )}
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
