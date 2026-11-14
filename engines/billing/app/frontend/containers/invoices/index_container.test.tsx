import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { router } from "@inertiajs/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { InvoiceRow } from "../../components/invoices/list";
import { InvoicesIndexContainer } from "./index_container";

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

function renderIndex({ canDelete = true }: { canDelete?: boolean } = {}) {
  return render(
    <InvoicesIndexContainer
      items={items}
      canDelete={canDelete}
      formToken="token-1"
    />,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InvoicesIndexContainer", () => {
  it("hides the delete control when the viewer may not delete invoices", async () => {
    renderIndex({ canDelete: false });

    await screen.findByTestId("billing.invoices.index.list");

    expect(
      screen.queryByTestId("billing.invoices.index.delete.inv_1"),
    ).not.toBeInTheDocument();
  });

  it("asks before deleting and sends no request when the viewer cancels", async () => {
    const user = userEvent.setup();
    const remove = vi
      .spyOn(router, "delete")
      .mockImplementation(() => undefined);

    renderIndex();
    await user.click(
      await screen.findByTestId("billing.invoices.index.delete.inv_1"),
    );

    expect(
      screen.getByTestId("billing.invoices.delete.dialog"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("billing.invoices.delete.message")).toHaveTextContent(
      "INV-001",
    );

    await user.click(screen.getByTestId("billing.invoices.delete.dialog.close"));

    expect(remove).not.toHaveBeenCalled();
  });

  it("deletes from the row and sends the token after confirmation", async () => {
    const user = userEvent.setup();
    const remove = vi
      .spyOn(router, "delete")
      .mockImplementation(() => undefined);

    renderIndex();
    await user.click(
      await screen.findByTestId("billing.invoices.index.delete.inv_1"),
    );
    await user.click(screen.getByTestId("billing.invoices.delete.confirm"));

    expect(remove).toHaveBeenCalledWith("/en/billing/invoices/inv_1", {
      data: { token: "token-1" },
      preserveScroll: true,
    });
  });
});
