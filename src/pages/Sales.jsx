import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [password, setPassword] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  // Load sales from localStorage on mount
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("sales") || "[]");
    setSales(data);
  }, []);

  // Group repeated items for receipt display
  const groupItems = (items) => {
    const map = new Map();
    items.forEach((item) => {
      const key = `${item.name}-${item.price}`;
      if (!map.has(key)) {
        map.set(key, { ...item, qty: 1 });
      } else {
        map.get(key).qty += 1;
      }
    });
    return Array.from(map.values());
  };

  // Filter sales by date
  const filteredSales = filterDate
    ? sales.filter((sale) => sale.date.startsWith(filterDate))
    : sales;

  // Handle delete sale
  const confirmDelete = () => {
    if (password !== "admin123") {
      alert("❌ Wrong password.");
      return;
    }
    const updated = sales.filter((sale) => sale.id !== deleteId);
    localStorage.setItem("sales", JSON.stringify(updated));
    setSales(updated);
    setDeleteId(null);
    setPassword("");
  };

  return (
    <div className="p-4">
      {/* 🔍 Date Filter */}
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        className="mb-4 p-2 border rounded"
      />

      {/* 🧾 Sales List */}
      {filteredSales.map((sale) => (
        <div key={sale.id} className="border p-4 mb-4 bg-white rounded shadow">
          <p className="font-bold">
            {sale.table} — {format(new Date(sale.date), "yyyy-MM-dd HH:mm")}
          </p>
          <ul className="text-sm mb-2">
            {groupItems(sale.items).map((item, i) => (
              <li key={i}>
                {item.name} {item.qty > 1 ? `x${item.qty}` : ""} — ₱
                {(item.price * item.qty).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="font-bold">Total: ₱{sale.total.toFixed(2)}</p>
          {sale.cash !== undefined && (
            <>
              <p>Cash: ₱{sale.cash.toFixed(2)}</p>
              <p>Change: ₱{sale.change.toFixed(2)}</p>
            </>
          )}

          {/* 📦 Actions */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setSelectedSale(sale)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              🧾 View Receipt
            </button>
            <button
              onClick={() => setDeleteId(sale.id)}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              🗑 Delete Sale
            </button>
          </div>
        </div>
      ))}

      {/* 🧾 Receipt Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn print:bg-white print:text-black">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-xs animate-slideUp transition-all print:animate-none print:shadow-none print:p-2 border border-gray-300 print:border-none print:w-[58mm] print:max-w-[58mm] print:mx-auto print:rounded-none print:shadow-none">
            {/* 🧾 Receipt style */}
            <div className="text-xs font-mono text-center bg-white print:bg-white p-4 rounded-md border border-dashed border-gray-400">
              <h2 className="font-bold text-sm mb-1">CHICKEN HAUS</h2>
              <p className="mb-1">Rizal, Laguna</p>
              <p className="mb-2 border-b border-dashed pb-2">
                {selectedSale.table} —{" "}
                {format(new Date(selectedSale.date), "yyyy-MM-dd HH:mm")}
              </p>

              {/* Items */}
              {groupItems(selectedSale.items).map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span>₱{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t border-b border-dashed my-2 py-2 font-bold">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>₱{selectedSale.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment */}
              {selectedSale.cash !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span>Cash</span>
                    <span>₱{selectedSale.cash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span>₱{selectedSale.change.toFixed(2)}</span>
                  </div>
                </>
              )}

              {/* Footer */}
              <p className="mt-4 italic text-gray-600 print:text-black">
                Thank you! Come again. 😊
              </p>
            </div>

            {/* 🔘 Buttons - Hidden in print */}
            <div className="flex justify-end gap-2 mt-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
              >
                🖨 Print
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="border px-4 py-1 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔐 Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Admin Password Required
            </h2>
            <input
              type="password"
              className="w-full border p-2 mb-4 rounded"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteId(null);
                  setPassword("");
                }}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
