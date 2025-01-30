import { Request, Response, NextFunction } from "express"
import { prisma } from ".."
import { BadRequestsException } from "../exceptions/bad-request"
import Stripe from 'stripe';
import { Cart, Order, OrderEventStatus, Prisma } from "@prisma/client"
import { NotFoundException } from "../exceptions/not-found"
import { STRIPE_API_KEY, STRIPE_ENDPOINT_SECRET } from "../secrets";
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
                    netAmount: new Decimal(totalPrice + req.body.shippingFee),
                    shippingFee: new Decimal(req.body.shippingFee),
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
    console.log('Stripe Key:', STRIPE_API_KEY);
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

    // delete cart if payment is successfull
    // await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                ...order.products.map(({ quantity, product }) => ({
                    price_data: {
                        currency: order.currency !== null ? order.currency as string : "usd",
                        product_data: {
                            name: product.name
                        },
                        unit_amount: product.price * 100
                    },
                    quantity
                })),
                {
                    price_data: {
                        currency: order.currency !== null ? order.currency as string : "usd",
                        product_data: {
                            name: "Shipping Fee"
                        },
                        unit_amount: Number(order.shippingFee) * 100
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${req.protocol}s://${req.get('host')}${req.path}api/order/success`,
            cancel_url: `${req.protocol}s://${req.get('host')}${req.path}api/order/cancel`,
        });

        console.log("This is the session: ", session)
        return res.json({ success: true, status: 200, data: { id: session.id, url: session.url } })
    } catch (err) {
        console.log("This is the err: ", err)
        // return res.json({ success: false, status: {err.statusCode}, message: {err.raw.message} })
    }

}

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    // This is your Stripe CLI webhook secret for testing your endpoint locally.
    const endpointSecret = "whsec_c354a1e4476a4eeef1b3ce0f7cc8b13ca94775f78fc096b57b2f0e9a017bc45d";

    const sig = req.headers['stripe-signature'];
    const stripe = new Stripe(STRIPE_API_KEY);

    let event;

    try {
        if (!sig) {
            throw new Error('Missing Stripe signature');
        }
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_ENDPOINT_SECRET);
    } catch (err: unknown) {
        const errorMessage = (err as Error).message;
        res.status(400).send(`Webhook Error: ${errorMessage}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            console.log("Checkout session completed")
            console.log(event.data)
            //if successfull, delete cart
            //if successfull, send email of success to customer
            //change order event status to successfull


            //if cancelled, send email of canceled to customer
            //if cancelled, cahnge order status to ccanceled
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
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
                            quantity: true,
                            product: {
                                select: {
                                    name: true,
                                    images: true,
                                    price: true
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

export const getOrdersBySearch = async (req: Request, res: Response, next: NextFunction) => {
    const { search } = req.params;
    try {
        let orders = await prisma.order.findMany({
            where: {
                OR: [
                    //by order id
                    { id: search },
                    //by customer name
                    {
                        user: {
                            name: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    },
                    //by address
                    {
                        address: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    //by status
                    {
                        status: {
                            equals: search as OrderEventStatus
                        }
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })
        if (orders.length === 0) {
            throw new NotFoundException("No Category with given search term found")
        }
        return res.json({ success: true, status: 200, data: orders })
    } catch (err) {
        console.log("This si error on search: ", err)
        throw new NotFoundException("No Category with given search term found")
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
                                quantity: true,
                                product: {
                                    select: {
                                        name: true,
                                        images: true,
                                        price: true,
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

export const totalOnOrderDashboard = async (req: Request, res: Response, next: NextFunction) => {
    await prisma.$transaction(async (tx) => {
        //all order
        const totalOrder = await tx.order.count()
        //all status
        const totalStatus = await tx.orderEvent.groupBy({
            by: ['status'],
            _count: true
        })

        return res.status(200).json({ success: true, status: 200, data: [{ totalOrder, totalStatus }] })
    })
}

