import { InvoicesNewContainer } from "@billing/containers/invoices/new_container";

export function InvoicesNewScreen(props: Parameters<typeof InvoicesNewContainer>[0]) {
  return <InvoicesNewContainer {...props} />;
}
