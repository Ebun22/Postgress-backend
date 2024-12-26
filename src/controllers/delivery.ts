import { NextFunction, Request, Response } from "express";
import { prisma } from "..";
import { Category, Delivery, Product } from "@prisma/client";
import { NotFoundException } from "../exceptions/not-found";
import { DeliverySchema, UpdateDeliverySchema } from "../schema/delivery";
import { BadRequestsException } from "../exceptions/bad-request";

export const createDelivery = async (req: Request, res: Response, next: NextFunction) => {
    console.log("This is the request body: ", req.body)
  const { startDate, endDate, price, ...body } = req.body
    
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        const parsedPrice = parseFloat(price);

        const validateDelivery = DeliverySchema.parse({
            endDate: parsedEndDate,
            startDate: parsedStartDate,
            price: parsedPrice,
            ...body
        });

    const delivery = await prisma.delivery.create({
        data: {...validateDelivery}
    })

    return res.status(201).json({ sccess: true, status: 201, data: {...delivery} })
}

export const updateDelivery = async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, price, ...body } = req.body

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate): undefined;
    const parsedPrice = price ? parseFloat(price) : undefined;

    const validateDelivery = UpdateDeliverySchema.parse({
        endDate: parsedEndDate,
        startDate: parsedStartDate,
        price: parsedPrice,
        ...body
    });

    //if a parent id is sent, validate if its an existing category before appending
    if (!req.params.id) {
        throw new BadRequestsException("Request param of id is required on this route")
    }
    try {
        let delivery = await prisma.delivery.update({
            where: { id: req.params.id as string },
            data: {
                ...validateDelivery
            }
        })

        return res.status(200).json({ sccess: true, status: 200, data: { ...delivery } });
    } catch (err) {
        throw new NotFoundException("Delivery with given Id doesn't exist")
    }

}


export const getAllDelivery = async (req: Request, res: Response, next: NextFunction) => {
    let delivery = await prisma.delivery.findMany();
    return res.json({ success: true, status: 200, data: [...delivery] })
}

export const getDeliveryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let delivery = await prisma.delivery.findFirstOrThrow({
            where: { id: req.params.id },
        });
        return res.json({ success: true, status: 200, data: { ...delivery } })
    } catch (err) {
        throw new NotFoundException("Delivery with given Id doesn't exist")
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