const escapePdfText = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")

export const generateInvoicePdf = (sale) => {
  const lines = [
    "Stockly Invoice",
    `Invoice No: ${sale.invoiceNo}`,
    `Date: ${new Date(sale.createdAt).toLocaleString()}`,
    `Customer: ${sale.customer?.name || "Walk-in Customer"}`,
    `Cashier: ${sale.cashier?.name || "-"}`,
    `Payment: ${sale.paymentMethod}`,
    "",
    "Items",
    ...sale.items.map(
      (item) =>
        `${item.name} x${item.quantity} @ ₹${item.unitPrice.toFixed(2)} = ₹${item.totalPrice.toFixed(2)}`
    ),
    "",
    `Subtotal: ₹${sale.subtotal.toFixed(2)}`,
    `Discount: ₹${sale.discountAmount.toFixed(2)}`,
    `Tax: ₹${sale.taxAmount.toFixed(2)}`,
    `Total: ₹${sale.total.toFixed(2)}`,
    `Tendered: ₹${sale.amountTendered.toFixed(2)}`,
    `Change: ₹${sale.changeAmount.toFixed(2)}`,
  ]

  const contentStream = [
    "BT",
    "/F1 12 Tf",
    "50 760 Td",
    ...lines.flatMap((line, index) => {
      if (index === 0) {
        return [`(${escapePdfText(line)}) Tj`]
      }
      return ["0 -18 Td", `(${escapePdfText(line)}) Tj`]
    }),
    "ET",
  ].join("\n")

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(contentStream, "utf8")} >> stream\n${contentStream}\nendstream endobj`,
  ]

  let pdf = "%PDF-1.4\n"
  const offsets = [0]

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"))
    pdf += `${object}\n`
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8")
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, "utf8")
}
