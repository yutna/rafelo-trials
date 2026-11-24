import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./status_badge";

describe("StatusBadge", () => {
  it("renders every tone with its text as the label", () => {
    render(
      <>
        <StatusBadge testId="status.neutral" tone="neutral">
          Draft
        </StatusBadge>
        <StatusBadge testId="status.success" tone="success">
          Paid
        </StatusBadge>
        <StatusBadge testId="status.warning" tone="warning">
          Overdue
        </StatusBadge>
      </>,
    );

    expect(screen.getByTestId("status.neutral")).toHaveTextContent("Draft");
    expect(screen.getByTestId("status.neutral")).toHaveClass("bg-muted");
    expect(screen.getByTestId("status.success")).toHaveTextContent("Paid");
    expect(screen.getByTestId("status.success")).toHaveClass("bg-emerald-100");
    expect(screen.getByTestId("status.warning")).toHaveTextContent("Overdue");
    expect(screen.getByTestId("status.warning")).toHaveClass("bg-amber-100");
  });

  it("uses the neutral tone by default", () => {
    render(<StatusBadge testId="status.default">Draft</StatusBadge>);

    expect(screen.getByTestId("status.default")).toHaveClass("bg-muted");
  });
});
