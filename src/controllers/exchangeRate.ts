import { Request, Response, NextFunction } from "express";
import { prisma } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestsException } from "../exceptions/bad-request";
import { ExchangeRateArraySchema } from "../schema/exchangeRate";
import { ExchangeRate } from "@prisma/client";


//post currency 
export const addCurrency = async (req: Request, res: Response, next: NextFunction) => {
    const data = [
        {
            name: "Euro",
            code: "Euro",
            symbol: "lineicons:euro"
        },
        {
            name: "United Arab Emirates Dirham ",
            code: "AEU",
            symbol: "pepicons-pencil:dollar"
        },
        {
            name: "Naira",
            code: "NGN",
            symbol: "mdi:naira"
        },
        {
            name: "Dollars",
            code: "USD",
            symbol: "pepicons-pencil:dollar"
        }

    ]
    try {
        const currency = await prisma.currency.createMany({ data })
        return res.status(201).json({ status: 201, success: true, data: { ...currency } });
    } catch (err) {
        console.log(err)
        throw new BadRequestsException("Currency wasn't succesfully created")
    }

}

//get currency 
export const getAllCurrency = async (req: Request, res: Response, next: NextFunction) => {
    const currency = await prisma.currency.findMany()
    res.json({ success: true, status: 200, data: [...currency] })
    return;
}

//edit currency x

//delete rate x



//post rate
export const createExchangeRate = async (req: Request, res: Response, next: NextFunction) => {
    const validateExchangeRate = ExchangeRateArraySchema.parse(req.body)
    try {
        const currency = await prisma.exchangeRate.createMany({
            data: validateExchangeRate.map(({ fromCurrencyId, toCurrencyId, rate }: any) => ({
                fromCurrencyId,
                toCurrencyId,
                rate
            }))
        })
        return res.status(201).json({ status: 201, success: true, data: { ...currency } });
    } catch (err) {
        console.log(err)
        throw new BadRequestsException("Currency wasn't succesfully created")
    }

}

//get rate
export const getExchangeRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rate = await prisma.exchangeRate.findMany({
            select: {
                id: true,
                fromCurrency: {
                    select: {
                        name: true,
                        code: true,
                    }
                },
                toCurrency: {
                    select: {
                        name: true,
                        code: true,  
                    }
                },
                rate: true,
            }
        })

        return res.status(201).json({ status: 201, success: true, data: [...rate] });
    } catch (err) {
        console.log(err)
        throw new BadRequestsException("No Existing Rate")
    }
}

//edit rate
export const editExchangeRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rate = await prisma.exchangeRate.upsert({
            where: {id: req.params.id},
            update: {
                rate: req.body.rate
            },
            create: {
                fromCurrencyId: req.body.fromCurrencyId,
                toCurrencyId: req.body.toCurrencyId,
                rate: req.body.rate
            },
            select: {
                id: true,
                fromCurrency: {
                    select: {
                        name: true,
                        code: true,
                    }
                },
                toCurrency: {
                    select: {
                        name: true,
                        code: true,  
                    }
                },
                rate: true,
            }
        })

        return res.status(201).json({ status: 201, success: true, data: { ...rate } });
    } catch (err) {
        console.log(err)
        throw new BadRequestsException("No Existing Rate")
    }
}

//delete rate