import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connection = postgres(
  'postgresql://docker:docker@localhost:5432/pizzashop',
  { max: 1 }
)
const db = drizzle(connection)
