import {z}  from "zod";

export const CategorySchema = z.object({
    name: z.string().nullable().optional(),
    id: z.string().nullable().optional(),
    parentId: z.string().nullable().optional()
})

export const CategoryArraySchema = z.array(CategorySchema);

export const UpdateCategorySchema = CategorySchema.partial();
   
