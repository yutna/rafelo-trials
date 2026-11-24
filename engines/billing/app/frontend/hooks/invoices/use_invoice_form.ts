import type { Href } from "@design_system/public";

import {
  initialInvoiceForm,
  invoiceFormPayload,
  type InvoiceFormValues,
} from "@billing/forms/invoices/invoice_form";
import { focusFirstError } from "@design_system/public";
import { useForm } from "@inertiajs/react";
import { useRef } from "react";

type Options = {
  action: Href;
  meta: { formToken: string };
  errors: Record<string, string>;
  initial?: Partial<InvoiceFormValues>;
};

export function useInvoiceForm({ action, meta, errors, initial }: Options) {
  const form = useForm<InvoiceFormValues>(initialInvoiceForm(initial));
  const formRef = useRef<HTMLFormElement>(null);
  const formErrors: Record<string, string> = { ...errors, ...form.errors };

  function submit() {
    form.transform((values) => ({
      ...invoiceFormPayload(values),
      token: meta.formToken,
    }));
    form.post(action, {
      onError: () => setTimeout(() => focusFirstError(formRef.current ?? undefined), 0),
    });
  }

  return { form, formRef, formErrors, submit };
}
