/** Triggers a browser download of in-memory content. */
export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  // Firefox needs the link in the document, and revoking the URL in the same
  // tick can cancel the download, so clean up on the next task.
  document.body.append(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

/**
 * RFC 4180 CSV with quoted fields. Text that a spreadsheet would run as a
 * formula (=, +, -, @, tab, CR) is prefixed with an apostrophe, so a customer
 * named "=HYPERLINK(…)" can't inject a formula into the export.
 */
export function toCsv(header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const text = typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : String(v);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [header.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

export const todayStamp = () => new Date().toISOString().slice(0, 10);
