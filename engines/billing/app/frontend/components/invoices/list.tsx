import { useBillingTranslation } from "@billing/i18n";
import {
  Button,
  DataTable,
  EmptyState,
  formatDate,
  formatMoney,
  useLocale,
} from "@design_system/public";

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
  canDelete,
  onDelete,
}: {
  items: InvoiceListRow[];
  emptyLabel: string;
  canDelete: boolean;
  onDelete: (invoice: InvoiceListRow) => void;
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
  const columns: Parameters<typeof DataTable>[0]["columns"] = [
    { accessorKey: "number", header: t("invoices.number"), enableSorting: false },
    { accessorKey: "customer", header: t("invoices.customer"), enableSorting: false },
    { accessorKey: "status", header: t("invoices.status"), enableSorting: false },
    { accessorKey: "total", header: t("invoices.total"), enableSorting: false },
    { accessorKey: "issuedOn", header: t("invoices.issued_on"), enableSorting: false },
  ];
  if (canDelete) {
    columns.push({
      id: "delete",
      header: t("invoices.actions"),
      cell: ({ row }) => {
        const invoice = items.find((item) => item.id === String(row.original.id));
        if (!invoice?.deleteHref) return null;
        return (
          <Button
            testId={`billing.invoices.index.list.row.${invoice.id}.delete`}
            variant="secondary"
            onPress={() => onDelete(invoice)}
          >
            {t("invoices.delete.action")} <span className="sr-only">{invoice.number}</span>
          </Button>
        );
      },
    });
  }

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
