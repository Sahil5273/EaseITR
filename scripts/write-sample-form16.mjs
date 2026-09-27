import { writeFileSync } from "node:fs";

const lines = [
  "Sample Form 16",
  "Employee name: Asha Mehta",
  "PAN: ABCDE1234F",
  "Employer: Example Technologies Pvt Ltd",
  "Gross salary: 1284000",
  "Tax deducted: 82400",
];

function escapePdf(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

let textOps = "BT\n/F1 16 Tf\n72 720 Td\n";
lines.forEach((line, index) => {
  if (index === 0) textOps += `(${escapePdf(line)}) Tj\n`;
  else textOps += `0 -32 Td\n(${escapePdf(line)}) Tj\n`;
});
textOps += "ET\n";

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
  `<< /Length ${Buffer.byteLength(textOps)} >>\nstream\n${textOps}endstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [0];
objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let index = 1; index <= objects.length; index += 1) {
  pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
writeFileSync(new URL("../public/sample-form-16.pdf", import.meta.url), pdf);
