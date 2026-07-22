import * as XLSX from "xlsx";

export interface ExportColumn<T = Record<string, unknown>> {
  header: string;
  key: string;
  format?: (value: unknown, row: T) => string;
}

export function exportToCSV<T extends Record<string, unknown>>(
  columns: ExportColumn<T>[],
  rows: T[],
  filename: string,
): void {
  const header = columns.map((c) => c.header).join(",");
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        const display = c.format ? c.format(val, row) : String(val ?? "");
        if (display.includes(",") || display.includes('"') || display.includes("\n")) {
          return `"${display.replace(/"/g, '""')}"`;
        }
        return display;
      })
      .join(","),
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

export function exportToExcel<T extends Record<string, unknown>>(
  columns: ExportColumn<T>[],
  rows: T[],
  filename: string,
  sheetName = "Report",
): void {
  const data = rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const col of columns) {
      obj[col.header] = col.format ? col.format(row[col.key], row) : row[col.key];
    }
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function printReport(title: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const content = document.getElementById("report-content");
  if (!content) return;

  printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1a1a1a; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; }
      tr:nth-child(even) { background: #fafafa; }
      .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
      .stat-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
      .stat-label { font-size: 11px; color: #666; text-transform: uppercase; }
      .stat-value { font-size: 20px; font-weight: 700; margin-top: 2px; }
      @media print { body { margin: 0; } }
    </style></head><body>
    <h1>${title}</h1>
    <div class="subtitle">Generated on ${new Date().toLocaleString("en-IN")} | Smart Inventory System</div>
    ${content.innerHTML}
    </body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
