import { useEffect, useState } from "react";
import { tables } from "../data/tables.js";
import Card from "../components/Card";

const allMenuItems = JSON.parse(localStorage.getItem("menu") || "[]");
const CATEGORIES = [...new Set(allMenuItems.map((item) => item.category))];

export default function POS() {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [cash, setCash] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Meals");
  const [showTableDrawer, setShowTableDrawer] = useState(false);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedTable, setSelectedTable] = useState(() => {
    const saved = localStorage.getItem("selectedTable");
    return saved ? JSON.parse(saved) : null;
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [menu, setMenu] = useState(() => {
    return JSON.parse(localStorage.getItem("menu") || "[]");
  });
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  useEffect(() => {
    const storedMenu = JSON.parse(localStorage.getItem("menu") || "[]");
    setMenu(storedMenu);
  }, []);

  useEffect(() => {
    const syncMenu = () => {
      const latestMenu = JSON.parse(localStorage.getItem("menu") || "[]");
      setMenu(latestMenu);
    };
    window.addEventListener("storage", syncMenu);
    return () => window.removeEventListener("storage", syncMenu);
  }, []);

  const filteredMenu = menu.filter(
    (item) =>
      item.category === category &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("selectedTable", JSON.stringify(selectedTable));
  }, [selectedTable]);

  const handleOrder = (item) => {
    if (!selectedTable) return alert("Select a table first");
    setOrders((prev) => {
      const tableOrders = prev[selectedTable.id] || [];
      return { ...prev, [selectedTable.id]: [...tableOrders, item] };
    });
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

  // const removeAllItems = (itemId) => {
  //   const tableId = selectedTable.id;
  //   const tableOrders = orders[tableId] || [];
  //   const updatedOrders = tableOrders.filter((item) => item.id !== itemId);
  //   setOrders((prev) => ({
  //     ...prev,
  //     [tableId]: updatedOrders,
  //   }));
  // };

  const completeSale = () => {
    if (!selectedTable) return;

    const tableOrders = orders[selectedTable.id] || [];
    if (tableOrders.length === 0) {
      return alert("No orders to checkout.");
    }

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
    setCash("");
    setIsCheckoutOpen(false);
    alert("✅ Payment received and recorded in sales.");
  };

  const printBill = () => {
    if (!selectedTable || !orders[selectedTable.id]?.length) return;
    setIsSummaryOpen(true);
  };

  const totalAmount = (orders[selectedTable?.id] || []).reduce(
    (acc, item) => acc + item.price,
    0
  );

  const change = Math.max(0, (parseFloat(cash) || 0) - totalAmount);

  const renderOrderItems = (items) => {
    // return Object.values(
    //   (items || []).reduce((acc, item) => {
    //     const key = item.id;
    //     if (!acc[key]) acc[key] = { ...item, quantity: 1 };
    //     else acc[key].quantity += 1;
    //     return acc;
    //   }, {})
    // ).map((item, i) => (
    //   <li
    //     key={i}
    //     className="flex justify-between items-center border-b pb-1 text-sm"
    //   >
    //     <span className="truncate max-w-[60%]">
    //       {item.name} x{item.quantity}
    //     </span>
    //     <span className="font-semibold">₱{item.price * item.quantity}</span>
    //   </li>
    // ));
    return Object.values(
      (items || []).reduce((acc, item) => {
        const key = item.id;
        if (!acc[key]) acc[key] = { ...item, quantity: 1 };
        else acc[key].quantity += 1;
        return acc;
      }, {})
    ).map((item, i) => (
      <li
        key={i}
        className="flex justify-between items-center border-b pb-1 text-sm"
      >
        <div className="flex items-center gap-2 max-w-[70%]">
          {isEditingOrder && (
            <button
              onClick={() => removeOneItem(item.id, selectedTable.id)}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              −
            </button>
          )}
          <span className="truncate">{item.name}</span>
          <span className="text-gray-500">x{item.quantity}</span>
        </div>
        <span className="font-semibold whitespace-nowrap">
          ₱{item.price * item.quantity}
        </span>
      </li>
    ));
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Categories and search bar */}
      {selectedTable && (
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded border ${
                  cat === category ? "bg-blue-600 text-white" : "bg-white"
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
            className="border p-2 w-full"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row gap-4 px-4 max-h-[80vh] overflow-y-auto">
        {/* Menu */}
        <div className="md:w-2/3 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 border rounded bg-white shadow cursor-pointer 
  hover:bg-green-50 active:bg-green-100 active:scale-95 
  transition-all duration-100 ease-in-out"
                onClick={() => handleOrder(item)}
              >
                <h4 className="font-bold text-sm sm:text-base">{item.name}</h4>
                <p className="font-semibold text-xs sm:text-sm text-gray-700">
                  ₱{item.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        {selectedTable && (
          <div className="flex flex-col gap-2 md:sticky md:top-4 md:self-start w-full md:w-[300px]">
            <div className="hidden md:flex bg-green-500 justify-between px-2 rounded py-2 lg:mx-4.5 border">
              <span className="text-white font-semibold">Total:</span>
              <p className="font-bold text-white text-3xl"> ₱{totalAmount}</p>
            </div>
            <Card>
              <div className="w-full mx-auto">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold mb-2">
                    Orders for {selectedTable?.name}:
                  </h2>
                  <div className="flex justify-end mb-2 print:hidden">
                    <button
                      onClick={() => setIsEditingOrder((prev) => !prev)}
                      className="text-xs font-semibold px-2 hover:bg-yellow-500 text-green-700 rounded"
                    >
                      {isEditingOrder ? "Done" : "Edit"}
                    </button>
                  </div>
                </div>

                <ul className="mb-2 space-y-1 max-h-[300px] overflow-y-auto pr-2">
                  {renderOrderItems(orders[selectedTable.id])}
                </ul>

                <p className="font-bold">Total: ₱{totalAmount}</p>
                <div className="mt-2">
                  <label className="text-sm block mb-1">Cash</label>
                  <input
                    type="number"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    className="border p-1 w-full text-sm"
                  />
                </div>
                <p className="text-sm mt-1">
                  Change: ₱<strong>{change}</strong>
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    disabled={
                      !selectedTable ||
                      !(orders[selectedTable?.id]?.length > 0) ||
                      !cash ||
                      parseFloat(cash) < totalAmount
                    }
                    onClick={() => setIsCheckoutOpen(true)}
                    className={`px-4 pt-2 md:pt-1 pb-2 text-white rounded w-full transition-colors duration-200 ${
                      !selectedTable ||
                      !(orders[selectedTable?.id]?.length > 0) ||
                      !cash ||
                      parseFloat(cash) < totalAmount
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Checkout
                  </button>

                  <button
                    onClick={printBill}
                    className={`px-4 pt-2 md:pt-1 pb-2 border rounded w-full ${
                      !orders[selectedTable?.id]?.length
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    disabled={!orders[selectedTable?.id]?.length}
                  >
                    🖨 Print Bill
                  </button>
                </div>
              </div>
              {orders[selectedTable?.id]?.length > 0 && (
                <button
                  onClick={() => {
                    const confirmReset = confirm("Reset order for this table?");
                    if (confirmReset) {
                      const updatedOrders = { ...orders };
                      delete updatedOrders[selectedTable.id];
                      setOrders(updatedOrders);
                      setCash("");
                    }
                  }}
                  className="mt-1 font-bold bg-red-400 hover:bg-red-700 text-white text-sm px-4 py-2 rounded w-full mb-2"
                >
                  Reset Order
                </button>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Table selection */}
      {/* Table Drawer */}
      <div className="bg-white border-t sticky bottom-0 z-30 shadow-inner">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            You're on {selectedTable?.name || "None"}
          </h2>
          <button
            onClick={() => setShowTableDrawer((prev) => !prev)}
            className="text-sm px-3 py-1 border rounded bg-blue-600 text-white"
          >
            {showTableDrawer ? "Hide Tables" : "Show Tables"}
          </button>
        </div>

        {showTableDrawer && (
          <div className="p-4 border-t animate-slideDown">
            <div className="flex flex-wrap gap-2">
              {tables.map((table) => {
                const isOccupied = (orders[table.id]?.length ?? 0) > 0;
                return (
                  <button
                    key={table.id}
                    className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded border transition-all duration-300 ${
                      selectedTable?.id === table.id
                        ? "bg-blue-600 text-white"
                        : isOccupied
                        ? "bg-red-500 text-white"
                        : "bg-white"
                    }`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <div className="font-semibold">{table.name}</div>
                    <div
                      className={`text-xs ${
                        isOccupied ? "text-white" : "text-green-600"
                      }`}
                    >
                      {isOccupied ? "Occupied" : "Vacant"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal for printing */}
      {isSummaryOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-4 rounded shadow w-full max-w-sm animate-slideUp">
            <h2 className="text-lg font-bold text-center mb-4">
              THE COZY FORK
            </h2>
            <p className="mb-1">Table: {selectedTable?.name}</p>
            <div className="border-b border-dashed mb-2"></div>
            <ul className="space-y-1">
              {renderOrderItems(orders[selectedTable.id])}
            </ul>
            <div className="border-t border-dashed my-2"></div>
            <p className="font-bold">Total: ₱{totalAmount}</p>
            <div className="flex justify-end gap-2 mt-4 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-1 bg-blue-600 text-white text-sm rounded"
              >
                🖨 Print
              </button>
              <button
                onClick={() => setIsSummaryOpen(false)}
                className="border px-4 py-1 text-sm rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for checkout confirmation */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-slideUp">
            <h2 className="text-lg font-bold mb-2">Confirm Checkout</h2>
            <p>
              Table: <strong>{selectedTable?.name}</strong>
            </p>
            <p>
              Total: ₱<strong>{totalAmount}</strong>
            </p>
            <p>
              Cash: ₱<strong>{cash}</strong>
            </p>
            <p>
              Change: ₱<strong>{change}</strong>
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={completeSale}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
