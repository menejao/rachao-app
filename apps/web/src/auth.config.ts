import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? "dev-secret-changeme-in-production",
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.activeTeamId = (user as { activeTeamId?: string }).activeTeamId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "ADMIN" | "PLAYER";
      session.user.activeTeamId = token.activeTeamId as string;
      return session;
    },
  },
};
