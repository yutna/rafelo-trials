import i18next from "i18next";

export function useBillingTranslation() {
  return (key: string, options?: Record<string, unknown>): string =>
    i18next.t(key, { ns: "billing", ...options });
}
