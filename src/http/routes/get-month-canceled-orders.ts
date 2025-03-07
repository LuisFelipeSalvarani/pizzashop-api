import dayjs from 'dayjs'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import Elysia, { t } from 'elysia'
import { db } from '../../db/client'
import { orders } from '../../db/schema'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getMonthCanceledOrdersAmount = new Elysia().use(auth).get(
  '/metrics/month-canceled-orders-amount',
  async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const today = dayjs()
    const lastMonth = today.subtract(1, 'month')
    const startOfLastMonth = lastMonth.startOf('month')

    const orderPerMonth = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          eq(orders.status, 'canceled'),
          gte(orders.createdAt, startOfLastMonth.toDate())
        )
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

    const lastMonthWithYear = lastMonth.format('YYYY-MM')
    const currentMonthWithYear = today.format('YYYY-MM')

    const currentMonthOrdersAmount = orderPerMonth.find(ordersPerMonth => {
      return ordersPerMonth.monthWithYear === currentMonthWithYear
    })

    const lastMonthOrdersAmount = orderPerMonth.find(ordersPerMonth => {
      return ordersPerMonth.monthWithYear === lastMonthWithYear
    })

    const diffFromLastMonth =
      currentMonthOrdersAmount && lastMonthOrdersAmount
        ? (currentMonthOrdersAmount.amount * 100) / lastMonthOrdersAmount.amount
        : null

    return {
      amount: currentMonthOrdersAmount?.amount,
      diffFromLastMonth: diffFromLastMonth
        ? Number((diffFromLastMonth - 100).toFixed(2))
        : 0,
    }
  },
  {
    detail: {
      tags: ['Metrics'],
    },
    response: {
      200: t.Object({
        amount: t.MaybeEmpty(t.Number()),
        diffFromLastMonth: t.Number(),
      }),
      400: t.Object({
        message: t.String(),
      }),
    },
  }
)
