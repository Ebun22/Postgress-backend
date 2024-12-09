import { z } from "zod";
import { CategoryArraySchema } from "./category";
import { File } from "buffer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // max image 1.5MB

export const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.number(),
  discount: z.number().optional(),
  category: CategoryArraySchema.optional(),
  brand: z.string().optional(),
  SKU: z.string().optional(),
  stockQuantity: z.number().int(),
  attributes: z.any(),
  rating: z.number().optional(),
  images: z.any()
    .refine((files) => {
      return Array.isArray(files) && files.length > 0;
    }, "Image is required")
    // .refine((files) => {
    //   files.every((file: File) => {
    //     console.log("These are all the file sizes: ", file.size);
    //     return file.size <= MAX_IMAGE_SIZE;
    //   })
    // }, "Image size is too large, image should be less than or equal to 1mb")
  // reviews: z.array(
  //   z.object({
  //     id: z.string(),
  //     content: z.string(),
  //     rating: z.number().min(1).max(5),
  //     createdAt: z.date(),
  //   })
  // ).optional(),
})

export const ProductUpdateSchma = ProductSchema.partial(); 