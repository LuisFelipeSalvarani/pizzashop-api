import { Elysia, t } from 'elysia'
import { db } from '../../db/client'
import { auth } from '../auth'

export const getManagedRestaurant = new Elysia().use(auth).get(
  '/managed-restaurant',
  async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new Error('User is not a manager.')
    }

    const managedRestaurant = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, restaurantId)
      },
    })

    if (!managedRestaurant) {
      throw new Error('Restaurant not found.')
    }

    return managedRestaurant
  },
  {
    detail: {
      tags: ['Restaurants'],
    },
    response: {
      200: t.Object({
        name: t.String(),
        description: t.Nullable(t.String()),
        id: t.String({ format: 'uuid' }),
        createdAt: t.Date(t.String({ format: 'date-time' })),
        updatedAt: t.Date(t.String({ format: 'date-time' })),
        managerId: t.Nullable(t.String({ format: 'uuid' })),
      }),
    },
  }
)
