export type InvoiceFormValues = Readonly<{
  customerName: string;
  status: string;
  total: string;
}>;

export function initialInvoiceForm(initial?: Partial<InvoiceFormValues>): InvoiceFormValues {
  return {
    customerName: initial?.customerName ?? "",
    status: initial?.status ?? "open",
    total: initial?.total ?? "",
  };
}

export function invoiceFormPayload(values: InvoiceFormValues) {
  return {
    customerName: values.customerName,
    status: values.status,
    total: values.total,
  };
}
