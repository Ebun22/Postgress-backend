import { z } from "zod";

export const CartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number(),
})

export const CartItemsSchemaArray = z.array(CartItemSchema);
export const UpdateCartSchema = z.object({
    quantity: z.number().nonnegative({message: "Quantiy can't be negative"}).optional(),
})
