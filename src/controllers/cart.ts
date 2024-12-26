import { Response, Request, NextFunction } from "express";
import { CartItemsSchemaArray, UpdateCartSchema } from "../schema/cart";
import { prisma } from ".."
import { NotFoundException } from "../exceptions/not-found";
import { Cart, CartItem, Product, User } from "@prisma/client";
import { BadRequestsException } from "../exceptions/bad-request";

interface ClientCartItemsType {
    productId: string,
    quantity: number,
}
export const addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
    const validateCart = CartItemsSchemaArray.parse(req.body);
    let Item: CartItem[] = [];
    let product: Product[] = [];
    let cart: Cart;

    //validate if productID exists
    try {
        product = await Promise.all(
            validateCart.map(({ productId }) =>
                prisma.product.findFirstOrThrow({ where: { id: productId } })
            )
        )

        cart = await prisma.cart.findFirst({
            where: { userId: req.user.id },
            include: { cartItems: true }
        }) as Cart

        if (!cart) {
            const newCart = await prisma.cart.create({
                data: {
                    userId: req.user.id,
                    cartItems: {
                        create: validateCart.map((items: ClientCartItemsType) => ({
                            productId: items.productId,
                            quantity: items.quantity,
                        }))
                    }
                }
            })
            res.status(201).json({ success: true, statusCode: 201, data: { ...newCart } })
        }
        await Promise.all(
            validateCart.map((items: ClientCartItemsType) =>
                prisma.cartItem.upsert({
                    where: { productId: items.productId },
                    update: { quantity: { increment: items.quantity } },
                    create: {
                        productId: items.productId,
                        quantity: items.quantity,
                        cartId: cart.id
                    }
                })
            )
        )
        res.status(201).json({ success: true, statusCode: 201, data: { ...cart } })
    } catch (err) {
        console.log("this si err in cart: ", err)
        throw new NotFoundException("Product Id doesn't exist")
    }
}

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    //make sure cart belongs to user
    try {
        const cart = await prisma.cart.findFirstOrThrow({
            where: { userId: req.user.id },
            include: {
                cartItems: true
            }
        })
        console.log("This is teh cart: ", cart)
        res.json({ success: true, statusCode: 201, data: { ...cart } })
    } catch (err) {
        throw new BadRequestsException("Cart doesn't belong to user")
    }
}

export const changeQuantity = async (req: Request, res: Response, next: NextFunction) => {
    const cart = await prisma.cart.findFirstOrThrow({ where: { userId: req.user.id } })
    if (cart) {
        const validateCartUpdate = UpdateCartSchema.parse(req.body)

        if (validateCartUpdate.quantity) {

            //if cartItemId exists in the cart, add, if not create the item
            const cart = await prisma.cartItem.update({
                where: { id: req.params.id },
                data: validateCartUpdate
            })
            res.status(200).json({ success: true, statusCode: 200, data: { ...cart } })
        } else {
            //if qunatity is zero, delete item from cart
            try {
                await prisma.cart.delete({ where: { id: req.params.id } })
                res.status(204).json({ success: true, statusCode: 204, message: "Cart Item deleted!" })
            } catch (err) {
                throw new NotFoundException("Cart Item not found")
            }
        }
    }
}

export const deleteItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
    //check if user is deleting his own cart item, 
    let cart: Cart;
    try {
        cart = await prisma.cart.findFirstOrThrow({ where: { userId: req.user.id } })
    } catch (err) {
        throw new BadRequestsException("Cart doesn't belong to user")
    }
    if (cart) {
        //ensure cartItem Id exists
        try {
            await prisma.cart.delete({ where: { id: req.params.id } })
            res.status(204).json({})
        } catch (err) {
            throw new NotFoundException("Cart Item not found in Cart")
        }
    }
}

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
    //check if user is deleting his own cart item, 
    let cart: Cart;
    try {
        cart = await prisma.cart.findFirstOrThrow({ where: { userId: req.user.id } })
    } catch (err) {
        throw new BadRequestsException("Cart doesn't belong to user")
    }
    if (cart) {
        try {
            const clearedCart = await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
            console.log("This is clearedCart: ", clearedCart)
            res.status(200).json({ success: true, statusCode: 200, message: "Cart Cleared" })
        } catch (err) {
            throw new NotFoundException("Cart Item not found in Cart")
        }
    }
}
