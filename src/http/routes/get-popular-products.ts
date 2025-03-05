import { desc, eq, sum } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db } from '../../db/client'
import { orderItens, orders, products } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getPopularProducts = new Elysia().use(auth).get(
  '/metrics/popular-products',
  async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const popularProducts = await db
      .select({
        product: products.name,
        amount: sum(orderItens.quantity).mapWith(Number),
      })
      .from(orderItens)
      .leftJoin(orders, eq(orderItens.orderId, orders.id))
      .leftJoin(products, eq(orderItens.productId, products.id))
      .where(eq(orders.restaurantId, restaurantId))
      .groupBy(products.name)
      .orderBy(fields => {
        return desc(fields.amount)
      })
      .limit(5)

    return popularProducts
  },
  {
    detail: {
      tags: ['Metrics'],
    },
    response: {
      200: t.Array(
        t.Object({
          product: t.Nullable(t.String()),
          amount: t.Number(),
        })
      ),
    },
  }
)
