export type InvoiceItem = {
  id: string;
  number: string;
  customerName: string;
  status: string;
  total: { minor: number; currency: string; exponent: number };
  issuedOn: string;
  deleteHref: string;
};
