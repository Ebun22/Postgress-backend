import { Request, Response, NextFunction } from "express"
import { prisma } from ".."
import { BadRequestsException } from "../exceptions/bad-request"
import Stripe from 'stripe';
import { Cart, Order, OrderEventStatus, Prisma } from "@prisma/client"
import { NotFoundException } from "../exceptions/not-found"
import { STRIPE_API_KEY } from "../secrets";
import { Decimal } from "@prisma/client/runtime/library";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.defaultShippingAddressId) return res.json({ success: true, message: "No address is set as default" })
    try {
        await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findFirst({
                where: { userId: req.user.id },
                include: {
                    cartItems: {
                        select: {
                            product: true,
                            quantity: true
                        }
                    }
                }
            })
            if (!cart) return res.json({ success: true, message: "user has no cart" })
            if (cart.cartItems.length === 0) {
                return res.json({ success: true, message: "Cart is empty" })
            }

            const totalPrice = cart.cartItems.reduce((prev, current) => {
                return prev += (current.product.price * current.quantity)
            }, 0)


            const address = await tx.shippingAddress.findFirstOrThrow({
                where: {
                    id: req.user.defaultShippingAddress
                }
            })

            //figure out what address is being sent if default fails
            const order = await tx.order.create({
                data: {
                    netAmount: new Decimal(totalPrice),
                    address: address.formattedAddress,
                    userId: req.user.id as string,
                    currency: req.body.currency,
                    products: {
                        create: cart.cartItems.map((items: { product: { id: string }; quantity: number }) => {
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

            await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
            return res.json({ success: true, status: 201, data: { ...order } })
        })

    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundException(err.message)
        }
        console.log("This is error in transactions: ", err)
    }

}

export const createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    const stripe = new Stripe(STRIPE_API_KEY);

    const orderId = req.params.orderId

    const order = await prisma.order.findFirst({
        where: { id: orderId },
        include: {
            products: {
                select: {
                    quantity: true,
                    product: {
                        select: {
                            name: true,
                            price: true,
                        },
                    },
                }
            }
        }
    })
    if (!order) throw new NotFoundException("This order doesn't exist");
    console.log("This is the order: ", order.products[0].product);

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: order.products.map(({ quantity, product }) => ({
                price_data: {
                    currency: order.currency !== null ? order.currency as string : "usd",
                    product_data: {
                        name: product.name
                    },
                    unit_amount: product.price * 100
                },
                quantity
            })),
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}${req.path}api/order/success`,
            cancel_url: `${req.protocol}://${req.get('host')}${req.path}api/order/cancel`,
        });

        console.log("This is the session: ", session)
        return res.json({ success: true, status: 200, data: { id: session.id, url: session.url } })
    } catch (err) {
        console.log("This is the err: ", err)
        // return res.json({ success: false, status: {err.statusCode}, message: {err.raw.message} })
    }

}

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userOrder = await prisma.order.findFirstOrThrow({ where: { userId: req.user.id } })
        if (userOrder) {
            const orders = await prisma.order.findMany({
                include: {
                    products: {
                        select: {
                            product: {
                                select: {
                                    _count: true
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            })
            return res.json({ success: true, status: 200, data: [...orders] })
        }
    } catch (err) {
        throw new BadRequestsException("Order doesn't belong to logged in user")
    }
}

export const EditOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    let order: Order;

    const validateStatus = Object.values(OrderEventStatus)
    if (!validateStatus.includes(req.query.status as OrderEventStatus)) throw new BadRequestsException("Order status type doesn't exist");

    try {
        await prisma.order.findFirstOrThrow({ where: { id: req.params.id } })
    } catch (err) {
        throw new NotFoundException("Order doesn't exist")
    }

    try {
        await prisma.$transaction(async (tx) => {
            try {
                //to make sure user is canceling his own order
                const userOrder = await tx.order.findFirstOrThrow({ where: { userId: req.user.id } })
                if (userOrder) {

                    order = await tx.order.update({
                        where: { id: req.params.id },
                        data: { status: req.query.status as OrderEventStatus },
                        include: { products: true, events: true }
                    })

                    await tx.orderEvent.create({
                        data: {
                            orderId: req.params.id,
                            status: req.query.status as OrderEventStatus
                        }
                    })

                    return res.json({ success: true, statusCode: 200, data: { ...order } });
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
        console.log(userOrder)
        if (userOrder) {
            try {
                const order = await prisma.order.findFirstOrThrow({
                    where: { id: req.params.id },
                    include: {
                        products: {
                            select: {
                                product: {
                                    select: {
                                        name: true,
                                        images: true,
                                        price: true,
                                        stockQuantity: true
                                    }
                                }
                            }
                        },
                        events: true,
                        user: true
                    }
                })
                return res.json({ success: true, statusCode: 200, data: { ...order } });

            } catch (err) {
                throw new NotFoundException("Order Id not found, Order doesn't exist")
            }
        }
    } catch (err) {
        throw new BadRequestsException("Order doesn't belong to logged in user")
    }
}

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    const deletedOrder = await prisma.order.delete({ where: { id: req.params.id } })
    if (deletedOrder) {
        res.status(204).json()
        return;
    }
}