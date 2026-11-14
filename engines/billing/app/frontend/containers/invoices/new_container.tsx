import { InvoicesNewScreen } from "../../screens/invoices/new_screen";

export function InvoicesNewContainer(
  props: Parameters<typeof InvoicesNewScreen>[0],
) {
  return <InvoicesNewScreen {...props} />;
}
