import "@testing-library/jest-dom/vitest";
import en from "@billing/locales/en.json";
import th from "@billing/locales/th.json";
import { I18nProvider } from "@design_system/i18n_provider";
import { render, screen } from "@testing-library/react";
import i18next from "i18next";
import { beforeAll, describe, expect, it } from "vitest";

import { InvoicesIndexScreen } from "./index_screen";

const props = {
  items: [],
  newHref: "/en/billing/invoices/new",
  previousHref: null,
  nextHref: null,
  can: {},
};

async function renderScreen(locale: "en" | "th") {
  await i18next.changeLanguage(locale);
  render(
    <I18nProvider locale={locale} timeZone="UTC">
      <InvoicesIndexScreen {...props} />
    </I18nProvider>,
  );
}

describe("InvoicesIndexScreen", () => {
  beforeAll(async () => {
    await i18next.init({
      lng: "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
      resources: { en: { billing: en }, th: { billing: th } },
    });
  });

  it("shows the English empty message from the catalog", async () => {
    await renderScreen("en");

    expect(screen.getByTestId("billing.invoices.index.empty")).toHaveTextContent(
      "No invoices yet.",
    );
  });

  it("shows the Thai empty message from the catalog", async () => {
    await renderScreen("th");

    expect(screen.getByTestId("billing.invoices.index.empty")).toHaveTextContent("ยังไม่มีใบแจ้งหนี้");
  });
});
