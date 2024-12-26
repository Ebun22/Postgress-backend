import {z}  from "zod";

export const PolicySchema = z.object({
    title: z.string(),
    content: z.string()
})

export const UpdatePolicySchema = PolicySchema.partial().strict();
   
