import { describe, expect, it } from "vitest";

import { initialInvoiceForm, invoiceFormPayload } from "./invoice_form";

describe("invoice form", () => {
  it("starts with an open status and empty typed fields", () => {
    expect(initialInvoiceForm()).toEqual({ customerName: "", status: "open", total: "" });
    expect(initialInvoiceForm({ customerName: "Ada", status: "paid", total: "1250" })).toEqual({
      customerName: "Ada",
      status: "paid",
      total: "1250",
    });
  });

  it("submits the three fields the form collects", () => {
    expect(
      invoiceFormPayload({ customerName: "Ada Example", status: "cancelled", total: "1250" }),
    ).toEqual({ customerName: "Ada Example", status: "cancelled", total: "1250" });
  });
});
