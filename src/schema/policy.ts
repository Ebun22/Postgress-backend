import {z}  from "zod";

export const PolicySchema = z.object({
    title: z.string(),
    content: z.string()
})

export const UpdatePolicySchema = PolicySchema.partial().strict();


export const FAQSchema = z.object({
    question: z.string(),
    answer: z.string()
})

export const FAQArraySchema = z.array(FAQSchema)

export const UpdateFAQSchema = FAQSchema.partial().strict();
