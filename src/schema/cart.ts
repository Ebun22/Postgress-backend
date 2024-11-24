import { z } from "zod";

export const CartSchema = z.object({
    productId: z.string(),
    quantity: z.number(),
})
export const UpdateCartSchema = z.object({
    quantity: z.number().nonnegative({message: "Quantiy can't be negative"}).optional(),
})