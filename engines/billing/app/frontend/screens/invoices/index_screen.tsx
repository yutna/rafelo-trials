import { Link } from "@design_system/public";

import { InvoicesList, type InvoiceRow } from "../../components/invoices/list";
import { useBillingTranslation } from "../../i18n";

type Pagination = {
  kind: "offset";
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
};

type Props = {
  items: InvoiceRow[];
  previousHref: string | null;
  nextHref: string | null;
  pagination: Pagination | null;
};

export function InvoicesScreen({
  items,
  previousHref,
  nextHref,
  pagination,
}: Props) {
  const t = useBillingTranslation();

  return (
    <section
      className="mx-auto max-w-5xl px-6 py-16"
      data-testid="billing.invoices.index.page"
    >
      <h1 className="text-display font-semibold">{t("invoices.title")}</h1>
      <p className="mt-1 text-slate-600">{t("invoices.subtitle")}</p>
      <InvoicesList items={items} />
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
