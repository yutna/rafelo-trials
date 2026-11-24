import type { Href } from "@design_system/public";

import { InvoiceFormFields } from "@billing/components/invoices/form";
import { useInvoiceForm } from "@billing/hooks/invoices/use_invoice_form";
import { useBillingTranslation } from "@billing/i18n";
import { Button, Link } from "@design_system/public";

type Props = {
  createHref: Href;
  indexHref: Href;
  meta: { formToken: string };
  errors: Record<string, string>;
};

export function InvoicesNewContainer({ createHref, indexHref, meta, errors }: Props) {
  const t = useBillingTranslation();
  const { form, formRef, formErrors, submit } = useInvoiceForm({
    action: createHref,
    meta,
    errors,
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-16" data-testid="billing.invoices.new.page">
      <h1 className="text-display font-semibold">{t("invoices.new")}</h1>
      <form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="mt-6 space-y-4"
      >
        <InvoiceFormFields
          customerName={form.data.customerName}
          status={form.data.status}
          total={form.data.total}
          baseError={formErrors.base}
          errors={formErrors}
          onCustomerNameChange={(value) => form.setData("customerName", value)}
          onStatusChange={(value) => form.setData("status", value)}
          onTotalChange={(value) => form.setData("total", value)}
        />
        <div className="flex items-center gap-4">
          <Button testId="billing.invoices.new.submit" type="submit" isPending={form.processing}>
            {t("invoices.save")}
          </Button>
          <Link testId="billing.invoices.new.back.link" href={indexHref}>
            <span data-testid="billing.invoices.new.back">{t("invoices.title")}</span>
          </Link>
        </div>
      </form>
    </section>
  );
}
