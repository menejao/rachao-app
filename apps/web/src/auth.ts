import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { findUserByCredentials } from "@/lib/store";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "PLAYER";
      activeTeamId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "PLAYER";
    activeTeamId: string;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "dev-secret-changeme-in-production",
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.activeTeamId = user.activeTeamId;
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
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = findUserByCredentials(parsed.data.email, parsed.data.password);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          activeTeamId: user.activeTeamId,
        };
      },
    }),
  ],
});
