import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import i18next from "i18next";
import { beforeAll, describe, expect, it } from "vitest";

import type { InvoiceListRow } from "./list.types";

import { InvoicesList } from "./list";

const invoice: InvoiceListRow = {
  id: "inv_1",
  number: "INV-001",
  customerName: "Ada Example",
  status: "draft",
  total: { minor: 1250, currency: "THB", exponent: 2 },
  issuedOn: "2026-11-12",
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
              statuses: { draft: "Draft" },
            },
          },
        },
      },
    });
  });

  it("renders every requested invoice field in its row", async () => {
    render(<InvoicesList items={[invoice]} emptyLabel="No invoices yet." />);

    const row = await screen.findByTestId("billing.invoices.index.list.row.inv_1");

    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["INV-001", "Ada Example", "Draft", "12.50 THB", "Nov 12, 2026"]);
  });

  it("renders the translated empty state", () => {
    render(<InvoicesList items={[]} emptyLabel="No invoices yet." />);

    expect(screen.getByTestId("billing.invoices.index.empty")).toHaveTextContent(
      "No invoices yet.",
    );
  });
});
