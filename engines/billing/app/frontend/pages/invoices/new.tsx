import type { LayoutName } from "@core/contracts/layout.types";

import { useBillingTranslation } from "@billing/i18n";
import { InvoicesNewScreen } from "@billing/screens/invoices/new_screen";
import { Head } from "@inertiajs/react";

import { pageSchema } from "./new.schema";

export default function InvoicesNew(props: Record<string, unknown>) {
  const t = useBillingTranslation();
  const page = pageSchema.parse(props);
  return (
    <>
      <Head title={t("invoices.new")} />
      <InvoicesNewScreen {...page.data} meta={page.meta} errors={page.errors} />
    </>
  );
}

InvoicesNew.layoutName = "app" satisfies LayoutName;
