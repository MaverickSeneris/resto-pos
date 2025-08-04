import { useState, useEffect } from "react";
import { format } from "date-fns";
import { startOfDay, endOfDay } from "date-fns";
import { exportSalesToXlsx } from "../utils/exportToXlsx";

export default function SalesHistory() {
  const [selectedBackupFile, setSelectedBackupFile] = useState(null);

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
  const [selectedYear, setSelectedYear] = useState(() => {
    return (
      parseInt(localStorage.getItem("salesSelectedYear")) ||
      new Date().getFullYear()
    );
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem("salesSelectedMonth");
    return saved === null ? new Date().getMonth() : parseInt(saved);
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState("All");

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 4 + i
  );

  useEffect(() => {
    localStorage.setItem("salesSelectedYear", selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    localStorage.setItem("salesSelectedMonth", selectedMonth ?? "");
  }, [selectedMonth]);

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

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    const isYearMatch = saleDate.getFullYear() === selectedYear;
    const isMonthMatch =
      selectedMonth === null || saleDate.getMonth() === selectedMonth;

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

    return (
      isYearMatch && isMonthMatch && afterStart && beforeEnd && categoryMatch
    );
  });

  // function handleBackupLocalStorage() {
  //   const data = { ...localStorage };
  //   const blob = new Blob([JSON.stringify(data, null, 2)], {
  //     type: "application/json",
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = `localStorage-backup-${Date.now()}.json`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  // function handleRestoreLocalStorage(e) {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = function (event) {
  //     try {
  //       const backupData = JSON.parse(event.target.result);

  //       // Check for key collisions
  //       const overlappingKeys = Object.keys(backupData).filter(
  //         (key) => localStorage.getItem(key) !== null
  //       );

  //       if (
  //         overlappingKeys.length > 0 &&
  //         !confirm(
  //           `⚠️ Warning: ${overlappingKeys.length} existing key(s) will be overwritten.\nContinue restoring?`
  //         )
  //       ) {
  //         alert("❌ Restore cancelled.");
  //         return;
  //       }

  //       // Safe to restore
  //       for (const key in backupData) {
  //         localStorage.setItem(key, backupData[key]);
  //       }

  //       alert("✅ localStorage restored!");
  //       location.reload(); // Optional: refresh app
  //     } catch (err) {
  //       alert("❌ Invalid file or format.");
  //     }
  //   };
  //   reader.readAsText(file);
  // }

  const handleBackupLocalStorage = () => {
    // Convert localStorage into a plain object with string key-value pairs
    const backupData = Object.fromEntries(Object.entries(localStorage));

    const blob = new Blob([JSON.stringify(backupData)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Human-readable filename like ChickenHauz-Tue-8-4-25-1555h.json
    const now = new Date();
    const day = now.toLocaleDateString("en-US", { weekday: "short" }); // Tue
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const year = now.getFullYear().toString().slice(-2);
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    const filename = `ChickenHauz-${day}-${month}-${date}-${year}-${hours}${minutes}h.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    toast.success("\u2705 Backup downloaded!");
  };


  function handleRestoreLocalStorage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const backupData = JSON.parse(event.target.result);

        // Validate structure
        if (typeof backupData !== "object" || backupData === null) {
          throw new Error("Invalid backup format");
        }

        // Check for key collisions
        const overlappingKeys = Object.keys(backupData).filter(
          (key) => localStorage.getItem(key) !== null
        );

        if (
          overlappingKeys.length > 0 &&
          !confirm(
            `⚠️ ${overlappingKeys.length} existing key(s) will be overwritten.\nContinue restoring?`
          )
        ) {
          alert("❌ Restore cancelled.");
          return;
        }

        // Restore data
        for (const [key, value] of Object.entries(backupData)) {
          localStorage.setItem(key, value);
        }

        alert("✅ localStorage restored!");
        location.reload(); // Optional
      } catch (err) {
        alert("❌ Invalid file or corrupted JSON.");
      }
    };
    reader.readAsText(file);
  }




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
      {/* 🔘 Quick Filter Buttons */}
      {/* 🔽 Filter Toggle */}
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-bold">Sales Filters</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-gray-700 hover:text-black flex items-center gap-1"
        >
          {showFilters ? "Hide" : "Show"} Filters
          <span
            className={`transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>
      </div>

      {/* 🧰 Filters Drawer */}
      {showFilters && (
        <div className="p-3 rounded border bg-white shadow mb-4 space-y-4 max-h-[50vh] overflow-y-auto text-sm">
          {/* 🔘 Quick Filters */}
          <div>
            <p className="font-semibold text-gray-600 mb-1">Quick</p>
            <hr className="mb-2" />
            <div className="flex gap-1 flex-wrap">
              {["All", "Today", "Yesterday", "This Week"].map((label) => {
                const actionMap = {
                  All: () => {
                    setStartDate("");
                    setEndDate("");
                  },
                  Today: () => {
                    const today = new Date().toISOString().slice(0, 10);
                    setStartDate(today);
                    setEndDate(today);
                  },
                  Yesterday: () => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    const yesterday = y.toISOString().slice(0, 10);
                    setStartDate(yesterday);
                    setEndDate(yesterday);
                  },
                  "This Week": () => {
                    const now = new Date();
                    const firstDay = new Date(
                      now.setDate(now.getDate() - now.getDay())
                    );
                    const lastDay = new Date();
                    setStartDate(firstDay.toISOString().slice(0, 10));
                    setEndDate(lastDay.toISOString().slice(0, 10));
                  },
                };
                return (
                  <button
                    key={label}
                    onClick={() => {
                      actionMap[label]();
                      setSelectedQuickFilter(label);
                    }}
                    className={`px-2 py-0.5 rounded border ${
                      selectedQuickFilter === label
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 📅 Year & Month */}
          <div>
            <p className="font-semibold text-gray-600 mb-1">Year & Month</p>
            <hr className="mb-2" />
            <div className="flex gap-1 flex-wrap items-center">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="p-1 border rounded"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {Array.from({ length: 12 }, (_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setSelectedMonth(selectedMonth === i ? null : i)
                  }
                  className={`px-2 py-0.5 rounded border text-xs ${
                    selectedMonth === i
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {new Date(0, i).toLocaleString("default", { month: "short" })}
                </button>
              ))}
            </div>
          </div>

          {/* 🗓 Custom Date Picker */}
          <div>
            <p className="font-semibold text-gray-600 mb-1">Custom Range</p>
            <hr className="mb-2" />
            <div className="flex gap-1 flex-wrap">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-1 border rounded text-xs"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-1 border rounded text-xs"
              />
            </div>
          </div>

          {/* 🗂 Category Filter */}
          <div>
            <p className="font-semibold text-gray-600 mb-1">Categories</p>
            <hr className="mb-2" />
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-2 py-0.5 rounded border text-xs ${
                  selectedCategory === ""
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-0.5 rounded border text-xs ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🧾 Sales List */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white p-4 border rounded shadow ">
        {/* 💰 Total Sales Info */}
        <div className="text-lg font-semibold text-gray-800">
          {filteredSales.length > 0 ? (
            <>
              Total Sales{" "}
              {startDate || endDate ? (
                <>
                  from{" "}
                  <span className="text-blue-600">
                    {startDate
                      ? format(new Date(startDate), "MMMM d")
                      : "the start"}
                  </span>{" "}
                  to{" "}
                  <span className="text-blue-600">
                    {endDate ? format(new Date(endDate), "MMMM d") : "today"}
                  </span>
                </>
              ) : (
                <span className="text-blue-600">(All Time)</span>
              )}
              :{" "}
              <span className="text-green-600">
                ₱
                {filteredSales
                  .reduce((sum, sale) => sum + sale.total, 0)
                  .toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-gray-500 italic">
              No sales found in this range.
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-2 rounded">
          {/* 📊 Export Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCSV}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              📄 Export CSV
            </button>
            <button
              onClick={() => exportSalesToXlsx(filteredSales)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              📊 Export XLSX
            </button>
            <button
              onClick={handleBackupLocalStorage}
              className="px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-800"
            >
              📥 Backup Data
            </button>
          </div>

          {/* 📤 Restore Upload */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="relative text-sm cursor-pointer">
              <span className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600">
                📤 Restore Backup
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreLocalStorage}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>

            {selectedBackupFile && (
              <div className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs max-w-full">
                <span className="truncate max-w-[160px]">
                  📁 {selectedBackupFile.name}
                </span>
                <button
                  onClick={() => setSelectedBackupFile(null)}
                  className="hover:bg-red-100 text-red-500 hover:text-red-700 rounded-full px-1"
                >
                  ❌
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredSales.map((sale) => (
        <div key={sale.id} className="border p-4 mb-4 bg-white rounded shadow">
          {/* <p className="font-bold">
            {sale.table} — {format(new Date(sale.date), "yyyy-MM-dd HH:mm")}
          </p> */}
          <p className="font-bold">
            {sale.table} — {format(new Date(sale.date), "yyyy-MM-dd HH:mm")}
          </p>
          <p className="text-xs text-gray-600 mb-2">Receipt ID: {sale.id}</p>
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
              <h2 className="font-bold text-sm mb-1">THE COZY FORK</h2>
              <p className="mb-1">Rizal, Laguna</p>
              <p className="mb-1">Receipt ID: {selectedSale.id}</p>
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
