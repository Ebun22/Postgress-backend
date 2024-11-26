import {z}  from "zod";

export const CategorySchema = z.object({
    name: z.string(),
    productId: z.string().optional(),
    parentId: z.string().nullable().optional()
})

export const CategoryArraySchema = z.array(CategorySchema);
   
