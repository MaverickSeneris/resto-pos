import { useState, useEffect } from "react";
import { format } from "date-fns";
import { startOfDay, endOfDay } from "date-fns";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [password, setPassword] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState("");

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

  // Export filtered results to CSV
  const exportCSV = () => {
    const headers = [
      "Date",
      "Table",
      "Item",
      "Qty",
      "Price",
      "Total",
      "Cash",
      "Change",
    ];
    const rows = [];

    filteredSales.forEach((sale) => {
      const grouped = groupItems(sale.items);
      grouped.forEach((item) => {
        rows.push([
          format(new Date(sale.date), "yyyy-MM-dd HH:mm"),
          sale.table,
          item.name,
          item.qty,
          item.price,
          (item.price * item.qty).toFixed(2),
          sale.cash?.toFixed(2) || "",
          sale.change?.toFixed(2) || "",
        ]);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter sales by date
  // const filteredSales = sales.filter((sale) => {
  //   const saleDate = new Date(sale.date);
  //   const afterStart = startDate
  //     ? saleDate >= startOfDay(new Date(startDate))
  //     : true;
  //   const beforeEnd = endDate ? saleDate <= endOfDay(new Date(endDate)) : true;

  //   return afterStart && beforeEnd;
  // });
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    const afterStart = startDate
      ? saleDate >= startOfDay(new Date(startDate))
      : true;
    const beforeEnd = endDate ? saleDate <= endOfDay(new Date(endDate)) : true;

    const categoryMatch = selectedCategory
      ? sale.items.some((item) => {
          const menu = JSON.parse(localStorage.getItem("menu") || "[]");
          const found = menu.find((m) => m.name === item.name);
          return found?.category === selectedCategory;
        })
      : true;

    return afterStart && beforeEnd && categoryMatch;
  });

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

      {/* 🔘 Quick Filter Buttons */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          className="px-3 py-1 text-sm rounded border hover:bg-gray-100"
        >
          All
        </button>
        <button
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            setStartDate(today);
            setEndDate(today);
          }}
          className="px-3 py-1 text-sm rounded border hover:bg-gray-100"
        >
          Today
        </button>
        <button
          onClick={() => {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            const yesterday = y.toISOString().slice(0, 10);
            setStartDate(yesterday);
            setEndDate(yesterday);
          }}
          className="px-3 py-1 text-sm rounded border hover:bg-gray-100"
        >
          Yesterday
        </button>
        <button
          onClick={() => {
            const now = new Date();
            const firstDay = new Date(
              now.setDate(now.getDate() - now.getDay())
            ); // Sunday
            const lastDay = new Date();
            setStartDate(firstDay.toISOString().slice(0, 10));
            setEndDate(lastDay.toISOString().slice(0, 10));
          }}
          className="px-3 py-1 text-sm rounded border hover:bg-gray-100"
        >
          This Week
        </button>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-3 py-1 text-sm rounded border ${
            selectedCategory === "" ? "bg-gray-300" : "hover:bg-gray-100"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-sm rounded border ${
              selectedCategory === cat ? "bg-gray-300" : "hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 📅 Manual Date Filter */}
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {/* <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        className="mb-4 p-2 border rounded"
      /> */}

      {/* 🧾 Sales List */}
      <div className="flex gap-2">
        {filteredSales.length > 0 && (
          <div className="mb-4 text-lg font-semibold">
            Total Sales{" "}
            {startDate || endDate ? (
              <>
                from{" "}
                {startDate
                  ? format(new Date(startDate), "MMMM d")
                  : "the start"}{" "}
                to {endDate ? format(new Date(endDate), "MMMM d") : "today"}
              </>
            ) : (
              "(All Time)"
            )}
            : ₱
            {filteredSales
              .reduce((sum, sale) => sum + sale.total, 0)
              .toFixed(2)}
          </div>
        )}
        {filteredSales.length === 0 && (
          <p className="text-gray-500 italic mb-4">
            No sales found in this range.
          </p>
        )}

        <button
          onClick={exportCSV}
          className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700 mb-4"
        >
          Export CSV
        </button>
      </div>

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
