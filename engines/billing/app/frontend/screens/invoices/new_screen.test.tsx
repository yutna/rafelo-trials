import "@testing-library/jest-dom/vitest";
import { I18nProvider } from "@design_system/i18n_provider";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import i18next from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";

const inertia = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  useForm: (data: Record<string, string>) => ({
    data,
    errors: {},
    processing: false,
    setData: vi.fn(),
    transform: () => undefined,
    post: (_url: string, options?: { onError?: (errors: Record<string, string>) => void }) => {
      inertia.post(_url);
      options?.onError?.({});
    },
  }),
}));

import { InvoicesNewScreen } from "./new_screen";

beforeAll(async () => {
  await i18next.init({
    lng: "en",
    resources: {
      en: {
        billing: {
          invoices: {
            title: "Invoices",
            new: "New invoice",
            save: "Save",
            customer: "Customer",
            status: "Status",
            status_hint: "Open, paid, or cancelled.",
            total: "Total",
            total_hint: "A whole number in satang (THB).",
          },
        },
      },
    },
  });
});

function renderScreen(errors: Record<string, string>) {
  render(
    <I18nProvider locale="en" timeZone="UTC">
      <InvoicesNewScreen
        createHref="/en/billing/invoices"
        indexHref="/en/billing/invoices"
        meta={{ formToken: "token" }}
        errors={errors}
      />
    </I18nProvider>,
  );
}

function submit() {
  fireEvent.submit(screen.getByTestId("billing.invoices.new.submit").closest("form")!);
}

describe("InvoicesNewScreen", () => {
  it("focuses the base error summary after a failed submit", async () => {
    renderScreen({ base: "The invoice could not be saved." });

    submit();

    expect(inertia.post).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByTestId("billing.invoices.form.base-error")).toHaveFocus(),
    );
  });

  it("focuses the first invalid field after a failed submit", async () => {
    renderScreen({ customerName: "can't be blank" });

    submit();

    await waitFor(() => expect(screen.getByTestId("billing.invoices.form.customer")).toHaveFocus());
  });
});
