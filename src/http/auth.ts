import jwt from '@elysiajs/jwt'
import { Elysia, type Static, t } from 'elysia'
import { env } from '../env'
import { UnauthorizedError } from './errors/unauthorized-error'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { code, message: error.message }
      }
    }
  })
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
          throw new UnauthorizedError()
        }

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },
    }
  })
