import { Request, Response, NextFunction } from "express"
import { prisma } from ".."
import { BadRequestsException } from "../exceptions/bad-request"
import { Prisma } from "@prisma/client"
import { NotFoundException } from "../exceptions/not-found"

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.$transaction(async (tx) => {
            const cartItems = await tx.cart.findMany({
                where: { userId: req.user.id },
                include: {
                    product: true
                }
            })

            if (cartItems.length === 0) {
                return res.json({ success: true, message: "Cart is empty" })
            }
            const totalPrice = cartItems.reduce((prev, current) => {
                return prev += (current.product.price * current.quantity)
            }, 0)


            const address = await tx.shippingAddress.findFirstOrThrow({
                where: {
                    id: req.user.defaultShippingAddress
                }
            })
            // if(address){

            // }

            //figure out what address is being sent if default fails
            console.log("Thsi is teh address: ", address, "Thsi si teh default addy: ", req.user.defaultShippingAddress)
            const order = await tx.order.create({
                data: {
                    netAmount: totalPrice,
                    address: address.formattedAddress,
                    userId: req.user.id,
                    products: {
                        create: cartItems.map((items) => {
                            return {
                                productId: items.product.id,
                                quantity: items.quantity
                            }
                        })
                    }
                }
            })

            const orderEvents = await tx.orderEvent.create({
                data: {
                    orderId: order.id
                }
            })

            await tx.cart.deleteMany({ where: { userId: req.user.id } })
            return res.json({ success: true, statusCode: 201, data: { order } })
        })

    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundException(err.message)
        }
        console.log("Thsi is error in transactions: ", err)
    }

}

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userOrder = await prisma.order.findFirstOrThrow({ where: { userId: req.user.id } })
        if (userOrder) {
            const orders = await prisma.order.findMany()
            return res.json({ success: true, statusCode: 200, data: { orders } })
        }
    } catch (err) {
        throw new BadRequestsException("Order doesn't belong to logged in user")
    }
}

export const cancelOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.$transaction(async (tx) => {
            try {
                //to make sure user is canceling his own order
                const userOrder = await tx.order.findFirstOrThrow({ where: { userId: req.user.id } })
                if (userOrder) {
                    const order = await tx.order.update({
                        where: { id: req.params.id },
                        data: {
                            status: "CANCELLED"
                        }, include: {
                            products: true,
                            events: true
                        }
                    })
                    await tx.orderEvent.create({
                        data: {
                            orderId: req.params.id,
                            status: 'CANCELLED'
                        }
                    })
                    return res.json({ success: true, statusCode: 200, data: order });
                }
            } catch (err) {
                throw new BadRequestsException("Order doesn't belong to logged in user")
            }
        })
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundException(err.message)
        }
    }
}

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userOrder = await prisma.order.findFirstOrThrow({ where: { userId: req.user.id } })
        if (userOrder) {
            try {
                const order = await prisma.order.findFirstOrThrow({
                    where: { id: req.params.id },
                    include: {
                        products: true,
                        events: true
                    }
                })
                return res.json({ success: true, statusCode: 200, data: { order } });

            } catch (err) {
                throw new NotFoundException("Order Id not found, Order doesn't exist")
            }
        }
    } catch (err) {
        throw new BadRequestsException("Order doesn't belong to logged in user")
    }
}