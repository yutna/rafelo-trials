import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("billing skeleton", () => {
  it("renders", () => {
    render(<div data-testid="billing.skeleton" />);
    expect(screen.getByTestId("billing.skeleton")).toBeInTheDocument();
  });
});
