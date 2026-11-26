import type { LayoutName } from "@core/contracts/layout.types";

import { useBillingTranslation } from "@billing/i18n";
import { InvoicesIndexScreen } from "@billing/screens/invoices/index_screen";
import { Head } from "@inertiajs/react";

import { pageSchema } from "./index.schema";

export default function InvoicesIndex(props: Record<string, unknown>) {
  const t = useBillingTranslation();
  const page = pageSchema.parse(props);
  return (
    <>
      <Head title={t("invoices.title")} />
      <InvoicesIndexScreen {...page.data} />
    </>
  );
}

InvoicesIndex.layoutName = "app" satisfies LayoutName;
