export type InvoiceListRow = {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: { minor: number; currency: string; exponent: number };
  issuedOn: string;
  deleteHref: string | null;
};
