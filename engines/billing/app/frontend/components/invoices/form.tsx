import { TextField } from "@design_system/public";

import { useBillingTranslation } from "../../i18n";

type Props = {
  customerName: string;
  status: string;
  total: string;
  baseError?: string;
  errors: Record<string, string>;
  onCustomerNameChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTotalChange: (value: string) => void;
};

export function InvoiceFormFields({
  customerName,
  status,
  total,
  baseError,
  errors,
  onCustomerNameChange,
  onStatusChange,
  onTotalChange,
}: Props) {
  const t = useBillingTranslation();
  return (
    <>
      {baseError ? (
        <p
          role="alert"
          data-testid="billing.invoices.form.base-error"
          className="text-danger"
        >
          {baseError}
        </p>
      ) : null}
      <TextField
        testId="billing.invoices.form.customer"
        label={t("invoices.customer")}
        name="customerName"
        value={customerName}
        onChange={onCustomerNameChange}
        error={errors.customerName}
        isRequired
      />
      <TextField
        testId="billing.invoices.form.status"
        label={t("invoices.status")}
        name="status"
        value={status}
        onChange={onStatusChange}
        error={errors.status}
        isRequired
      />
      <TextField
        testId="billing.invoices.form.total"
        label={t("invoices.total")}
        name="total"
        value={total}
        onChange={onTotalChange}
        error={errors.total}
        isRequired
      />
    </>
  );
}
