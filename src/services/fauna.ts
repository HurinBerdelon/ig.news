import { Client } from 'faunadb'

export const fauna = new Client({
    secret: process.env.FAUNDA_DB_KEY
})