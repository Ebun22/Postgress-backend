import { Request, Response, NextFunction } from "express";
import { prisma } from "..";
import { Prisma, User } from "@prisma/client"
import { NotFoundException } from "../exceptions/not-found";
import { InternalException } from "../exceptions/internal-exception";
import { ShippingAddressSchema, UpdateShippingAddressSchema, UpdateUserSchema } from "../schema/users";
import { UnprocessableEntity } from "../exceptions/validation";
import { BadRequestsException } from "../exceptions/bad-request";

export const createShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
    //if isDefault is true, get the id and set as default
    const { isDefault, ...body } = req.body;
    //if user has no previous address, current first address should be set as default 
    ShippingAddressSchema.parse(req.body);
    const address = await prisma.shippingAddress.create({ data: { ...req.body, userId: req.user.id } });
    if (isDefault) {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { defaultShippingAddressId: address.id }
        })
    }
    res.status(201).json({ success: true, statusCode: 201, data: { ...address } });
}

export const getShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
    // console.log("This is the user id: ", req.user.id)
    const address = await prisma.shippingAddress.findMany({ where: { userId: req.user.id } });
    // if(address.userId !== req.user.id)
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
        include: { address: true }
    })
    res.json({ success: true, status: 200, data: { ...user } })
    return;
}

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

    res.json({ success: true, status: 200, data: [...user] })
    return;
}

export const getCustomersBySearch = async (req: Request, res: Response, next: NextFunction) => {
    const { search } = req.params;

    if (!search) {
        throw new UnprocessableEntity("Search query is required", "No search query found");
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { 
                        contains: search,
                        mode: "insensitive"
                    } },
                    { email: { 
                        contains: search,
                        mode: "insensitive"
                     } },
                    { number: { 
                        contains: search,
                        mode: "insensitive"
                    } }
                ]
            },
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
        if (users.length === 0) {
            throw new NotFoundException("No user found")
        }
        return res.json({ success: true, status: 200, data: users })
    } catch (err) {
        console.log(err)
        throw new NotFoundException("No user found")
    }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findFirstOrThrow({
        where: { id: req.params.id },
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
            Order: {
                include: {
                    products: true
                }
            },
        },
    })

    res.json({ success: true, status: 200, data: { ...user } })
    return;
}

export const editUser = async (req: Request, res: Response, next: NextFunction) => {
    const validateUser = UpdateUserSchema.parse(req.body);
    // console.log("This is shipping Id sent: ", validateUser.defaultShippingAddressId)
    // console.log("This is the user id: ", req.user.id)
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

//Totals on dashboard
export const getTotalOnDashboard = async (req: Request, res: Response, next: NextFunction) => {
    //total sales
    await prisma.$transaction(async (tx) => {
        //total Products
        const totalProducts = await tx.product.count()
        //total orders
        const totalOrder = await tx.order.count()
        //total Recipe
        const totalRecipe = await tx.recipe.count()
        //total Custumers
        const totalCustomers = await tx.user.count()

        return res.status(200).json({ success: true, status: 200, data: [{ totalProducts, totalOrder, totalRecipe, totalCustomers }] })
    })
}
