import { Request, Response, NextFunction } from "express";
import { prisma } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestsException } from "../exceptions/bad-request";


export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;

    //validate that product exists
    try {
        await prisma.product.findFirst({ where: { id: productId } })
    } catch {
        throw new NotFoundException("product id doesn't exist")
    }

    try {
        const wishlist = await prisma.wishlist.create({
            data: { productId, userId: req.user.id },
            include: { product: true }
        })
        return res.status(201).json({ status: 201, success: true, data: { ...wishlist } });
    } catch (err) {
        console.log(err)
        throw new BadRequestsException("Product wasn't added to wishlist")
    }

}


export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
    const deletedWishlist = await prisma.wishlist.delete({ where: { id: req.params.id } })
    if (deletedWishlist) {
        res.status(204).json()
        return;
    }
}

export const getAllWishlist = async (req: Request, res: Response, next: NextFunction) => {
    //handle pagination
    const totalWishlist = await prisma.wishlist.count();
    let cursorWishlist;
    const { limit, cursor } = req.query;
    const finalLimit = limit || totalWishlist;

    if (cursor) {
        cursorWishlist = await prisma.wishlist.findUnique({
            where: { id: cursor as string }
        })

        if (!cursorWishlist) {
            throw new NotFoundException("Wishlist id not found")
        }
    }
    const allWishlist = await prisma.wishlist.findMany({
        include: {
            product: true
        },
        take: +finalLimit!,
        skip: cursor ? 1 : 0,
        cursor: cursorWishlist ? { id: cursorWishlist.id } : undefined,
        orderBy: { id: 'asc' }
    });

    if (allWishlist.length == 0 && cursor) {
        throw new BadRequestsException("Invalid Cursor sent")
    }

    //handle main get all product
    if (allWishlist) {
        // console.log("This is the last product: ", allProducts[allProducts.length - 1].id, allProducts.length)
        // const nextCursor = (allWishlist.product.length == limit) ? allWishlist[allProducts.length - 1].id : null
        res.json({
            success: true, statusCode: 200, data: [...allWishlist]
        })
        return;
    }
}

// export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
//     const product = await prisma.product.findFirstOrThrow({
//         where: {
//             id: req.params.id
//         },
//         include: {
//             category: {
//                 select: {
//                     name: true,
//                     parentId: true
//                 }

//             },
//             images: true
//         }
//     })
//     if (product) {
//         res.json({ success: true, status: 200, data: { ...product } })
//         return;
//     }
// }

