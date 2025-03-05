import { Elysia, t } from 'elysia'
import { auth } from '../auth'

export const sighOut = new Elysia().use(auth).post(
  '/sign-out',
  async ({ signOut: internalSignOut }) => {
    internalSignOut()
  },
  {
    detail: {
      tags: ['Auth'],
    },
    response: {
      200: t.Void(),
    },
  }
)
