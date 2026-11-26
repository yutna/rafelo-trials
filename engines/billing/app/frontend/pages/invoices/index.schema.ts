import { definePage, moneySchema } from "@core/contracts/page_props.schema";
import { hrefSchema } from "@design_system/safe_url";
import { z } from "zod";

const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  customerName: z.string(),
  status: z.enum(["open", "draft", "issued", "paid", "cancelled", "void"]),
  total: moneySchema,
  issuedOn: z.string(),
  deleteHref: hrefSchema.nullable(),
});

export const pageSchema = definePage({
  data: z.object({
    items: z.array(invoiceSchema),
    newHref: hrefSchema,
    previousHref: hrefSchema.nullable(),
    nextHref: hrefSchema.nullable(),
  }),
  meta: z.object({ formToken: z.string() }),
  query: z.object({
    page: z.number().int(),
    perPage: z.number().int(),
    sort: z.string().nullable(),
    direction: z.string(),
    filters: z.record(z.string(), z.string()),
    cursor: z.string().nullable(),
  }),
  can: ["invoice.read", "invoice.create", "invoice.delete"] as const,
});
