import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvoiceFormFields } from "./form";

describe("InvoiceFormFields", () => {
  it("renders the design-system fields and their errors", () => {
    render(
      <InvoiceFormFields
        customerName=""
        status="draft"
        total="12.5"
        errors={{
          customerName: "can't be blank",
          status: "is not valid",
          total: "is not valid",
        }}
        onCustomerNameChange={() => undefined}
        onStatusChange={() => undefined}
        onTotalChange={() => undefined}
      />,
    );

    expect(screen.getByTestId("billing.invoices.form.customer")).toHaveValue(
      "",
    );
    expect(screen.getByTestId("billing.invoices.form.status")).toHaveValue(
      "draft",
    );
    expect(screen.getByTestId("billing.invoices.form.total")).toHaveValue(
      "12.5",
    );
    expect(screen.getByText("can't be blank")).toBeInTheDocument();
    expect(screen.getAllByText("is not valid")).toHaveLength(2);
  });
});
