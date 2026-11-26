import type { InvoiceListRow } from "@billing/components/invoices/list.types";
import type { Href } from "@design_system/public";

import { InvoicesList } from "@billing/components/invoices/list";
import { useBillingTranslation } from "@billing/i18n";
import { Link } from "@design_system/public";

type Props = {
  items: InvoiceListRow[];
  previousHref: Href | null;
  nextHref: Href | null;
};

export function InvoicesIndexContainer({ items, previousHref, nextHref }: Props) {
  const t = useBillingTranslation();
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-display font-semibold" data-testid="billing.invoices.index.title">
        {t("invoices.title")}
      </h1>
      <InvoicesList items={items} emptyLabel={t("invoices.empty")} />
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
