import { useForm } from "@inertiajs/react";

import { Button, Link } from "@design_system/public";

import { InvoiceFormFields } from "../../components/invoices/form";
import { useBillingTranslation } from "../../i18n";

type Props = {
  createPath: string;
  indexPath: string;
  meta: { formToken: string };
  errors: Record<string, string>;
};

export function InvoicesNewScreen({
  createPath,
  indexPath,
  meta,
  errors,
}: Props) {
  const t = useBillingTranslation();
  const form = useForm({ customerName: "", status: "open", total: "" });

  return (
    <section
      className="mx-auto max-w-3xl px-6 py-16"
      data-testid="billing.invoices.new.page"
    >
      <h1 className="text-display font-semibold">{t("invoices.new")}</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.transform((data) => ({ ...data, token: meta.formToken }));
          form.post(createPath);
        }}
        className="mt-6 space-y-4"
      >
        <InvoiceFormFields
          customerName={form.data.customerName}
          status={form.data.status}
          total={form.data.total}
          baseError={errors.base}
          errors={errors}
          onCustomerNameChange={(value) => form.setData("customerName", value)}
          onStatusChange={(value) => form.setData("status", value)}
          onTotalChange={(value) => form.setData("total", value)}
        />
        <div className="flex items-center gap-4">
          <Button
            testId="billing.invoices.new.submit"
            type="submit"
            isDisabled={form.processing}
          >
            {t("invoices.save")}
          </Button>
          <Link href={indexPath}>
            <span data-testid="billing.invoices.new.back">
              {t("invoices.title")}
            </span>
          </Link>
        </div>
      </form>
    </section>
  );
}
