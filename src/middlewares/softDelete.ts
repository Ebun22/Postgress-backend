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
            delete({ args, query }) {
                return query({
                    ...args,
                    action: "update",
                    data: { ...args.where, deleted_at: Date.now() }
                })
            },
            deleteMany({ args, query }) {
                return query({
                    ...args,
                    action: "updateMany",
                    data: { ...args.where, deleted_at: Date.now() }
                })
            },
            update({ args, query }) {
                return query({
                    ...args,
                    action: "update",
                    where: args.where,
                    data: { deletedAt: null }
                })
            },
            updateMany({ args, query }) {
                return query({
                    ...args,
                    action: "updateMany",
                    where: args.where,
                    data: { deletedAt: null }
                })
            },
        }
    }
});
console.log('softDelete initialized');