import { NextFunction, Request, Response } from "express";
import { prisma } from "..";
import { Category, Delivery, Product } from "@prisma/client";
import { NotFoundException } from "../exceptions/not-found";
import { DeliveryArraySchema } from "../schema/delivery";

export const createDelivery = async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, price, ...body } = req.body;

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    const parsedPrice = parseFloat(price);

    const validateDelivery = DeliveryArraySchema.parse({
        parsedEndDate,
        parsedStartDate,
        parsedPrice,
        ...body
    });


    //if parent id is null, then just apend it
    let delivery = await prisma.delivery.createMany({
        data: validateDelivery.map((deliveryData: Delivery) => ({ ...deliveryData }))
    })

    return res.status(201).json({ sccess: true, status: 201, data: { ...delivery } })



}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    const validateCategory = UpdateCategorySchema.parse(req.body);

    //if a parent id is sent, validate if its an existing category before appending
    if (validateCategory.parentId !== null) {
        try {
            await prisma.category.findFirstOrThrow({ where: { id: validateCategory.parentId as string } })
        } catch (err) {
            throw new NotFoundException("Category Id to make parent doesn't exist")
        }
    }
    try {
        let category = await prisma.category.update({
            where: { id: req.params.id as string },
            data: {
                name: validateCategory.name,
                parentId: validateCategory.parentId ? validateCategory.parentId : null,
            }
        })

        return res.status(200).json({ sccess: true, status: 200, data: { ...category } });
    } catch (err) {
        throw new NotFoundException("Category with given Id doesn't exist")
    }

}


export const getAllDelivery = async (req: Request, res: Response, next: NextFunction) => {
    let delivery = await prisma.delivery.findMany();
    return res.json({ success: true, status: 200, data: [...delivery] })
}

export const getDeliveryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let category = await prisma.category.findFirstOrThrow({
            where: { id: req.params.id },
        });
        return res.json({ success: true, status: 200, data: { ...category } })
    } catch (err) {
        throw new NotFoundException("Category with given Id doesn't exist")
    }
}

export const deleteDelivery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let deletedDelivery = await prisma.delivery.delete({ where: { id: req.params.id } })
        if (!deletedDelivery) return;
        return res.status(204).json({ success: true })
    } catch (err) {
        console.log(err)
        throw new NotFoundException("Delivery with given Id doesn't exist")
    }

}