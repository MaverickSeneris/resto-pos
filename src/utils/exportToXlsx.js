import * as XLSX from "xlsx";

export function exportSalesToXlsx(sales, filename = "sales-report.xlsx") {
  if (!Array.isArray(sales) || sales.length === 0) {
    alert("No sales data to export.");
    return;
  }

  const rows = sales.map((sale) => ({
    ID: sale.id,
    Table: sale.table,
    Date: new Date(sale.date).toLocaleString(),
    Total: sale.total,
    Cash: sale.cash ?? "",
    Change: sale.change ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

  XLSX.writeFile(workbook, filename);
}
