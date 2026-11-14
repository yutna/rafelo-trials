import { router } from "@inertiajs/react";

import { useUiState } from "@core/lib/use_ui_state";

import { DeleteInvoiceDialog } from "../../components/invoices/delete_dialog";
import {
  InvoicesList,
  type InvoiceRow,
} from "../../components/invoices/list";

type Props = {
  items: InvoiceRow[];
  canDelete: boolean;
  formToken: string;
};

export function InvoicesIndexContainer({ items, canDelete, formToken }: Props) {
  const [state, setState] = useUiState<{ pendingId: string | null }>({
    pendingId: null,
  });
  const pending = items.find((invoice) => invoice.id === state.pendingId) ?? null;

  function requestDelete(invoice: InvoiceRow) {
    if (!canDelete) return;
    setState({ pendingId: invoice.id });
  }

  function cancelDelete() {
    setState({ pendingId: null });
  }

  function confirmDelete() {
    if (!pending) return;
    setState({ pendingId: null });
    router.delete(pending.deleteHref, {
      data: { token: formToken },
      preserveScroll: true,
    });
  }

  return (
    <>
      <InvoicesList
        items={items}
        canDelete={canDelete}
        onDelete={requestDelete}
      />
      <DeleteInvoiceDialog
        open={pending !== null}
        invoiceNumber={pending?.number ?? ""}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
