import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export default {
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized: async ({ auth, request }) => {
      const { pathname } = request.nextUrl;
      if (
        [
          "/",
          "/privacy",
          "/terms",
          "/login",
          "/public",
          "/onboarding",
        ].includes(pathname)
      )
        return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
