import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18next from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { InvoiceListRow } from "./list.types";

import { InvoicesList } from "./list";

const invoice: InvoiceListRow = {
  id: "inv_1",
  number: "INV-001",
  customerName: "Ada Example",
  customerEmail: "ada@example.test",
  status: "draft",
  total: { minor: 1250, currency: "THB", exponent: 2 },
  issuedOn: "2026-11-12",
  deleteHref: "/en/billing/invoices/inv_1?page=1&per_page=25",
};

describe("InvoicesList", () => {
  beforeAll(async () => {
    await i18next.init({
      lng: "en",
      resources: {
        en: {
          billing: {
            invoices: {
              number: "Invoice number",
              customer: "Customer",
              status: "Status",
              total: "Total",
              issued_on: "Issue date",
              actions: "Actions",
              statuses: { draft: "Draft" },
              delete: { action: "Delete" },
            },
          },
        },
      },
    });
  });

  it("renders every invoice field in its row, with the customer email beside the name", async () => {
    render(
      <InvoicesList
        items={[invoice]}
        emptyLabel="No invoices yet."
        canDelete={false}
        onDelete={() => undefined}
      />,
    );

    const row = await screen.findByTestId("billing.invoices.index.list.row.inv_1");
    const cells = within(row).getAllByRole("cell");

    expect(cells).toHaveLength(5);
    expect(cells[0]).toHaveTextContent("INV-001");
    expect(cells[1]).toHaveTextContent("Ada Example");
    expect(cells[2]).toHaveTextContent("Draft");
    expect(cells[3]).toHaveTextContent("12.50 THB");
    expect(cells[4]).toHaveTextContent("Nov 12, 2026");
    expect(
      within(row).getByTestId("billing.invoices.index.list.row.inv_1.customer-email"),
    ).toHaveTextContent("ada@example.test");
  });

  it("offers a delete control only when the viewer may delete invoices", async () => {
    const onDelete = vi.fn();
    const { rerender } = render(
      <InvoicesList
        items={[invoice]}
        emptyLabel="No invoices yet."
        canDelete={false}
        onDelete={onDelete}
      />,
    );

    await screen.findByTestId("billing.invoices.index.list");
    expect(
      screen.queryByTestId("billing.invoices.index.list.row.inv_1.delete"),
    ).not.toBeInTheDocument();

    rerender(
      <InvoicesList
        items={[invoice]}
        emptyLabel="No invoices yet."
        canDelete
        onDelete={onDelete}
      />,
    );
    await userEvent.click(screen.getByTestId("billing.invoices.index.list.row.inv_1.delete"));

    expect(onDelete).toHaveBeenCalledWith(invoice);
  });

  it("renders the translated empty state", () => {
    render(
      <InvoicesList
        items={[]}
        emptyLabel="No invoices yet."
        canDelete={false}
        onDelete={() => undefined}
      />,
    );

    expect(screen.getByTestId("billing.invoices.index.empty")).toHaveTextContent(
      "No invoices yet.",
    );
  });
});
