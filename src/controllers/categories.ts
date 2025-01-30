import { NextFunction, Request, Response } from "express"
import { CategoryArraySchema, UpdateCategorySchema } from "../schema/category"
import { prisma } from "..";
import { Category, Product } from "@prisma/client";
import { NotFoundException } from "../exceptions/not-found";
import { disconnect } from "process";

export const createCategories = async (req: Request, res: Response, next: NextFunction) => {
    const validateCategory = CategoryArraySchema.parse(req.body);
    let existingId: Category | null;
    validateCategory.map(async (data) => {
        //if a parent id is sent, validate if its an existing category before appending
        if (data.parentId != null) {
            existingId = await prisma.category.findFirst({ where: { id: data.parentId as string } })
            if (existingId) {
                let category = await prisma.category.createMany({
                    data: req.body.map((cat: Category) => ({
                        name: cat.name,
                        parentId: cat.parentId,
                    }))
                })

                return res.status(201).json({ sccess: true, status: 201, data: { ...category } });
            }
        }
        //if parent id is null, then just apend it
        let category = await prisma.category.createMany({
            data: req.body.map((cat: Category) => ({
                name: cat.name,
                parentId: cat.parentId,
            }))
        })

        return res.status(201).json({ sccess: true, status: 201, data: { ...category } })
    })


}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    const validateCategory = UpdateCategorySchema.parse(req.body);

    //if a parent id is sent, validate if its an existing category before appending
    if (validateCategory.parentId !== null) {
        try {
            await prisma.category.findFirstOrThrow({ where: { id: validateCategory.parentId as string } })
        } catch (err) {
            throw new NotFoundException("Category Id to make parent doesn't exist")
        }
    }
    try {
        let category = await prisma.category.update({
            where: { id: req.params.id as string },
            data: {
                name: validateCategory.name ?? undefined,
                parentId: validateCategory.parentId ? validateCategory.parentId : null,
            }
        })

        return res.status(200).json({ sccess: true, status: 200, data: { ...category } });
    } catch (err) {
        throw new NotFoundException("Category with given Id doesn't exist")
    }
}

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    let categories = await prisma.category.findMany();
    return res.json({ success: true, status: 200, data: [...categories] })
}

export const getCategoryBySearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let categories = await prisma.category.findMany({
            where: {
                name: {
                    contains: req.params.search,
                    mode: "insensitive"
                }
            }
        })

        if (categories.length === 0) {
            throw new NotFoundException("No Category with given search term found")
        }
        
        return res.json({ success: true, status: 200, data: categories })
    } catch (err) {
        console.log("This si error on search: ", err)
        throw new NotFoundException("No Category with given search term found")
    }
}

export const getCategoriesById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let category = await prisma.category.findFirstOrThrow({
            where: { id: req.params.id },
            include: {
                Product: {
                    include: {
                        category: true,
                        images: true
                    }
                }
            }
        });
        return res.json({ success: true, status: 200, data: { ...category } })
    } catch (err) {
        throw new NotFoundException("Category with given Id doesn't exist")
    }
}

export const deleteCategories = async (req: Request, res: Response, next: NextFunction) => {
    let productFound: Product[];
    try {
        productFound = await prisma.product.findMany({
            where: {
                category: {
                    some: { id: req.params.id }
                }
            }
        })
    } catch (err) {
        console.log(err)
        // throw new NotFoundException("No Product")
    }
    try {
        await prisma.$transaction(async (tx) => {

            //if a category id to be deleted is someones parentId, make their parent id null
            let category = await tx.category.updateMany({
                where: { parentId: req.params.id },
                data: { parentId: null }
            });

            if (productFound) {
                //if a category Id is connected to a product, disconnect it
                await tx.category.update({
                    where: {
                        id: req.params.id
                    },
                    data: {
                        Product: {
                            disconnect: productFound.map((product: { id: string; }) => ({ id: product.id }))
                        }
                    }
                })
            }

            if (category) {
                console.log("Thsi sis inside the delete: ", category)
                let deletedCategory = await tx.category.delete({ where: { id: req.params.id } })
                if (!deletedCategory) return;
                return res.status(204).json({ success: true })
            }

        })
    } catch (err) {
        console.log(err)
        throw new NotFoundException("Category with given Id doesn't exist")
    }

}