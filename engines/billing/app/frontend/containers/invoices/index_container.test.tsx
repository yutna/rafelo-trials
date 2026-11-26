import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import i18next from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@inertiajs/react", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-inertia="true" {...props}>
      {children}
    </a>
  ),
}));

import { InvoicesIndexContainer } from "./index_container";

beforeAll(async () => {
  await i18next.init({
    lng: "en",
    resources: {
      en: {
        billing: {
          invoices: {
            title: "Invoices",
            add: "Add invoice",
            empty: "No invoices yet.",
            pagination: "Invoice pagination",
            previous: "Previous",
            next: "Next",
          },
        },
      },
    },
  });
});

function renderIndex(canAdd: boolean) {
  render(
    <InvoicesIndexContainer
      items={[]}
      newHref="/en/billing/invoices/new"
      previousHref={null}
      nextHref={null}
      can={{
        "invoice.read": { allowed: true, reason: null },
        "invoice.create": { allowed: canAdd, reason: null },
      }}
    />,
  );
}

describe("InvoicesIndexContainer", () => {
  it("offers the add-invoice link to a viewer with the create grant", () => {
    renderIndex(true);

    expect(screen.getByTestId("billing.invoices.index.new.link")).toHaveAttribute(
      "href",
      "/en/billing/invoices/new",
    );
  });

  it("hides the add-invoice link from a viewer without the create grant", () => {
    renderIndex(false);

    expect(screen.queryByTestId("billing.invoices.index.new.link")).not.toBeInTheDocument();
  });
});
