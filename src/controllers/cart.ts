import { Response, Request, NextFunction } from "express";
import { CartSchema, UpdateCartSchema } from "../schema/cart";
import { prisma } from ".."
import { NotFoundException } from "../exceptions/not-found";
import { Cart, Product } from "@prisma/client";
import { BadRequestsException } from "../exceptions/bad-request";

export const addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
    const validateCart = CartSchema.parse(req.body);
    let cartItem: Cart;

    //validate if productID exists
    let product: Product = await prisma.product.findFirstOrThrow({ where: { id: validateCart.productId } })

    //if productID already exists in cart, add qunatity to existing quantity
    if (product) {
        cartItem = await prisma.cart.upsert({
            where: { productId: validateCart.productId },
            update: { quantity: { increment: validateCart.quantity } },
            create: { ...validateCart, userId: req.user.id }
        })
        res.status(201).json({ success: true, statusCode: 201, data: { ...cartItem } })
    } else {
        throw new NotFoundException("Product not found");
    }

}

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    //make sure cart belongs to user
    try {
        const cart = await prisma.cart.findMany({
            where: { userId: req.body.id },
            include: {
                product: {
                    select: {
                        name: true,
                        description: true,
                        price: true,
                    }
                }
            }
        })
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
            const cart = await prisma.cart.update({
                where: { id: req.params.id },
                data: validateCartUpdate
            })
            res.status(200).json({success: true, statusCode: 200, data: {cart}})
        } else {
            //if qunatity is zero, delete item from cart
            try {
                await prisma.cart.delete({ where: { id: req.params.id } })
                res.status(204).json({success: true, statusCode: 204, message: "Cart Item deleted!"})
            } catch (err) {
                throw new NotFoundException("Cart Item not found")
            }
        }
    }

}

export const deleteItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
    //check if user is deleting his own cart item, 
    let cart: Cart;
    try{
        cart = await prisma.cart.findFirstOrThrow({ where: { userId: req.user.id } })
    }catch(err){
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