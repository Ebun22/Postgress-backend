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
            name:"Euro",
            code:"Euro",
            symbol:"lineicons:euro"
        },
        {
            name:"United Arab Emirates Dirham ",
            code:"AEU",
            symbol:"pepicons-pencil:dollar"
        },
        {
            name:"Naira",
            code:"NGN",
            symbol: "mdi:naira"
        },
        {
            name:"Dollars",
            code:"USD",
            symbol:"pepicons-pencil:dollar"
        }     

    ]
    try {
        const currency = await prisma.currency.createMany({data})
        return res.status(201).json({ status: 201, success: true, data: { ...currency } });
    } catch (err) {
        console.log(err)
        throw new BadRequestsException("Currency wasn't succesfully created")
    }

}

//get currency 
export const getAllCurrency = async (req: Request, res: Response, next: NextFunction) => {
    const currency = await prisma.currency.findMany()
    res.json({ success: true, status: 200, data: [ ...currency ] })
    return;
}

//edit currency x

//delete rate x



//post rate
export const createExchangeRate = async (req: Request, res: Response, next: NextFunction) => {
    const validateExchangeRate = ExchangeRateArraySchema.parse(req.body)
    try {
        const currency = await prisma.exchangeRate.createMany({
            data: validateExchangeRate.map(({ fromCurrencyId, toCurrencyId, price }: any) => ({
                fromCurrencyId: fromCurrencyId as string,
                toCurrencyId: toCurrencyId,
                price: price
            }))
        })
        return res.status(201).json({ status: 201, success: true, data: { ...currency } });
    } catch (err) {
        console.log(err)
        throw new BadRequestsException("Currency wasn't succesfully created")
    }

}
//get rate
//edit rate
//delete rate