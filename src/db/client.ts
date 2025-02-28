import postgres from 'postgres'

import { drizzle } from 'drizzle-orm/postgres-js'
import { env } from '../env'

const connection = postgres(env.DATABASE_URL, { max: 1 })
const db = drizzle(connection)
