import { Elysia, t } from 'elysia'
import { db } from '../../db/client'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'

export const getProfile = new Elysia().use(auth).get(
  '/me',
  async ({ getCurrentUser }) => {
    const { userId } = await getCurrentUser()

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, userId)
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    return user
  },
  {
    detail: {
      tags: ['Profile'],
    },
    response: {
      200: t.Object({
        name: t.String(),
        id: t.String({ format: 'uuid' }),
        email: t.String({ format: 'email' }),
        phone: t.Nullable(t.String()),
        role: t.UnionEnum(['manager', 'customer']),
        createdAt: t.Date(t.String({ format: 'date-time' })),
        updatedAt: t.Date(t.String({ format: 'date-time' })),
      }),
    },
  }
)
