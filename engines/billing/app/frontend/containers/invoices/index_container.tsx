import type { InvoiceListRow } from "@billing/components/invoices/list.types";
import type { Href } from "@design_system/public";

import { InvoicesList } from "@billing/components/invoices/list";
import { useInvoiceDelete } from "@billing/hooks/invoices/use_invoice_delete";
import { useBillingTranslation } from "@billing/i18n";
import { ConfirmDialog, Link } from "@design_system/public";

type Props = {
  items: InvoiceListRow[];
  newHref: Href;
  previousHref: Href | null;
  nextHref: Href | null;
  can: Record<string, { allowed: boolean; reason: string | null }>;
  meta: { formToken: string };
  errors: Record<string, string>;
};

export function InvoicesIndexContainer({
  items,
  newHref,
  previousHref,
  nextHref,
  can,
  meta,
  errors,
}: Props) {
  const t = useBillingTranslation();
  const remove = useInvoiceDelete(meta.formToken);
  const canDelete = can["invoice.delete"]?.allowed === true;

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-display font-semibold" data-testid="billing.invoices.index.title">
          {t("invoices.title")}
        </h1>
        {can["invoice.create"]?.allowed ? (
          <Link
            testId="billing.invoices.index.new.link"
            href={newHref}
            className="rounded-card bg-primary px-4 py-2 text-white"
          >
            <span data-testid="billing.invoices.index.new">{t("invoices.add")}</span>
          </Link>
        ) : null}
      </div>
      {errors.base ? (
        <p role="alert" data-testid="billing.invoices.index.error" className="mt-4 text-danger">
          {errors.base}
        </p>
      ) : null}
      <InvoicesList
        items={items}
        emptyLabel={t("invoices.empty")}
        canDelete={canDelete}
        onDelete={remove.request}
      />
      <ConfirmDialog
        testId="billing.invoices.index.delete.dialog"
        title={t("invoices.delete.title")}
        message={t("invoices.delete.message", { number: remove.pending?.number ?? "" })}
        confirmLabel={t("invoices.delete.confirm")}
        cancelLabel={t("invoices.delete.cancel")}
        open={remove.pending !== null}
        onConfirm={remove.confirm}
        onCancel={remove.cancel}
        destructive
      />
      <nav aria-label={t("invoices.pagination")} className="mt-6 flex gap-4">
        {previousHref ? (
          <Link testId="billing.invoices.index.previous.link" href={previousHref}>
            {t("invoices.previous")}
          </Link>
        ) : null}
        {nextHref ? (
          <Link testId="billing.invoices.index.next.link" href={nextHref}>
            {t("invoices.next")}
          </Link>
        ) : null}
      </nav>
    </section>
  );
}
