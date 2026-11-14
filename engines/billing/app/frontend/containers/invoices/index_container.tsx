import { InvoicesScreen } from "../../screens/invoices/index_screen";

export function InvoicesIndexContainer(
  props: Parameters<typeof InvoicesScreen>[0],
) {
  return <InvoicesScreen {...props} />;
}
