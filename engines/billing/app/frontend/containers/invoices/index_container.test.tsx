import "@testing-library/jest-dom/vitest";
import en from "@billing/locales/en.json";
import { I18nProvider } from "@design_system/i18n_provider";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18next from "i18next";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const inertia = vi.hoisted(() => ({ remove: vi.fn() }));

vi.mock("@inertiajs/react", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  router: { delete: inertia.remove },
}));

import type { InvoiceListRow } from "@billing/components/invoices/list.types";

import { InvoicesIndexContainer } from "./index_container";

const invoice: InvoiceListRow = {
  id: "inv_1",
  number: "INV-001",
  customerName: "Ada Example",
  status: "draft",
  total: { minor: 1250, currency: "THB", exponent: 2 },
  issuedOn: "2026-11-12",
  deleteHref: "/en/billing/invoices/inv_1?page=2&per_page=25",
};

const canDelete = {
  "invoice.read": { allowed: true, reason: null },
  "invoice.create": { allowed: true, reason: null },
  "invoice.delete": { allowed: true, reason: null },
};

const cannotDelete = {
  "invoice.read": { allowed: true, reason: null },
  "invoice.create": { allowed: true, reason: null },
  "invoice.delete": { allowed: false, reason: "forbidden" },
};

function renderContainer({
  can = canDelete,
  errors = {},
}: {
  can?: Record<string, { allowed: boolean; reason: string | null }>;
  errors?: Record<string, string>;
} = {}) {
  return render(
    <I18nProvider locale="en" timeZone="UTC">
      <InvoicesIndexContainer
        items={[invoice]}
        newHref="/en/billing/invoices/new"
        previousHref={null}
        nextHref={null}
        can={can}
        meta={{ formToken: "token-1" }}
        errors={errors}
      />
    </I18nProvider>,
  );
}

describe("InvoicesIndexContainer", () => {
  beforeAll(async () => {
    await i18next.init({
      lng: "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      resources: { en: { billing: en } },
    });
  });

  beforeEach(() => {
    inertia.remove.mockClear();
  });

  it("hides the delete control when the viewer may not delete invoices", async () => {
    renderContainer({ can: cannotDelete });

    await screen.findByTestId("billing.invoices.index.list");

    expect(
      screen.queryByTestId("billing.invoices.index.list.row.inv_1.delete"),
    ).not.toBeInTheDocument();
  });

  it("asks before deleting and sends nothing when the viewer cancels", async () => {
    renderContainer();

    await userEvent.click(
      await screen.findByTestId("billing.invoices.index.list.row.inv_1.delete"),
    );

    expect(screen.getByTestId("billing.invoices.index.delete.dialog")).toBeInTheDocument();
    expect(screen.getByTestId("billing.invoices.index.delete.dialog")).toHaveTextContent("INV-001");

    await userEvent.click(screen.getByTestId("billing.invoices.index.delete.dialog.cancel"));

    expect(inertia.remove).not.toHaveBeenCalled();
  });

  it("deletes the confirmed row with the page form token", async () => {
    renderContainer();

    await userEvent.click(
      await screen.findByTestId("billing.invoices.index.list.row.inv_1.delete"),
    );
    await userEvent.click(screen.getByTestId("billing.invoices.index.delete.dialog.confirm"));

    expect(inertia.remove).toHaveBeenCalledWith("/en/billing/invoices/inv_1?page=2&per_page=25", {
      data: { token: "token-1" },
      preserveScroll: true,
    });
  });

  it("shows the translated error when the delete is refused", () => {
    renderContainer({ errors: { base: "This invoice cannot be deleted." } });

    expect(screen.getByTestId("billing.invoices.index.error")).toHaveTextContent(
      "This invoice cannot be deleted.",
    );
  });
});
