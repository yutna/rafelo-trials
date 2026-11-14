import { Head } from "@inertiajs/react";

import type { LayoutName } from "@core/contracts/layout.types";

import { useBillingTranslation } from "../../i18n";
import { InvoicesScreen } from "../../screens/invoices/index_screen";
import { pageSchema } from "./index.schema";

export default function InvoicesIndex(props: Record<string, unknown>) {
  const t = useBillingTranslation();
  const page = pageSchema.parse(props);
  return (
    <>
      <Head title={t("invoices.title")} />
      <InvoicesScreen
        {...page.data}
        can={page.can}
        pagination={page.pagination?.kind === "offset" ? page.pagination : null}
      />
    </>
  );
}

InvoicesIndex.layoutName = "app" satisfies LayoutName;
