import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { UnprocessableEntity } from "../exceptions/validation";
import { InternalException } from "../exceptions/internal-exception";
import { ProductSchema, ProductUpdateSchma } from "../schema/products";
import { prisma } from "..";
import { Category, Image, Prisma, Product } from "@prisma/client"
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestsException } from "../exceptions/bad-request";
import cloudinary from "../cloudinary";

export const createProducts = async (req: Request, res: Response, next: NextFunction) => {
    const validateProduct = ProductSchema.parse(req.body)
    let { category, image, ...body } = req.body

    //UPLOAD AND IMAGE
    try {
        const uploadResult = await Promise.all(
            image.map((img: Image) => { 
                cloudinary.uploader
                .upload(img.url, {
                    public_id: 'products',
                    folder: 'products',
                }
                )
            })
        )
        console.log(uploadResult)
    } catch (err) {
        console.log("This error in image uppload: ", err)
        throw new BadRequestsException("Error uploading image")
    }
    try {
        const product = await prisma.product.create({
            data: {
                ...body,
                category: {
                    create: category.map((cat: Category) => ({
                        name: cat.name,
                        parentId: cat.parentId,
                    }))
                }
            },
        })

        res.status(201).json({ status: 201, success: true, data: { ...product } })
        return;
    } catch (err) {
        console.log(err)
    }

}

export const updateProducts = async (req: Request, res: Response, next: NextFunction) => {
    ProductUpdateSchma.parse(req.body);

    const data = req.body;
    console.log(req.params.id)
    const product = await prisma.product.update({ where: { id: req.params.id }, data })
    res.json({ success: true, statusCoe: 200, data: { ...product } });
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {

    const deletedProduct = await prisma.product.delete({ where: { id: req.params.id } })
    if (deletedProduct) {
        res.status(204).json()
        return;
    }
}

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    //handle pagination
    const totalProduct = await prisma.product.count();
    let cursorProduct
    const { limit = 1, cursor } = req.query
    if (cursor) {
        cursorProduct = await prisma.product.findUnique({ where: { id: cursor as string } })

        if (!cursorProduct) {
            throw new NotFoundException("Product id not found")
        }
    }
    const allProducts = await prisma.product.findMany({
        take: +limit!,
        skip: cursor ? 1 : 0,
        cursor: cursorProduct ? { id: cursorProduct.id } : undefined,
        orderBy: { id: 'asc' }
    });

    if (allProducts.length == 0 && cursor) {
        throw new BadRequestsException("Invalid Cursor sent")
    }

    //handle main get all product
    if (allProducts) {
        console.log("This is the last product: ", allProducts[allProducts.length - 1].id, allProducts.length)
        const nextCursor = (allProducts.length == limit) ? allProducts[allProducts.length - 1].id : null
        res.json({
            success: true, statusCode: 200, data: [...allProducts], pagination: {
                // currentPage: currentPage += 1,
                totaPages: Math.ceil(totalProduct / Number(limit)),
                nextPageURL: `${req.protocol}://${req.get('host')}${req.path}api/product/?limit=${limit}&cursor=${nextCursor}`
            }
        })
        return;
    }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    const product = await prisma.product.findFirstOrThrow({
        where: {
            id: req.params.id
        },
        include: {
            category: {
                select: {
                    name: true,
                    parentId: true
                }

            }
        }
    })
    if (product) {
        res.json({ success: true, status: 200, data: { ...product } })
        return;
    }
}

//connect and disconnect categories to products
export const manageCategoriesOnProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { productid } = req.params;
    const { connect, disconnect } = req.query;

    const updateCategories: { category?: any } = {}

    //check if conect id is a valid category id
    const categoryExists = async (id: string) => {
        try {
            await prisma.category.findFirst({ where: { id } })
        } catch (err) {
            throw new NotFoundException("Category with provided Id doesn't exist")
        }
    }

    if (connect) {
        categoryExists(connect as string)
        updateCategories.category = {
            connect: { id: connect }
        }
    }

    if (disconnect) {
        categoryExists(connect as string)
        updateCategories.category = {
            disconnect: { id: disconnect }
        }
    }

    try {
        const product = await prisma.product.update({
            where: { id: productid },
            data: updateCategories,
            include: { category: true }
        });

        return res.json({ success: true, status: 200, data: { ...product } })
    } catch (err) {
        console.log(err)
        throw new NotFoundException("Product with provided Id doesn't exist")
    }
}

