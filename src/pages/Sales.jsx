import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("sales") || "[]");
    setSales(data);
  }, []);

  const filtered = filterDate
    ? sales.filter((sale) => sale.date.startsWith(filterDate))
    : sales;

    const deleteSale = (id) => {
      const password = prompt("Enter admin password to delete:");
      if (password !== "admin123") {
        alert("Wrong password.");
        return;
      }

      const updated = sales.filter((sale) => sale.id !== id);
      localStorage.setItem("sales", JSON.stringify(updated));
      setSales(updated);
    };


  return (
    <div className="p-4">
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        className="mb-4 p-2 border"
      />
      {filtered.map((sale) => (
        <div key={sale.id} className="border p-4 mb-2 bg-white rounded shadow">
          <p className="font-bold">
            {sale.table} - {format(new Date(sale.date), "yyyy-MM-dd HH:mm")}
          </p>
          <ul>
            {sale.items.map((item, i) => (
              <li key={i}>
                {item.name} - ₱{item.price}
              </li>
            ))}
          </ul>
          <p className="font-bold mt-2">Total: ₱{sale.total}</p>
          {sale.cash !== undefined && (
            <>
              <p>Cash: ₱{sale.cash}</p>
              <p>Change: ₱{sale.change}</p>
            </>
          )}
          <button
            onClick={() => deleteSale(sale.id)}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            🗑 Delete Sale
          </button>
        </div>
      ))}
    </div>
  );
}