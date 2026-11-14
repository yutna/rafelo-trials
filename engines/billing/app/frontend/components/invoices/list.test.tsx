import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvoicesList, type InvoiceRow } from "./list";

const items: InvoiceRow[] = [
  {
    id: "inv_1",
    number: "INV-001",
    customerName: "Ada Example",
    customerEmail: "ada@example.test",
    status: "draft",
    total: { minor: 1250, currency: "THB", exponent: 2 },
    issuedOn: "2026-11-12",
    deleteHref: "/en/billing/invoices/inv_1",
  },
];

describe("InvoicesList", () => {
  it("shows the customer's email with their name", async () => {
    render(
      <InvoicesList items={items} canDelete={false} onDelete={() => undefined} />,
    );

    expect(await screen.findByText("Ada Example")).toBeInTheDocument();
    expect(
      await screen.findByTestId("billing.invoices.index.customer-email.inv_1"),
    ).toHaveTextContent("ada@example.test");
  });
});
