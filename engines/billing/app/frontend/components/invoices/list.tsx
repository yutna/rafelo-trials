import { useBillingTranslation } from "@billing/i18n";
import { DataTable, EmptyState, formatDate, formatMoney, useLocale } from "@design_system/public";

import type { InvoiceListRow } from "./list.types";

function statusLabel(t: (key: string) => string, status: string): string {
  const key = `invoices.statuses.${status}`;
  const label = t(key);
  return label === key ? status : label;
}

function onSortChange() {
  // Sorting stays on the server (BE-07); this table does not offer it yet.
}

export function InvoicesList({
  items,
  emptyLabel,
}: {
  items: InvoiceListRow[];
  emptyLabel: string;
}) {
  const { locale } = useLocale();
  const t = useBillingTranslation();

  if (items.length === 0) {
    return <EmptyState testId="billing.invoices.index.empty" title={emptyLabel} />;
  }

  const rows = items.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    customer: invoice.customerName,
    status: statusLabel(t, invoice.status),
    total: formatMoney(invoice.total.minor, invoice.total.currency, invoice.total.exponent, locale),
    issuedOn: formatDate(invoice.issuedOn, locale),
  }));
  const columns = [
    { accessorKey: "number", header: t("invoices.number"), enableSorting: false },
    { accessorKey: "customer", header: t("invoices.customer"), enableSorting: false },
    { accessorKey: "status", header: t("invoices.status"), enableSorting: false },
    { accessorKey: "total", header: t("invoices.total"), enableSorting: false },
    { accessorKey: "issuedOn", header: t("invoices.issued_on"), enableSorting: false },
  ];

  return (
    <div className="mt-6 overflow-x-auto">
      <DataTable
        testId="billing.invoices.index.list"
        data={rows}
        columns={columns}
        emptyLabel={emptyLabel}
        sort={null}
        onSortChange={onSortChange}
      />
    </div>
  );
}
