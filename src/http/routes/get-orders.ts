import { and, count, desc, eq, getTableColumns, ilike, sql } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-typebox'
import { Elysia, t } from 'elysia'
import { db } from '../../db/client'
import { orders, users } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getOrders = new Elysia().use(auth).get(
  '/orders',
  async ({ getCurrentUser, query }) => {
    const { restaurantId } = await getCurrentUser()
    const { customerName, orderId, status, pageIndex } = query

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const orderTableColumns = getTableColumns(orders)

    const baseQuery = db
      .select({
        ...orderTableColumns,
        customerName: users.name,
      })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customerId))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined
        )
      )

    const [[{ count: amountOfOrders }], allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as('baseQuery')),
      db
        .select()
        .from(baseQuery.as('baseQuery'))
        .offset(pageIndex * 10)
        .limit(10)
        .orderBy(fields => {
          return [
            sql`CASE ${fields.status}
              WHEN 'pending' THEN 1
              WHEN 'processing' THEN 2
              WHEN 'delivering' THEN 3
              WHEN 'delivered' THEN 4
              WHEN 'canceled' THEN 99
            END`,
            desc(fields.createdAt),
          ]
        }),
    ])

    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: amountOfOrders,
      },
    }
  },
  {
    detail: {
      tags: ['Orders'],
    },
    query: t.Object({
      customerName: t.Optional(t.String()),
      orderId: t.Optional(t.String()),
      status: t.Optional(createSelectSchema(orders).properties.status),
      pageIndex: t.Numeric({ minimum: 0 }),
    }),
    response: {
      200: t.Object({
        orders: t.Array(
          t.Object({
            customerName: t.String(),
            id: t.String({ format: 'uuid' }),
            customerId: t.Nullable(t.String({ format: 'uuid' })),
            restaurantId: t.String({ format: 'uuid' }),
            status: t.UnionEnum([
              'pending',
              'processing',
              'delivering',
              'delivered',
              'canceled',
            ]),
            totalInCents: t.Number(),
            createdAt: t.Date(t.String({ format: 'date-time' })),
          })
        ),
        meta: t.Object({
          pageIndex: t.Number(),
          perPage: t.Number(),
          totalCount: t.Number(),
        }),
      }),
    },
  }
)
