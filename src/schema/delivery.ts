import {z}  from "zod";

export const DeliverySchema = z.object({
    location: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    price: z.number()
})

export const DeliveryArraySchema = z.array(DeliverySchema);

export const UpdateDeliverySchema = DeliverySchema.partial().strict();
   
