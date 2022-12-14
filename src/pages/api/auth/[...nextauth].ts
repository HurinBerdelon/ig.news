import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { query as q } from 'faunadb'

import { fauna } from '../../../services/fauna'

export default NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            // userinfo: 'read:user',
        })
    ],
    // jwt: {
    //     secret: process.env.SIGNING_KEY,
    // },
    secret: 'hasudhaudhaushd4154asf',
    callbacks: {
        async session({ session }) {
            try {

                const userActiveSubscription = await fauna.query(
                    q.Get(
                        q.Intersection([
                            q.Match(
                                q.Index('subscription_by_user_ref'),
                                q.Select(
                                    'ref',
                                    q.Get(
                                        q.Match(
                                            q.Index('user_by_email'),
                                            q.Casefold(session.user.email)
                                        )
                                    )
                                )
                            ),
                            q.Match(
                                q.Index('subscription_by_status'),
                                'active'
                            )
                        ])
                    )
                )
                return {
                    ...session,
                    activeSubscription: userActiveSubscription
                }
            } catch {
                return {
                    ...session,
                    activeSubscription: null
                }
            }


        },
        async signIn(data) {

            const { user } = data

            try {
                await fauna.query(
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(
                                    q.Index('user_by_email'),
                                    q.Casefold(user.email)
                                )
                            )
                        ),
                        q.Create(
                            q.Collection('users'),
                            { data: { email: user.email } }
                        ),
                        q.Get(
                            q.Match(
                                q.Index('user_by_email'),
                                q.Casefold(user.email)
                            )
                        )
                    ),
                )
                return true

            } catch {
                return false
            }
        }
    }
})