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

interface ProductCondition {
    include: {
        category: boolean;
        images: boolean;
    };
    where?: { isVisible: boolean };
    take: number;
    skip: number;
    cursor: {
        id: string;
    } | undefined;
    orderBy: {
        id?: Prisma.SortOrder;
    };
}

export const createProducts = async (req: Request, res: Response, next: NextFunction) => {
    const { price, stockQuantity, category, isVisible, discount, variant, ...body } = req.body;
    const files = req.files as Express.Multer.File[];
    console.log("This is variant: ", variant)
    // Parse and transform inputs
    const newPrice = Number(price);
    const newStockQuantity = Number(stockQuantity);
    const newDiscount = Number(discount);
    const parsedCategory = JSON.parse(category)
    const parsedVariant = JSON.parse(variant)
    const newIsVisible = isVisible ? JSON.parse(isVisible) : false;

    const createCategories: { create?: any, connect?: any } = {}
    // const insertCategories: {connect?: any} = {} 

    // Validate uploaded files
    if (!files || files.length === 0) {
        throw new UnprocessableEntity("At least one image is required", {});
    }
    const validateProduct = ProductSchema.parse({
        price: newPrice,
        stockQuantity: newStockQuantity,
        category: parsedCategory,
        variant: parsedVariant,
        images: files,
        discount: newDiscount,
        isVisible: newIsVisible,
        ...body
    })
    const { images, ...validatedProduct } = validateProduct
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


    if (category.name) {
        createCategories.create = parsedCategory.map((cat: Category) => ({
            name: cat.name,
            parentId: cat.parentId,
        }))
    }
    else {
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
    const { price, stockQuantity, attributes, isVisible, category, discount, variant, isFavourite, ...body } = req.body;
    const files = req.files as Express.Multer.File[];

    console.log("Edit product is running", files, req.body)
    let uploadResult: UploadApiResponse[];

    // Parse and transform inputs
    const newPrice = price ? Number(price) : undefined;
    const newStockQuantity = stockQuantity ? Number(stockQuantity) : undefined;
    const parsedCategory = category ? JSON.parse(category) : undefined;
    const parsedVariant = variant ? JSON.parse(variant) : undefined;
    const newDiscount = discount ? Number(discount) : undefined;
    const newIsVisible = isVisible ? JSON.parse(isVisible) : false;

    const createCategories: { create?: any, connect?: any } = {}

    const validateProduct = ProductUpdateSchma.parse({
        price: newPrice,
        stockQuantity: newStockQuantity,
        category: parsedCategory,
        variant: parsedVariant,
        discount: newDiscount,
        isVisible: newIsVisible,
        images: files || undefined,
        ...body
    })
    const { images, ...validatedProduct } = validateProduct
    console.log("Thsi si product: ", validateProduct)
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

    if (category) {
        if (category.name) {
            createCategories.create = parsedCategory.map((cat: Category) => ({
                name: cat.name,
                parentId: cat.parentId,
            }))
        }
        else {
            createCategories.connect = parsedCategory.map((cat: Category) => ({
                id: cat.id
            }))
        }
    }

    try {
        const updatedProduct = await prisma.$transaction(async (tx: any) => {
            let product: Product;
            try {
                product = await tx.product.update({
                    where: { id: req.params.id },
                    data: {
                        ...validatedProduct,
                        ...(category && { category: createCategories })
                    }

                })
            } catch (err) {
                throw new NotFoundException("Error updating Product: Product with given id not found")
            }

            if (images) {
                if (product && images?.length > 0) {
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
            }

            return product
        })
        return res.status(200).json({ status: 200, success: true, data: { ...updatedProduct } });
    } catch (err) {
        console.log("This error in image upload: ", err)
        throw new NotFoundException("Error updating Product")
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
    let cursorProduct: Product | null = null;
    const { limit = 1, cursor, visible } = req.query

    console.log("This is the visibility query: ", visible)

    //initialize the where clause condition
    let condition = {} as ProductCondition



    if (cursor) {
        cursorProduct = await prisma.product.findUnique({ where: { id: cursor as string } })
        if (!cursorProduct) {
            throw new NotFoundException("Product id not found")
        }
    }
    if (visible) {
        condition = {
            include: {
                category: true,
                images: true,
            },
            where: { isVisible: visible ? JSON.parse(visible as string) : false },
            take: +limit!,
            skip: cursor ? 1 : 0,
            cursor: cursorProduct ? { id: cursorProduct.id } : undefined,
            orderBy: { id: Prisma.SortOrder.asc }

        }
    } else {
        condition = {
            include: {
                category: true,
                images: true,
            },
            take: +limit!,
            skip: cursor ? 1 : 0,
            cursor: cursorProduct ? { id: cursorProduct.id } : undefined,
            orderBy: { id: Prisma.SortOrder.asc }
        }
    }

    console.log("This is the condition: ", condition)

    const allProducts = await prisma.product.findMany(condition);

    if (allProducts.length == 0 && cursor) {
        throw new BadRequestsException("Invalid Cursor sent")
    }

    let prevCursor
    //handle main get all product
    if (allProducts) {
        const nextCursor = (allProducts.length == limit) ? allProducts[allProducts.length - 1].id : null
        if (cursor) {
            prevCursor = allProducts[0]?.id; // Set the first item's ID as the previous cursor
        }
        res.json({
            success: true, statusCode: 200, data: [...allProducts], pagination: {
                // currentPage: currentPage += 1,
                totaPages: Math.ceil(totalProduct / Number(limit)),
                nextPageURL: `${req.protocol}s://${req.get('host')}${req.path}api/product/?limit=${limit}&cursor=${nextCursor}`,
                prevPageURL: prevCursor
                    ? `${req.protocol}s://${req.get('host')}${req.path}api/product/?limit=${limit}&cursor=${prevCursor}`
                    : null,
            }
        })
        return;
    }
}

//get productby search
export const getProductBySearch = async (req: Request, res: Response, next: NextFunction) => {
    const { search, visible } = req.params;
    console.log("This is the search: ", search)
    const products = await prisma.product.findMany({
        where: {
            name: {
                contains: search as string,
                mode: 'insensitive'
            },
            isVisible: visible ? JSON.parse(visible) : false
        },
        include: {
            category: true,
            images: true
        }
    })

    if (products.length == 0) {
        throw new NotFoundException("Product not found");
    }

    return res.json({ success: true, status: 200, data: products })
}

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    const product = await prisma.product.findFirstOrThrow({
        where: {
            id: req.params.id
        },
        include: {
            category: {
                select: {
                    id: true,
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

export const totalOnProductScreen = async (req: Request, res: Response, next: NextFunction) => {
    await prisma.$transaction(async (tx) => {
        //all order
        const aggregatedProduct = await tx.product.aggregate({
            _count: {
                _all: true,
                stockQuantity: true,
            }
        })

        const result = await prisma.product.aggregate({
            _count: {
                stockQuantity: true, // Sum of stockQuantity for products matching the condition
            },
            where: {
                stockQuantity: 0, // Only include products where stockQuantity is 0
            }
        });
        const totalOrder = await tx.order.count();

        const totalProducts = aggregatedProduct._count._all;
        const totalOutOfStock = result._count.stockQuantity;
        const totalInStock = aggregatedProduct._count._all - (totalOutOfStock ? Number(totalOutOfStock) : 0);


        return res.status(200).json({ success: true, status: 200, data: [{ totalProducts, totalInStock, totalOutOfStock, totalOrder }] })
    })
}

export const getMostLikedProduct = async (req: Request, res: Response, next: NextFunction) => {
    const totalProducts = await prisma.product.count();

    // Generate a random offset
    const randomOffset = Math.max(0, Math.floor(Math.random() * (totalProducts - 5)));

    // Fetch 5 products starting from the random offset
    const randomProducts = await prisma.product.findMany({
        skip: randomOffset,
        take: 5,
        include: {
            images: true
        }
    });

    return res.status(200).json({ success: true, status: 200, data: randomProducts });
}