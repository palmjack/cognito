import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  // type DefaultSession,
} from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { env } from "~/env.mjs";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       // ...other properties
//       // role: UserRole;
//     } & DefaultSession["user"];
//   }

//   // interface User {
//   //   // ...other properties
//   //   // role: UserRole;
//   // }
// }

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

//https://alab.auth.eu-west-3.amazoncognito.com/logout?client_id=7q7q7q7q7q7q7q7q7q7q7q7q7q&logout_uri=http://localhost:3000
export const authOptions: NextAuthOptions = {
  callbacks: {
    redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      // This is the beef:
      if (url === "signOut") {
        const ssoLogoutUrl = `${env.COGNITO_LOGOUT_URL}${env.COGNITO_CLIENT_ID}&logout_uri=${env.NEXTAUTH_URL}`;
        return ssoLogoutUrl;
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
  },

  // events: {
  //   async signOut() {
  //     await fetch(
  //       `https://alab.auth.eu-west-3.amazoncognito.com/logout?client_id=${env.COGNITO_CLIENT_ID}&logout_uri=http://localhost:3000`
  //     );
  //   },
  // },
  // callbacks: {
  //   session({ session, user }) {
  //     if (session.user) {
  //       session.user.id = user.id;
  //       // session.user.role = user.role; <-- put other properties on the session here
  //     }
  //     return session;
  //   },
  // },
  providers: [
    CognitoProvider({
      clientId: env.COGNITO_CLIENT_ID,
      clientSecret: env.COGNITO_CLIENT_SECRET,
      issuer: env.COGNITO_ISSUER,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
