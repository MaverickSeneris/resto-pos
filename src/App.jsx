import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Pages
import POS from "./pages/POS";
import SalesHistory from "./pages/Sales";
import ProductManagement from "./pages/ProductManagement";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
          <div className="space-x-4">
            <Link to="/" className="hover:underline">
              POS
            </Link>
            <Link to="/sales" className="hover:underline">
              Sales History
            </Link>
            <Link to="/products" className="hover:underline">
              Product Management
            </Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/sales" element={<SalesHistory />} />
          <Route path="/products" element={<ProductManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
