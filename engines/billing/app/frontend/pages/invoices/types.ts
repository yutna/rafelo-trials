export type InvoiceItem = {
  id: string;
  number: string;
  customerName: string;
  status: "open" | "draft" | "issued" | "paid" | "cancelled" | "void";
  total: { minor: number; currency: string; exponent: number };
  issuedOn: string;
};
