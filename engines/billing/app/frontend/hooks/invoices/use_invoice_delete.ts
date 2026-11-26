import type { InvoiceListRow } from "@billing/components/invoices/list.types";

import { useUiState } from "@core/lib/use_ui_state";
import { router } from "@inertiajs/react";

type PendingInvoice = {
  id: string;
  number: string;
  deleteHref: string;
};

export function useInvoiceDelete(token: string) {
  const [state, setState] = useUiState<{ invoice: PendingInvoice | null }>({ invoice: null });

  function request(invoice: InvoiceListRow) {
    if (!invoice.deleteHref) return;
    setState({
      invoice: { id: invoice.id, number: invoice.number, deleteHref: invoice.deleteHref },
    });
  }

  function cancel() {
    setState({ invoice: null });
  }

  function confirm() {
    const invoice = state.invoice;
    if (!invoice) return;
    setState({ invoice: null });
    router.delete(invoice.deleteHref, {
      data: { token },
      preserveScroll: true,
    });
  }

  return { pending: state.invoice, request, cancel, confirm };
}
