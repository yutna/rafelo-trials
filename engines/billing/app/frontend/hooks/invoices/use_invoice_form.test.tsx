import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const inertia = vi.hoisted(() => ({
  post: vi.fn(),
  transform: vi.fn(),
}));

vi.mock("@inertiajs/react", () => ({
  useForm: (data: Record<string, string>) => ({
    data,
    errors: {},
    processing: false,
    setData: vi.fn(),
    transform: (callback: (values: Record<string, string>) => Record<string, unknown>) => {
      inertia.transform(callback(data));
    },
    post: inertia.post,
  }),
}));

import { useInvoiceForm } from "./use_invoice_form";

describe("useInvoiceForm", () => {
  it("posts the invoice form with its token", () => {
    const { result } = renderHook(() =>
      useInvoiceForm({
        action: "/en/billing/invoices",
        meta: { formToken: "token" },
        errors: {},
      }),
    );

    act(() => result.current.submit());

    expect(inertia.transform).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "",
        status: "open",
        total: "",
        token: "token",
      }),
    );
    expect(inertia.post).toHaveBeenCalledWith(
      "/en/billing/invoices",
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });
});
