import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("sales") || "[]");
    setSales(data);
  }, []);

  const filtered = filterDate
    ? sales.filter((sale) => sale.date.startsWith(filterDate))
    : sales;

  const confirmDelete = () => {
    if (password !== "admin123") {
      alert("Wrong password.");
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
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      {filtered.map((sale) => (
        <div key={sale.id} className="border p-4 mb-4 bg-white rounded shadow">
          <p className="font-bold">
            {sale.table} - {format(new Date(sale.date), "yyyy-MM-dd HH:mm")}
          </p>
          <ul className="text-sm mb-2">
            {sale.items.map((item, i) => (
              <li key={i}>
                {item.name} - ₱{item.price}
              </li>
            ))}
          </ul>
          <p className="font-bold">Total: ₱{sale.total}</p>
          {sale.cash !== undefined && (
            <>
              <p>Cash: ₱{sale.cash}</p>
              <p>Change: ₱{sale.change}</p>
            </>
          )}
          <button
            onClick={() => setDeleteId(sale.id)}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            🗑 Delete Sale
          </button>
        </div>
      ))}

      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-fadeIn">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm transition-transform transform-gpu animate-slideUp">
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
                  setPassword("");git 
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
