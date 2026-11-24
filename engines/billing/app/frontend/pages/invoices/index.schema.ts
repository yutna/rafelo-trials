import { definePage, moneySchema } from "@core/contracts/page_props.schema";
import { hrefSchema } from "@design_system/safe_url";
import { z } from "zod";

const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  customerName: z.string(),
  status: z.string(),
  total: moneySchema,
  issuedOn: z.string(),
});

export const pageSchema = definePage({
  data: z.object({
    items: z.array(invoiceSchema),
    newHref: hrefSchema,
    previousHref: hrefSchema.nullable(),
    nextHref: hrefSchema.nullable(),
  }),
  query: z.object({
    page: z.number().int(),
    perPage: z.number().int(),
    sort: z.string().nullable(),
    direction: z.string(),
    filters: z.record(z.string(), z.string()),
    cursor: z.string().nullable(),
  }),
  can: ["invoice.read", "invoice.create"] as const,
});
