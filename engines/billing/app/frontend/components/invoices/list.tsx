import {
  Button,
  DataTable,
  formatDate,
  formatMoney,
  useLocale,
} from "@design_system/public";

import { useBillingTranslation } from "../../i18n";

export type InvoiceRow = {
  id: string;
  number: string;
  customerName: string;
  status: string;
  total: { minor: number; currency: string; exponent: number };
  issuedOn: string;
  deleteHref: string;
};

type Props = {
  items: InvoiceRow[];
  canDelete: boolean;
  onDelete: (invoice: InvoiceRow) => void;
};

export function InvoicesList({ items, canDelete, onDelete }: Props) {
  const { locale } = useLocale();
  const t = useBillingTranslation();

  if (items.length === 0) {
    return (
      <p
        className="mt-6 text-slate-600"
        data-testid="billing.invoices.index.empty"
      >
        {t("invoices.empty")}
      </p>
    );
  }

  const rows = items.map((invoice) => {
    const statusKey = `invoices.statuses.${invoice.status}`;
    const status = t(statusKey);
    return {
      id: invoice.id,
      number: invoice.number,
      customer: invoice.customerName,
      status: status === statusKey ? invoice.status : status,
      total: formatMoney(
        invoice.total.minor,
        invoice.total.currency,
        invoice.total.exponent,
        locale,
      ),
      issuedOn: formatDate(invoice.issuedOn, locale),
    };
  });
  const columns: Parameters<typeof DataTable>[0]["columns"] = [
    { accessorKey: "number", header: t("invoices.number") },
    { accessorKey: "customer", header: t("invoices.customer") },
    { accessorKey: "status", header: t("invoices.status") },
    { accessorKey: "total", header: t("invoices.total") },
    { accessorKey: "issuedOn", header: t("invoices.issued_on") },
  ];
  if (canDelete) {
    columns.push({
      id: "delete",
      header: t("invoices.actions"),
      cell: ({ row }) => {
        const invoice = items.find(
          (item) => item.id === String(row.original.id),
        );
        if (!invoice) return null;
        return (
          <Button
            testId={`billing.invoices.index.delete.${invoice.id}`}
            variant="secondary"
            onPress={() => onDelete(invoice)}
          >
            {t("invoices.delete.action")}
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
        emptyLabel={t("invoices.empty")}
      />
    </div>
  );
}
