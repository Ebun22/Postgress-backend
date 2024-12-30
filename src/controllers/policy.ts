import { NextFunction, Request, Response } from "express";
import { prisma } from "..";
import { Category, Delivery, Product } from "@prisma/client";
import { NotFoundException } from "../exceptions/not-found";
import { DeliverySchema, UpdateDeliverySchema } from "../schema/delivery";
import { BadRequestsException } from "../exceptions/bad-request";
import { FAQArraySchema, FAQSchema, PolicySchema, UpdateFAQSchema, UpdatePolicySchema } from "../schema/policy";

export const createPolicy = async (req: Request, res: Response, next: NextFunction) => {
    const validatePolicy = PolicySchema.parse(req.body);

    const policy = await prisma.policy.create({
        data: { ...validatePolicy }
    })

    return res.status(201).json({ success: true, status: 201, date: { ...policy } })
}

export const updatePolicy = async (req: Request, res: Response, next: NextFunction) => {
    const validatePolicy = UpdatePolicySchema.parse(req.body);

    //if a parent id is sent, validate if its an existing category before appending
    if (!req.params.id) {
        throw new BadRequestsException("Request param of id is required on this route")
    }
    try {
        let policy = await prisma.policy.update({
            where: { id: req.params.id as string },
            data: {
                ...validatePolicy
            }
        })

        return res.status(200).json({ sccess: true, status: 200, data: { ...policy } });
    } catch (err) {
        throw new NotFoundException("Policy with given Id doesn't exist")
    }
}

export const getAllPolicies = async (req: Request, res: Response, next: NextFunction) => {
    let policy = await prisma.policy.findMany();
    return res.json({ success: true, status: 200, data: [...policy] })
}

export const getPolicyById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let policy = await prisma.policy.findFirstOrThrow({
            where: { id: req.params.id },
        });
        return res.json({ success: true, status: 200, data: { ...policy } })
    } catch (err) {
        throw new NotFoundException("Policy with given Id doesn't exist")
    }
}

export const deletePolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let deletedPolicy = await prisma.policy.delete({ where: { id: req.params.id } })
        if (!deletedPolicy) return;
        return res.status(204).json({ success: true })
    } catch (err) {
        console.log(err)
        throw new NotFoundException("Ploicy with given Id doesn't exist")
    }

}


//FAQ ENDPOINTS
export const addFAQ = async (req: Request, res: Response, next: NextFunction) => {
    const validateFAQ = FAQArraySchema.parse(req.body);

    const FAQ = await prisma.fAQ.createMany({
        data: validateFAQ.map(({ question, answer }) => ({
            question: question as string,
            answer: answer as string,
        }))
    })

    return res.status(201).json({ success: true, status: 201, message: `${FAQ.count} FAQ successfully added` })
}

export const updateFAQ = async (req: Request, res: Response, next: NextFunction) => {
    const validateFAQ = UpdateFAQSchema.parse(req.body);

    //if a parent id is sent, validate if its an existing category before appending
    if (!req.params.id) {
        throw new BadRequestsException("Request param of id is required on this route")
    }
    try {
        let FAQ = await prisma.fAQ.update({
            where: { id: req.params.id as string },
            data: {
                ...validateFAQ
            }
        })

        return res.status(200).json({ sccess: true, status: 200, data: { ...FAQ } });
    } catch (err) {
        throw new NotFoundException("FAQ with given Id doesn't exist")
    }
}

export const getAllFAQ = async (req: Request, res: Response, next: NextFunction) => {
    let FAQ = await prisma.fAQ.findMany();
    return res.json({ success: true, status: 200, data: [...FAQ] })
}

export const getFAQById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let FAQ = await prisma.fAQ.findFirstOrThrow({
            where: { id: req.params.id },
        });
        return res.json({ success: true, status: 200, data: { ...FAQ } })
    } catch (err) {
        throw new NotFoundException("Policy with given Id doesn't exist")
    }
}

export const deleteFAQ = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let deletedFAQ = await prisma.fAQ.delete({ where: { id: req.params.id } })
        if (!deletedFAQ) return;
        return res.status(204).json({ success: true })
    } catch (err) {
        console.log(err)
        throw new NotFoundException("FAQ with given Id doesn't exist")
    }

}