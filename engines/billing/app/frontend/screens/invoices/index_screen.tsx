import { InvoicesIndexContainer } from "@billing/containers/invoices/index_container";

export function InvoicesIndexScreen(props: Parameters<typeof InvoicesIndexContainer>[0]) {
  return <InvoicesIndexContainer {...props} />;
}
