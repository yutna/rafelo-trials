import { Link } from "@design_system/public";

import { InvoicesIndexContainer } from "../../containers/invoices/index_container";
import type { InvoiceRow } from "../../components/invoices/list";
import { useBillingTranslation } from "../../i18n";

type Capability = { allowed: boolean; reason: string | null };

type Pagination = {
  kind: "offset";
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
};

export type InvoicesScreenProps = {
  items: InvoiceRow[];
  newHref: string;
  previousHref: string | null;
  nextHref: string | null;
  can: Record<string, Capability>;
  pagination: Pagination | null;
  formToken: string;
};

export function InvoicesScreen({
  items,
  newHref,
  previousHref,
  nextHref,
  can,
  pagination,
  formToken,
}: InvoicesScreenProps) {
  const t = useBillingTranslation();

  return (
    <section
      className="mx-auto max-w-5xl px-6 py-16"
      data-testid="billing.invoices.index.page"
    >
      <h1 className="text-display font-semibold">{t("invoices.title")}</h1>
      <p className="mt-1 text-slate-600">{t("invoices.subtitle")}</p>
      {can["invoice.create"]?.allowed ? (
        <p className="mt-4">
          <Link href={newHref} className="underline">
            <span data-testid="billing.invoices.index.new">
              {t("invoices.add")}
            </span>
          </Link>
        </p>
      ) : null}
      <InvoicesIndexContainer
        items={items}
        canDelete={can["invoice.delete"]?.allowed === true}
        formToken={formToken}
      />
      {pagination ? (
        <nav
          aria-label={t("invoices.pagination")}
          className="mt-6 flex items-center gap-4"
        >
          {previousHref ? (
            <Link href={previousHref} className="underline">
              <span data-testid="billing.invoices.index.previous">
                {t("invoices.previous")}
              </span>
            </Link>
          ) : null}
          <span
            className="text-slate-600"
            data-testid="billing.invoices.index.page-number"
          >
            {t("invoices.page")} {pagination.page} / {pagination.pageCount}
          </span>
          {nextHref ? (
            <Link href={nextHref} className="underline">
              <span data-testid="billing.invoices.index.next">
                {t("invoices.next")}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
