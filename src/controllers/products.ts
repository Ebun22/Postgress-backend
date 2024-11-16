import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { UnprocessableEntity } from "../exceptions/validation";
import { InternalException } from "../exceptions/internal-exception";
import { ProductSchema, ProductUpdateSchma } from "../schema/products";
import { extendedPrisma, rawPrisma } from "..";
import { Prisma } from "@prisma/client"
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestsException } from "../exceptions/bad-request";
import { SoftDelete } from "../middlewares/softDelete";
// import { SoftDelete } from "..";

export const createProducts = async (req: Request, res: Response, next: NextFunction) => {
    //validation in try catch
    try {
        ProductSchema.parse(req.body)
    } catch (err) {
        if (err instanceof ZodError) {
            throw new UnprocessableEntity("Unprocessable entity", err?.issues)
        } else {
            console.log(err)
            throw new InternalException("Something went wrong", err)
        }
    }

    const product = await rawPrisma.product.create({ data: req.body })
    res.status(201).json({ status: 201, success: true, data: { product } })
    return;
}

export const updateProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        ProductUpdateSchma.parse(req.body);
    } catch (err) {
        if (err instanceof ZodError) {
            console.log("This is the Zod error: ", err?.issues)
            throw new UnprocessableEntity("Unprocessable entity", err?.issues)
        } else {
            console.log(err)
            throw new InternalException("Something went wrong", err)
        }
    }
    try {
        const data = req.body;
        console.log(req.params.id)
        const product = await rawPrisma.product.update({ where: { id: req.params.id }, data })
        res.json({ success: true, statusCode: 200, data: product });

    } catch (err) {
        if (err instanceof Prisma.PrismaClientValidationError) {
            throw new UnprocessableEntity("Unprocessable entity: enter valid paramters", err)
        } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
            throw new NotFoundException("Product not found")
        } else {
            console.error("Prisma Update Error:", err);
            throw new InternalException("Opps, Something went wrong :(", err)
        }
    }
    return;
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedProduct = await rawPrisma.product.delete({ where: { id: req.params.id } })
        if (deletedProduct) {
            res.status(204)
            return;
        }
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code == "P2025")) {
            throw new NotFoundException("Product not found");
        } else {
            console.error("Prisma Update Error:", err);
            throw new InternalException("Opps, Something went wrong :(", err)
        }
    }
}

export const addProductToTrash = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const trashedProducts = await extendedPrisma.product.delete({where: {id: req.body.id}})
        if(trashedProducts){
            res.json({ success: true, statusCoe: 202, data: trashedProducts });
        }
    }catch(err){
        if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code == "P2025")) {
            throw new NotFoundException("Product not found");
        } else {
            console.error("Prisma Update Error:", err);
            throw new InternalException("Opps, Something went wrong :(", err)
        }
    }
}

// let currentPage = 0;
export const getAllTrash = async (req: Request, res: Response, next: NextFunction) => {
    const totalProduct = await rawPrisma.product.count();
    let cursorProduct
    const { limit = 1, cursor } = req.query
    if (cursor) {
        cursorProduct = await rawPrisma.product.findUnique({ where: { id: cursor as string } })

        if (!cursorProduct) {
            throw new NotFoundException("Product id not found")
        }
    }
    const allProducts = await rawPrisma.product.findMany({
        where:{
            deletedAt: { not: null }
        },
        take: +limit!,
        skip: cursor ? 1 : 0,
        cursor: cursorProduct ? { id: cursorProduct.id } : undefined,
        orderBy: { id: 'asc' }
    });

    if (allProducts.length == 0 && cursor) {
        throw new BadRequestsException("Invalid Cursor sent")
    }
    if (allProducts) {
        console.log("This is the last product: ", allProducts[allProducts.length - 1].id, allProducts.length)
        const nextCursor = (allProducts.length == limit) ? allProducts[allProducts.length - 1].id : null
        res.json({
            success: true, statusCode: 200, data: { allProducts }, pagination: {
                // currentPage: currentPage += 1,
                totaPages: Math.ceil(totalProduct / Number(limit)),
                nextPageURL: `${req.protocol}://${req.get('host')}${req.path}api/product/?limit=${limit}&cursor=${nextCursor}`
            }
        })
        return;
    }
}

// let currentPage = 0;
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    const totalProduct = await rawPrisma.product.count();
    let cursorProduct
    const { limit = 1, cursor } = req.query
    if (cursor) {
        cursorProduct = await rawPrisma.product.findUnique({ where: { id: cursor as string } })

        if (!cursorProduct) {
            throw new NotFoundException("Product id not found")
        }
    }
    const allProducts = await rawPrisma.product.findMany({
        take: +limit!,
        skip: cursor ? 1 : 0,
        cursor: cursorProduct ? { id: cursorProduct.id } : undefined,
        orderBy: { id: 'asc' }
    });

    if (allProducts.length == 0 && cursor) {
        throw new BadRequestsException("Invalid Cursor sent")
    }
    if (allProducts) {
        console.log("This is the last product: ", allProducts[allProducts.length - 1].id, allProducts.length)
        const nextCursor = (allProducts.length == limit) ? allProducts[allProducts.length - 1].id : null
        res.json({
            success: true, statusCode: 200, data: { allProducts }, pagination: {
                // currentPage: currentPage += 1,
                totaPages: Math.ceil(totalProduct / Number(limit)),
                nextPageURL: `${req.protocol}://${req.get('host')}${req.path}api/product/?limit=${limit}&cursor=${nextCursor}`
            }
        })
        return;
    }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    const product = await rawPrisma.product.findFirst({
        where: {
            id: req.params.id
        }
    })
    if (product) {
        res.json({ success: true, statusCode: 200, data: { product } })
        return;
    }

}