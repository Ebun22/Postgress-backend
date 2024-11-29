import { NextFunction, Request, Response } from "express"
import { CategorySchema } from "../schema/category"

export const createCategories = async (req: Request, res: Response, nexxt: NextFunction) => {
    CategorySchema.parse(req.body);
    const category = await category.createMany({
        data: {
            name: cat.name,
            parentId: cat.parentId,
        }
    })
}

export const getCategories = async () => {

}

export const getCategoriesById = async () => {

}

export const deleteCategories = async () => {

}