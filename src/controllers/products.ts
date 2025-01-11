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
import { UploadApiResponse } from "cloudinary";

export const createProducts = async (req: Request, res: Response, next: NextFunction) => {
    const { price, stockQuantity, category, isVisible, discount, ...body } = req.body;
    const files = req.files as Express.Multer.File[];

    // Parse and transform inputs
    const newPrice = Number(price);
    const newStockQuantity = Number(stockQuantity);
    const newDiscount = Number(discount);
    const parsedCategory = JSON.parse(category)
    const newIsVisible = isVisible ? JSON.parse(isVisible) : false;   

    const createCategories: {create?: any, connect?: any} = {} 
    // const insertCategories: {connect?: any} = {} 
    
    // Validate uploaded files
    if (!files || files.length === 0) {
        throw new UnprocessableEntity("At least one image is required", {});
    }
    const validateProduct = ProductSchema.parse({
        price: newPrice,
        stockQuantity: newStockQuantity,
        category: parsedCategory,
        images: files,
        discount: newDiscount,
        isVisible: newIsVisible,
        ...body
    })
    const {images, ...validatedProduct } = validateProduct 
    //UPLOAD AND IMAGE
    let uploadResult: UploadApiResponse[];
    try {
        uploadResult = await Promise.all(
            images.map((img: Express.Multer.File) => {
                return cloudinary.uploader.upload(img.path, {
                    folder: 'products',
                    quality: 'auto',
                    fetch_format: 'auto',
                    crop: 'auto',
                    gravity: 'auto'
                }
                )
            })
        )
    } catch (err) {
        console.log("This error in image upload: ", err)
        throw new BadRequestsException("Error uploading image")
    }
    

    if(category.name){
        createCategories.create = parsedCategory.map((cat: Category) => ({
            name: cat.name,
            parentId: cat.parentId,
        }))
    }
    else{
        createCategories.connect = parsedCategory.map((cat: Category) => ({
            id: cat.id
        }))
    }

    let productImages: Image[];
    try {
        return prisma.$transaction(async (tx) => {

            const product = await tx.product.create({
                data: {
                    ...validatedProduct,
                    category: createCategories
                },
                include: {
                    category: true
                }
            })
            if (product) {
                productImages = await Promise.all(
                    uploadResult.map((img: UploadApiResponse) =>
                        tx.image.create({
                            data: {
                                productId: product.id,
                                url: img.secure_url
                            }
                        }))
                )

                return res.status(201).json({ status: 201, success: true, data: { ...product } });
            }
        })

    } catch (err) {
        console.log(err)
        throw new BadRequestsException("Category is undefined")
    }

}

export const updateProducts = async (req: Request, res: Response, next: NextFunction) => {
    const { price, stockQuantity, attributes, category, isFavourite, ...body } = req.body;
    const files = req.files as Express.Multer.File[];

    console.log("Edit product is running", files, req.body)
    let uploadResult: UploadApiResponse[];
    
    // Parse and transform inputs
    const newPrice = price ? Number(price) : undefined;
    const newStockQuantity = stockQuantity ? Number(stockQuantity) : undefined;
    const parsedCategory = category ? JSON.parse(category) : undefined;
    const parsedAttribute = attributes ? JSON.parse(attributes) : undefined;
    const parsedFavourite = isFavourite === "true" ? true : isFavourite === "false" ? false : undefined;
    
    const validateProduct = ProductUpdateSchma.parse({
        price: newPrice,
        stockQuantity: newStockQuantity,
        category: parsedCategory,
        images: files || undefined,
        ...body
    })
    const {images, ...validatedProduct } = validateProduct 
    //If images are sent, add them  to cloudinary
    if (files && Array.isArray(files) && files.length > 0) {
        try {
            uploadResult = await Promise.all(
                images.map((img: Express.Multer.File) => {
                    return cloudinary.uploader.upload(img.path, {
                        folder: 'products',
                        quality: 'auto',
                        fetch_format: 'auto',
                        crop: 'auto',
                        gravity: 'auto'
                    }
                    )
                })
            )
            console.log("Created nwe image: ", uploadResult)
        } catch (err) {
            console.log("This error in image upload: ", err)
            throw new BadRequestsException("Error uploading image")
        }
    }
    try {
        const updatedProduct = await prisma.$transaction(async (tx) => {
            const product = await tx.product.update({
                where: { id: req.params.id },
                data: {
                    ...validatedProduct,
                    category: {
                        connect: parsedCategory.map((cat: Category) => ({
                           id: cat.id
                        }))
                    }
                }
            })
            if (product) {
                try {
                    const createdImage = await Promise.all(
                        uploadResult.map((img: UploadApiResponse) => {
                            return tx.image.create({
                                data: {
                                    productId: product.id,
                                    url: img.secure_url
                                }
                            })
                        }
                        )
                    )
                    console.log("This is image created successfully: ", createdImage)
                } catch (err) {
                    throw new BadRequestsException("Error adding image")
                }
            }

            return product
        })
        return res.status(200).json({ status: 200, success: true, data: { ...updatedProduct } });
    } catch (err) {
        console.log("This error in image upload: ", err)
        throw new NotFoundException("Error updating Product: Product with given id not found")
    }
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
        cursorProduct = await prisma.product.findUnique({
            where: { id: cursor as string }
        })

        if (!cursorProduct) {
            throw new NotFoundException("Product id not found")
        }
    }
    const allProducts = await prisma.product.findMany({
        include: {
            category: true,
            images: true
        },
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
        // console.log("This is the last product: ", allProducts[allProducts.length - 1].id, allProducts.length)
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

            },
            images: true
        }
    })
    if (product) {
        res.json({ success: true, status: 200, data: { ...product } })
        return;
    }
}

//delete a single product image
export const deleteProductImageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const image = await prisma.image.findFirstOrThrow({ where: { id: req.params.id } });
        const name = image.url.split('products/')[1].split('.')[0];

        const cloudinaryDelete = await cloudinary.uploader.destroy(`products/${name.trim()}`);
        if (cloudinaryDelete.result != 'ok') return;

        const deletedImage = await prisma.image.delete({ where: { id: req.params.id } })
        if (deletedImage) {
            res.status(204).json()
            return;
        }
    } catch (err) {
        throw new NotFoundException("Image with given Id not found")
    }

}

export const deleteAllProductImage = async (req: Request, res: Response, next: NextFunction) => {
    let product: any;
    //delete all images tied to a particular product
    try {
        product = await prisma.product.findFirstOrThrow({
            where: { id: req.params.id },
            include: {
                images: true
            }
        })
    } catch (err) {
        throw new NotFoundException("Product with given Id not found")
    }

    if (product.images.length == 0) {
        throw new BadRequestsException("No images found for this product")
    }
    const cloudinaryDestroy = await Promise.all(
        product.images.map((img: Image) => {
            const name = img.url.split('products/')[1].split('.')[0]
            return cloudinary.uploader.destroy(`products/${name.trim()}`)
        })
    )

    if (cloudinaryDestroy[0].result == "ok") {
        const deletedProduct = await prisma.image.deleteMany({ where: { productId: req.params.id } })
        if (deletedProduct) {
            res.status(204).json()
            return;
        }
    } else {
        throw new BadRequestsException("Image not found in cloud")
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

