import { z } from "zod";

export const ExchangeRateSchema = z.object({
    fromCurrencyId: z.string(),
    toCurrencyId: z.string(),
    price: z.number()
})

export const  ExchangeRateArraySchema =  z.array(ExchangeRateSchema); 