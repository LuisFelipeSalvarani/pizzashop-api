import jwt from '@elysiajs/jwt'
import { Elysia, type Static, t } from 'elysia'
import { env } from '../env'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    })
  )
  .derive({ as: 'scoped' }, ({ jwt: { sign, verify }, cookie: { auth } }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const jwt = await sign(payload)

        auth.value = jwt
        auth.httpOnly = true
        auth.maxAge = 60 * 60 * 24 * 7 // 7 days
        auth.path = '/'
      },

      signOut: async () => {
        auth.remove()
      },

      getCurrentUser: async () => {
        const payload = await verify(auth.value)

        if (!payload) {
          throw new Error('Unauthorized.')
        }

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
