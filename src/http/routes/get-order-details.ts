import { Elysia, t } from 'elysia'
import { db } from '../../db/client'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getOrderDetails = new Elysia().use(auth).get(
  '/orders/:orderId',
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      columns: {
        id: true,
        status: true,
        totalInCents: true,
        createdAt: true,
      },
      with: {
        customer: {
          columns: {
            name: true,
            phone: true,
            email: true,
          },
        },
        orderItens: {
          columns: {
            id: true,
            priceInCents: true,
            quantity: true,
          },
          with: {
            product: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
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

    return order
  },
  {
    detail: {
      tags: ['Orders'],
    },
    params: t.Object({
      orderId: t.String(),
    }),
    response: {
      200: t.Object({
        id: t.String({ format: 'uuid' }),
        status: t.UnionEnum([
          'pending',
          'processing',
          'delivering',
          'delivered',
          'canceled',
        ]),
        totalInCents: t.Number(),
        createdAt: t.Date(t.String({ format: 'date-time' })),
        customer: t.Nullable(
          t.Object({
            email: t.String({ format: 'email' }),
            name: t.String(),
            phone: t.Nullable(t.String()),
          })
        ),
        orderItens: t.Array(
          t.Object({
            id: t.String({ format: 'uuid' }),
            priceInCents: t.Number(),
            quantity: t.Number(),
            product: t.Nullable(
              t.Object({
                name: t.String(),
              })
            ),
          })
        ),
      }),
      400: t.Object({
        message: t.String(),
      }),
    },
  }
)
