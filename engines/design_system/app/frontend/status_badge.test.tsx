import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./status_badge";

describe("StatusBadge", () => {
  it.each([
    ["neutral", "Draft"],
    ["success", "Paid"],
    ["warning", "Overdue"],
  ] as const)("renders the %s tone with its text as the accessible label", (tone, text) => {
    render(<StatusBadge tone={tone}>{text}</StatusBadge>);

    expect(screen.getByRole("status", { name: text })).toHaveTextContent(text);
  });

  it("renders the optional test id", () => {
    render(<StatusBadge testId="billing.invoices.status">Paid</StatusBadge>);

    expect(screen.getByTestId("billing.invoices.status")).toHaveTextContent("Paid");
  });
});
