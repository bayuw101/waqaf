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
      const publicPaths = ["/", "/privacy", "/terms", "/login", "/public"];
      return publicPaths.includes(request.nextUrl.pathname) || !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
