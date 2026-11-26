import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./status_badge";

describe("StatusBadge", () => {
  it.each([
    ["neutral", "Draft"],
    ["success", "Paid"],
    ["warning", "Overdue"],
  ] as const)("renders the %s tone with its text as the accessible name", (tone, text) => {
    render(
      <StatusBadge testId={`billing.invoices.status.${tone}`} tone={tone}>
        {text}
      </StatusBadge>,
    );

    const badge = screen.getByRole("status", { name: text });
    expect(badge).toHaveTextContent(text);
    expect(badge).toHaveAttribute("data-testid", `billing.invoices.status.${tone}`);
  });

  it("defaults to the neutral tone", () => {
    render(<StatusBadge testId="billing.invoices.status.default">Draft</StatusBadge>);

    expect(screen.getByTestId("billing.invoices.status.default")).toHaveClass("bg-muted");
  });
});
