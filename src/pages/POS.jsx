import { useEffect, useState, useRef } from "react";
import { sampleMenu } from "../data/sampleMenu.js";
import { tables } from "../data/tables.js";

const CATEGORIES = ["Meals", "Drinks", "Ala Carte"];

export default function POS() {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [cash, setCash] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Meals");
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedTable, setSelectedTable] = useState(() => {
    const saved = localStorage.getItem("selectedTable");
    return saved ? JSON.parse(saved) : null;
  });
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("selectedTable", JSON.stringify(selectedTable));
  }, [selectedTable]);

  const filteredMenu = sampleMenu.filter(
    (item) =>
      item.category === category &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsSummaryOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleOrder = (item) => {
    if (!selectedTable) return alert("Select a table first");
    setOrders((prev) => {
      const tableOrders = prev[selectedTable.id] || [];
      return { ...prev, [selectedTable.id]: [...tableOrders, item] };
    });
  };

  const deleteItem = (index) => {
    const tableId = selectedTable.id;
    const updated = [...(orders[tableId] || [])];
    updated.splice(index, 1);
    const newOrders = { ...orders, [tableId]: updated };
    setOrders(newOrders);
  };

  const completeSale = () => {
    if (!selectedTable) return;

    const tableOrders = orders[selectedTable.id] || [];
    const total = tableOrders.reduce((acc, item) => acc + item.price, 0);
    const paidAmount = parseFloat(cash);

    if (isNaN(paidAmount) || paidAmount < total) {
      return alert("Insufficient cash payment.");
    }

    const receipt = {
      id: Date.now(),
      items: tableOrders,
      table: selectedTable.name,
      date: new Date().toISOString(),
      total,
      cash: paidAmount,
      change: paidAmount - total,
    };

    const history = JSON.parse(localStorage.getItem("sales") || "[]");
    history.push(receipt);
    localStorage.setItem("sales", JSON.stringify(history));

    const updatedOrders = { ...orders, [selectedTable.id]: [] };
    setOrders(updatedOrders);
    setCash(""); // reset cash input

    alert("✅ Payment received and recorded in sales.");
  };

  const removeOneItem = (itemId) => {
    const tableId = selectedTable.id;
    const tableOrders = orders[tableId] || [];
    const index = tableOrders.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    const updatedOrders = [...tableOrders];
    updatedOrders.splice(index, 1);

    setOrders((prev) => ({
      ...prev,
      [tableId]: updatedOrders,
    }));
  };

  const removeAllItems = (itemId) => {
    const tableId = selectedTable.id;
    const tableOrders = orders[tableId] || [];

    const updatedOrders = tableOrders.filter((item) => item.id !== itemId);

    setOrders((prev) => ({
      ...prev,
      [tableId]: updatedOrders,
    }));
  };

  const openSummaryModal = () => {
    const total = (orders[selectedTable.id] || []).reduce(
      (acc, item) => acc + item.price,
      0
    );
    const paid = parseFloat(cash);
    if (isNaN(paid) || paid < total) {
      return alert("Please input the exact or excess amount.");
    }
    if ((orders[selectedTable.id] || []).length === 0) {
      return alert("No items ordered yet.");
    }
    setIsSummaryOpen(true);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Select Table:</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {tables.map((table) => {
          const isOccupied = (orders[table.id]?.length ?? 0) > 0;
          return (
            <button
              key={table.id}
              className={`px-4 py-2 rounded whitespace-nowrap border ${
                selectedTable?.id === table.id
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
              onClick={() => setSelectedTable(table)}
            >
              <div className="text-sm font-semibold">{table.name}</div>
              <div
                className={`text-xs ${
                  isOccupied ? "text-red-600" : "text-green-600"
                }`}
              >
                {isOccupied ? "Occupied" : "Vacant"}
              </div>
            </button>
          );
        })}
      </div>

      {selectedTable && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 ${
                  cat === category
                    ? "bg-blue-600 text-white"
                    : "bg-white border"
                }`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 mb-4 w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded bg-white shadow cursor-pointer"
                onClick={() => handleOrder(item)}
              >
                <h4 className="font-bold">{item.name}</h4>
                <p>₱{item.price}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="font-bold mb-2">Orders for {selectedTable.name}:</h2>
            <ul className="mb-2 space-y-1">
              {Object.entries(
                (orders[selectedTable.id] || []).reduce((acc, item) => {
                  const key = item.id;
                  if (!acc[key]) acc[key] = { ...item, quantity: 1 };
                  else acc[key].quantity += 1;
                  return acc;
                }, {})
              ).map(([id, item]) => (
                <li
                  key={id}
                  className="flex justify-between items-center border-b pb-1"
                >
                  <span>
                    {item.name} x{item.quantity} - ₱{item.price * item.quantity}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeOneItem(parseInt(id))}
                      className="text-yellow-600 hover:text-yellow-800 text-sm"
                    >
                      🗑 Remove One
                    </button>
                    <button
                      onClick={() => removeAllItems(parseInt(id))}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ❌ Remove All
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <p className="font-bold">
              Total: ₱
              {(orders[selectedTable.id] || []).reduce(
                (acc, item) => acc + item.price,
                0
              )}
            </p>
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-sm font-medium">
                  Cash Payment:
                </label>
                <input
                  type="number"
                  className="border p-2 w-full mt-1"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  placeholder="Enter cash amount"
                />
              </div>
              <p className="text-sm">
                Change:{" "}
                <span className="font-bold">
                  ₱
                  {Math.max(
                    0,
                    (parseFloat(cash) || 0) -
                      (orders[selectedTable.id] || []).reduce(
                        (acc, item) => acc + item.price,
                        0
                      )
                  )}
                </span>
              </p>
            </div>
            <button
              // onClick={() => setIsSummaryOpen(true)}
              onClick={openSummaryModal}
              className={`mt-3 px-4 py-2 text-white rounded ${
                parseFloat(cash) >=
                (orders[selectedTable.id] || []).reduce(
                  (acc, item) => acc + item.price,
                  0
                )
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={
                parseFloat(cash) <
                (orders[selectedTable.id] || []).reduce(
                  (acc, item) => acc + item.price,
                  0
                )
              }
            >
              Checkout
            </button>
          </div>
        </>
      )}

      {isSummaryOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl transition-all duration-300 animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white">
              Order Summary
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="font-semibold text-xl">
                {selectedTable?.name}
              </span>
            </p>

            <ul className="mb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {Object.entries(
                (orders[selectedTable.id] || []).reduce((acc, item) => {
                  const key = item.id;
                  if (!acc[key]) acc[key] = { ...item, quantity: 1 };
                  else acc[key].quantity += 1;
                  return acc;
                }, {})
              ).map(([id, item]) => (
                <li
                  key={id}
                  className="flex justify-between border-b pb-1 text-sm"
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    ₱{item.price * item.quantity}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-700 dark:text-gray-200">
                Cash: <span className="font-semibold">₱{cash}</span>
              </p>
              <p className="font-medium text-gray-700 dark:text-gray-200">
                Total:{" "}
                <span className="font-semibold">
                  ₱
                  {(orders[selectedTable.id] || []).reduce(
                    (acc, item) => acc + item.price,
                    0
                  )}
                </span>
              </p>
              <p className="font-medium text-green-700 dark:text-green-400">
                Change:{" "}
                <span className="font-semibold">
                  ₱
                  {Math.max(
                    0,
                    (parseFloat(cash) || 0) -
                      (orders[selectedTable.id] || []).reduce(
                        (acc, item) => acc + item.price,
                        0
                      )
                  )}
                </span>
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsSummaryOpen(false)}
                className="px-4 py-2 rounded-md border border-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-white bg-red-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  completeSale();
                  setIsSummaryOpen(false);
                }}
                ref={confirmBtnRef}
                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
