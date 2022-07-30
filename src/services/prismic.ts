import * as Prismic from '@prismicio/client'

export function getPrismicClient() {
    const prismic = Prismic.createClient(
        'hurin-ignews',
        {
            accessToken: process.env.PRISMIC_ACCESS_TOKEN
        }
    )

    return prismic
}