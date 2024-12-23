import { Request, Response, NextFunction } from "express";
import { prisma } from "..";
import { Prisma, User } from "@prisma/client"
import { NotFoundException } from "../exceptions/not-found";
import { InternalException } from "../exceptions/internal-exception";
import { ShippingAddressSchema, UpdateShippingAddressSchema, UpdateUserSchema } from "../schema/users";
import { UnprocessableEntity } from "../exceptions/validation";
import { BadRequestsException } from "../exceptions/bad-request";

export const createShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
    ShippingAddressSchema.parse(req.body);
    const address = await prisma.shippingAddress.create({ data: { ...req.body, userId: req.user.id } });
    res.status(201).json({ success: true, statusCode: 201, data: { ...address } });
}

export const getShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
    const address = await prisma.shippingAddress.findMany();
    res.status(200).json({ success: true, statusCode: 200, data: [...address] });
    return;
}

export const getByIdShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
    const address = await prisma.shippingAddress.findFirstOrThrow({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, statusCode: 200, data: { ...address } });

}

export const editShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
    const validateAddress = UpdateShippingAddressSchema.parse(req.body);
    const address = await prisma.shippingAddress.findFirstOrThrow({ where: { id: req.params.id } });

    if (address) {
        const address = await prisma.shippingAddress.update({
            where: { id: req.params.id },
            data: validateAddress,
        })
        res.status(200).json({ success: true, statusCode: 200, data: { ...address } });
    } else {
        throw new BadRequestsException("Address doesn't belong to user")
    }

}

export const deleteShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
    const address = await prisma.shippingAddress.findFirstOrThrow({ where: { id: req.params.id } });

    if (address) {
        const user = await prisma.user.update({
            where: { defaultShippingAddressId: req.params.id },
            data: { defaultShippingAddressId: null }
        })

        if (!user) {
            return;
        } 

        //if shippingAddress to be deleted is == to default address, set default address to null
        await prisma.shippingAddress.delete({ where: { id: req.params.id } })
        res.status(204).json({ success: true, statusCode: 204 });
    } else {
        throw new BadRequestsException("Address doesn't belong to user")
    }
}

//USER ACCOUNT CONTROLLERS
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { address: true}
    })
    res.json({ success: true, status: 200, data: { ...user } })
    return;
}

//USER ACCOUNT CONTROLLERS
export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            number: true,
            role: true,
            defaultShippingAddressId: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                  Order: true, 
                },
            },
          },
    })

    res.json({ success: true, status: 200, data: [ ...user ] })
    return;
}



export const editUser = async (req: Request, res: Response, next: NextFunction) => {
    const validateUser = UpdateUserSchema.parse(req.body);
    console.log("This is shipping Id sent: ", validateUser.defaultShippingAddressId)
    console.log("This is the user id: ", req.user.id)
    let user: User
    if (validateUser.defaultShippingAddressId) {
        user = await prisma.user.update({
            where: { id: req.user.id },
            data: { defaultShippingAddressId: validateUser.defaultShippingAddressId }
        })
        const { password, ...userWithoutPassword } = user
        res.json({ success: true, status: 200, data: { ...userWithoutPassword } })
    }
    user = await prisma.user.update({
        where: { id: req.user.id },
        data: validateUser
    })
    const { password, ...userWithoutPassword } = user
    res.json({ success: true, status: 200, data: { ...userWithoutPassword } })
}