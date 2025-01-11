import {z}  from "zod";

export const CategorySchema = z.object({
    name: z.string().optional(),
    id: z.string().optional(),
    parentId: z.string().nullable().optional()
})

export const CategoryArraySchema = z.array(CategorySchema);

export const UpdateCategorySchema = CategorySchema.partial();
   
