import { z } from "zod";

export const ProductSchema = z.object({
        
  name: z.string().min(2),
  description: z.string().min(2),
  richDescription: z.array(
    z.object({
      type: z.string(), // e.g., "paragraph", "image", "heading"
      content: z.string(), // e.g., the actual text or URL if it's an image
    })
  ),
  price: z.number(),
  discount: z.number().optional(),
  categoryId: z.string(),
  brand: z.string().optional(),
  SKU: z.string().optional(),
  stockQuantity: z.number().int(),
  images: z.array(
    z.object({
      url: z.string().url(),
      alt: z.string().optional(),
    })
  ),
  attributes: z.any(),
  rating: z.number().optional(),
  reviews: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      rating: z.number().min(1).max(5),
      createdAt: z.date(),
    })
  ).optional(),
  isFavourite: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  
})