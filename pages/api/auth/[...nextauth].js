import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { createServerAPIKit } from "utils/APIKit";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: ["openid", "email", "profile"].join(" "),
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account?.provider === "google") {
        token = await google_jwt(account);
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session = {
        ...session,
        token_key: token?.token_key,
        user: token?.user,
      };
      console.log("session callback", session);
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      const APIKit = await createServerAPIKit();
      try {
        await APIKit.get("/authentication/signout/", {
          headers: {
            Authorization: `Token ${token?.token_key}`,
          },
        });
      } catch (e) {}
    },
  },
};

export default NextAuth(authOptions);

const google_jwt = async (account) => {
  const req_scopes = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].sort();
  const { scope, access_token, refresh_token, expires_at } = account;
  const scopes = scope.split(" ");
  scopes.sort();

  if (JSON.stringify(req_scopes) === JSON.stringify(scopes)) {
    const payload = { access_token, refresh_token, expires_at };
    const url = "/authentication/signin/";
    const APIKit = await createServerAPIKit();
    try {
      const response = await APIKit.post(url, payload);
      if (response.status === 200) {
        const token = response.data.payload;
        return token;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};
