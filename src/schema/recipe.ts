import { z } from "zod";

// const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // max image 1.5MB

export const RecipeSchema = z.object({
    name: z.string().min(2, { message: "Must be 2 or more characters long" }),
    directions: z.string().min(2, { message: "Must be 2 or more characters long" }),
    duration: z.string().optional(),
    difficulty: z.string().optional(),
    ratings: z.number().optional(),
    isVisible: z.boolean().optional(),
    image: z.any()
        .refine((files) => {
            return Array.isArray(files) && files.length > 0;
        }, "Image is required")
        // .refine((files) => {
        //     return files.size <= MAX_IMAGE_SIZE;
        // }, "Image size is too large, image should be less than or equal to 1mb")
})

export const RecipeUpdateSchma = RecipeSchema.partial().strict(); 