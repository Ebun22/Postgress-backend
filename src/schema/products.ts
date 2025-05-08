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
  rating: z.number().optional(),
  variant: z.array(z.object({
    name: z.string(), 
    stock: z.coerce.number().int(), 
    price: z.coerce.number().int(),  
    specification: z.string()
  })).optional(),
  isVisible: z.boolean().default(false),
  images: z.any()
    .refine((files) => {
      if(files.length === 0) return true;
      return Array.isArray(files) && files.length > 0;
    }, "Image is required")

})

export const ProductUpdateSchma = ProductSchema.partial(); 