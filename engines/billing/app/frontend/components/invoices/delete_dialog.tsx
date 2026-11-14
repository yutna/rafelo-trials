import { Button, Dialog } from "@design_system/public";

import { useBillingTranslation } from "../../i18n";

type Props = {
  open: boolean;
  invoiceNumber: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteInvoiceDialog({
  open,
  invoiceNumber,
  onCancel,
  onConfirm,
}: Props) {
  const t = useBillingTranslation();
  return (
    <Dialog
      testId="billing.invoices.delete.dialog"
      title={t("invoices.delete.title")}
      open={open}
      onClose={onCancel}
      closeLabel={t("invoices.delete.cancel")}
    >
      <p data-testid="billing.invoices.delete.message">
        {t("invoices.delete.message").replace("{{number}}", invoiceNumber)}
      </p>
      <div className="mt-4">
        <Button
          testId="billing.invoices.delete.confirm"
          variant="danger"
          onPress={onConfirm}
        >
          {t("invoices.delete.confirm")}
        </Button>
      </div>
    </Dialog>
  );
}
