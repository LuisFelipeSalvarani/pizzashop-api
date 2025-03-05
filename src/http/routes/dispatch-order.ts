import { eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db } from '../../db/client'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const dispatchOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/dispatch',
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq, and }) {
        return and(
          eq(fields.id, orderId),
          eq(fields.restaurantId, restaurantId)
        )
      },
    })

    if (!order) {
      set.status = 400

      return { message: 'Order not found.' }
    }

    if (order.status !== 'processing') {
      set.status = 400

      return {
        message:
          'You cannot dispatch orders that are not in "processing" status.',
      }
    }

    await db
      .update(orders)
      .set({ status: 'delivering' })
      .where(eq(orders.id, orderId))
  },
  {
    detail: {
      tags: ['Orders'],
    },
    params: t.Object({
      orderId: t.String(),
    }),
    response: {
      200: t.Undefined(),
      400: t.Object({
        message: t.String()
      })
    }
  }
)
