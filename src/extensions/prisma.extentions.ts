import { Prisma } from '@prisma/client';

//extension for soft delete
export const softDelete = Prisma.defineExtension({
    model: {
        product: {
            async delete<M, A>(this: M, where: Prisma.Args<M, 'delete'>['where']): Promise<Prisma.Result<M, A, 'update'>> {
                const context = Prisma.getExtensionContext(this);
                console.log("This is the context: ", context)

                return (context as any).update({where, data: {
                    deletedAt: new Date()
                }})
            }
        }
    }
})

//extension for soft delete
export const softDeleteMany = Prisma.defineExtension({
    model: {
        product: {
            async deleteMany<M, A>(this: M, where: Prisma.Args<M, 'deleteMany'>['where']): Promise<Prisma.Result<M, A, 'updateMany'>> {
                const context = Prisma.getExtensionContext(this);
                console.log("This is the context: ", context)

                return (context as any).updateMany({where, data: {
                    deletedAt: new Date()
                }})
            }
        }
    }
})

//extension for filtering  soft delted rows from queries
export const filterOutSoftDelted = Prisma.defineExtension({
    query: {
        product: {
            async $allOperations({ model, operation, args, query }){
                if(
                    operation === 'findUnique' ||
                    operation === 'findFirst' ||
                    operation === 'findMany' 
                ){
                    args.where = { ...args.where, deletedAt: null};
                    return query(args);
                }
                return query(args);
            }
        }
    }
})