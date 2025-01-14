import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { UnprocessableEntity } from "../exceptions/validation";
import { InternalException } from "../exceptions/internal-exception";
import { ProductSchema, ProductUpdateSchma } from "../schema/products";
import { prisma } from "..";
import { Category, Image, Prisma, Product, Recipe } from "@prisma/client"
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestsException } from "../exceptions/bad-request";
import cloudinary from "../cloudinary";
import { UploadApiResponse } from "cloudinary";
import { RecipeSchema, RecipeUpdateSchma } from "../schema/recipe";

type RecipeWithImages = Recipe & {
    image: Image[];
};

export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
    const { ratings, product, isVisible, ...body } = req.body;
    const files = req.files as Express.Multer.File[];

    const newRatings = ratings ? Number(ratings) : undefined;
    const newProduct = product ? JSON.parse(product) : undefined;
    const newIsVisible = isVisible ? JSON.parse(isVisible) : false;         

    // Validate uploaded files
    if (!files || files.length === 0) {
        throw new UnprocessableEntity("At least one image is required", {});
    }

    const validateRecipe = RecipeSchema.parse({
        ratings: newRatings,
        image: files,
        isVisible: newIsVisible,
        ...body
    });

    console.log("THESE IS validateRecipe: ", validateRecipe)
    const { image, ...validatedRecipe } = validateRecipe;

    //UPLOAD AND IMAGE
    let uploadResult: UploadApiResponse[];
    try {
        uploadResult = await Promise.all(
            image.map((img: Express.Multer.File) => {
                return cloudinary.uploader.upload(img.path, {
                    folder: 'recipes',
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
    //verify if product id sent is valid
    if (newProduct) {
        try {
            const product = await Promise.all(
                newProduct.map((id: { Id: string }) => {
                    return prisma.product.findFirstOrThrow({ where: { id: id.Id } })
                })
            )
            console.log(product)
        } catch (err) {
            throw new NotFoundException("Product with given Id doesn't exist")
        }
    }
    try {
        const recipe = await prisma.recipe.create({
            data: {
                ...validatedRecipe,
                image: {
                    create: uploadResult?.map((img: UploadApiResponse) => ({
                        url: img.secure_url
                    }))
                },
                product: {
                    create: newProduct?.map((item: { Id: string }) => ({
                        productId: item.Id,
                    })),
                },
            }, include: {
                image: true,
                product: {
                    select: {
                        productId: true
                    }
                }
            }
        })
        return res.status(201).json({ status: 201, success: true, data: { ...recipe } });
    } catch (err) {
        console.log(err)
        throw new BadRequestsException("Recipe not propery created")
    }

}

export const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
    const { ratings, product, isVisible, ...body } = req.body;
    const files = req.files as Express.Multer.File[];
    console.log("This is the files: ",files)
    console.log("Edit recipe is running", files, req.body)
    let uploadResult: UploadApiResponse[] = [];

    // Parse and transform inputs
    const newRatings = ratings ? Number(ratings) : undefined;
    const newProduct = product ? JSON.parse(product) : undefined;
    console.log("This is the new poroduct: ", newProduct);

    const validateRecipe = RecipeUpdateSchma.parse({
        ratings: newRatings,
        image: files || undefined,
        isVisible: isVisible ? JSON.parse(isVisible) : false,
        ...body
    });
    
    console.log("This is the validated Recipe: ", validateRecipe);
    //validate if product exists
    if (newProduct) {
        try {
            const product = await Promise.all(
                newProduct.map((id: { Id: string }) => {
                    return prisma.product.findFirstOrThrow({ where: { id: id.Id } })
                })
            )
            console.log(product)
        } catch (err) {
            throw new NotFoundException("Product with given Id doesn't exist")
        }
    }

    //If images are sent, add them  to cloudinary
    if (files && Array.isArray(files) && files.length > 0) {
        try {
            uploadResult = await Promise.all(
                files.map((img: Express.Multer.File) => {
                    return cloudinary.uploader.upload(img.path, {
                        folder: 'recipes',
                        quality: 'auto',
                        fetch_format: 'auto',
                        crop: 'auto',
                        gravity: 'auto'
                    }
                    )
                })
            )
            console.log("Created new image: ", uploadResult)
        } catch (err) {
            console.log("This error in image upload: ", err)
            throw new BadRequestsException("Error uploading image")
        }
    }

    //update receipe
    try {
        const updatedRecipe = await prisma.recipe.update({
            where: { id: req.params.id },
            data: {
                ...validateRecipe,
                image: {
                    create: uploadResult.map((img: UploadApiResponse) => ({
                        url: img.secure_url
                    })),
                },
                product: {
                    create: newProduct?.map((item: { Id: string }) => ({
                        productId: item.Id, 
                    })),
                }
            }
        })
        return res.status(200).json({ status: 200, success: true, data: { ...updatedRecipe } });
    } catch (err) {
        console.log("This error in image upload: ", err)
        throw new NotFoundException("Error updating recipe: Recipe with given id not found")
    }
}

export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    //delete recipe with given id
    //delete recipeProduct with given recipeId as well
    try{
        await prisma.$transaction(async (tx) => {
            await tx.recipeProducts.deleteMany({ where: { recipeId: req.params.id } })
            const deletedRecipe = await tx.recipe.delete({ where: { id: req.params.id } })
            if (deletedRecipe) {
                res.status(204).json()
                return;
            }
        })
    }catch(err){
        console.log(err);
        throw new NotFoundException("Recipe with given Id not found")
    }
}

export const getAllRecipes = async (req: Request, res: Response, next: NextFunction) => {
    //handle pagination
    const totalRecipe = await prisma.recipe.count();
    let cursorRecipe
    const { limit, cursor } = req.query
    const finalLimit = limit || totalRecipe

    if (cursor) {
        cursorRecipe = await prisma.recipe.findUnique({
            where: { id: cursor as string }
        })
        if (!cursorRecipe) {
            throw new NotFoundException("Recipe id not found")
        }
    }
    const allRecipe = await prisma.recipe.findMany({
        include: {
  
            image: true
        },
        take: +finalLimit!,
        skip: cursor ? 1 : 0,
        cursor: cursorRecipe ? { id: cursorRecipe.id } : undefined,
        orderBy: { id: 'asc' }
    });
    if (allRecipe.length == 0) {
        console.log("This is all the recipes: ", allRecipe)
        throw new NotFoundException("No more Recipes found")
    }
    if (allRecipe.length == 0 && cursor) {
        throw new BadRequestsException("Invalid Cursor sent")
    }

    //handle main get all recipe
    if (allRecipe) {
        console.log("This is the last Recipe: ", allRecipe[allRecipe.length - 1].id, allRecipe.length)
        const nextCursor = (allRecipe.length == finalLimit) ? allRecipe[allRecipe.length - 1].id : null
        res.json({
            success: true, statusCode: 200, data: [...allRecipe], pagination: {
                // currentPage: currentPage += 1,
                totaPages: Math.ceil(totalRecipe / Number(finalLimit)),
                nextPageURL: `${req.protocol}://${req.get('host')}${req.path}api/recipe/?limit=${finalLimit}&cursor=${nextCursor}`
            }
        })
        return;
    }
}

export const getRecipeById = async (req: Request, res: Response, next: NextFunction) => {
    const recipe = await prisma.recipe.findFirstOrThrow({
        where: {
            id: req.params.id
        },
        include: {
            product: true,
            image: true
        }
    })
    if (recipe) {
        res.json({ success: true, status: 200, data: { ...recipe } })
        return;
    }
}

//delete a single recipe image
export const deleteRecipeImageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const image = await prisma.image.findFirstOrThrow({ where: { id: req.params.id } });
        const name = image.url.split('recipes/')[1].split('.')[0];

        const cloudinaryDelete = await cloudinary.uploader.destroy(`recipes/${name.trim()}`);
        if (cloudinaryDelete.result != 'ok') return;

        const deletedImage = await prisma.image.delete({ where: { id: req.params.id } })
        if (deletedImage) {
            res.status(204).json()
            return;
        }
    } catch (err) {
        throw new NotFoundException("Image with given Id not found")
    }

};

export const deleteAllRecipeImage = async (req: Request, res: Response, next: NextFunction) => {
    let recipe: RecipeWithImages;
    //delete all images tied to a particular product
    try {
        recipe = await prisma.recipe.findFirstOrThrow({
            where: { id: req.params.id },
            include: {
                image: true
            }
        })
    } catch (err) {
        throw new NotFoundException("Recipe with given Id not found")
    }

    if (recipe.image.length == 0) {
        throw new BadRequestsException("No images found for this recipe")
    }
    const cloudinaryDestroy = await Promise.all(
        recipe.image.map((img: Image) => {
            const name = img.url.split('recipes/')[1].split('.')[0]
            return cloudinary.uploader.destroy(`recipes/${name.trim()}`)
        })
    )

    if (cloudinaryDestroy[0].result == "ok") {
        const deletedRecipeImage = await prisma.image.deleteMany({ where: { recipeId: req.params.id } })
        if (deletedRecipeImage) {
            res.status(204).json()
            return;
        }
    } else {
        throw new BadRequestsException("Image not found in cloud")
    }


}
