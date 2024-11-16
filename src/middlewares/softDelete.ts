import { Prisma } from '@prisma/client'

console.log('Accessing Prisma in softDelete');

export const SoftDelete = Prisma.defineExtension({
    query: {
        product: {
            findMany({ args, query }) {
                return query({
                    ...args,
                    where: { ...args.where, deleted_at: null }
                })
            },
            findFirst({ args, query }) {
                return query({
                    ...args,
                    where: { ...args.where, deleted_at: null }
                })
            },
           async delete({ args, query, operation}) {
               console.log("THIS I STHE ARGS: ", args, "THIS IS TEH QUERYS: ", query, operation )
            //    args = {
            //     args.action = {}
            //    }
            //     return query({
            //         ...args, // Keep existing arguments
            //         data: {
            //             deleted_at: new Date(), // Soft delete by setting the `deleted_at` timestamp
            //         },
            //     } as Prisma.ProductUpdateArgs); // Explicitly cast to `ProductUpdateArgs`
            },
            deleteMany({ args, query }) {
                return query({
                    ...args,
                    where: args.where,
                    data: {deleted_at: Date.now() }
                })
            },
            update({ args, query }) {
                return query({
                    ...args,
                    where: args.where,
                    data: { deletedAt: null }
                })
            },
            updateMany({ args, query }) {
                return query({
                    ...args,
                    where: args.where,
                    data: { deletedAt: null }
                })
            },
        }
    }
});
console.log('softDelete initialized');