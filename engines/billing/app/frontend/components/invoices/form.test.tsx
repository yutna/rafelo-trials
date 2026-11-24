import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvoiceFormFields } from "./form";

describe("InvoiceFormFields", () => {
  it("renders the design-system fields and their errors", () => {
    render(
      <InvoiceFormFields
        customerName="Ada Example"
        status="open"
        total="1250"
        errors={{ customerName: "can't be blank", total: "is invalid" }}
        onCustomerNameChange={() => undefined}
        onStatusChange={() => undefined}
        onTotalChange={() => undefined}
      />,
    );

    expect(screen.getByTestId("billing.invoices.form.customer")).toHaveValue("Ada Example");
    expect(screen.getByTestId("billing.invoices.form.status")).toHaveValue("open");
    expect(screen.getByTestId("billing.invoices.form.total")).toHaveValue("1250");
    expect(screen.getByTestId("billing.invoices.form.customer.error")).toHaveTextContent(
      "can't be blank",
    );
    expect(screen.getByTestId("billing.invoices.form.total.error")).toHaveTextContent("is invalid");
  });

  it("shows a base error as a focusable summary", () => {
    render(
      <InvoiceFormFields
        customerName=""
        status="open"
        total=""
        baseError="The invoice could not be saved."
        errors={{}}
        onCustomerNameChange={() => undefined}
        onStatusChange={() => undefined}
        onTotalChange={() => undefined}
      />,
    );

    expect(screen.getByTestId("billing.invoices.form.base-error")).toHaveTextContent(
      "The invoice could not be saved.",
    );
  });
});
