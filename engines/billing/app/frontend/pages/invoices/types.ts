export type InvoiceItem = {
  id: string;
  number: string;
  customerName: string;
  status: "draft" | "issued" | "paid" | "void";
  total: { minor: number; currency: string; exponent: number };
  issuedOn: string;
};
