import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
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
  ...authConfig,
  providers: [
    Credentials({
      id: "passkey",
      credentials: { token: { type: "text" } },
      async authorize(credentials) {
        const { verifyPasskeyToken } = await import("@/lib/passkey-token");
        const userId = verifyPasskeyToken(credentials.token as string);
        if (!userId || !process.env.DATABASE_URL) return null;

        const { db } = await import("@/lib/prisma");
        const dbUser = await db.user.findUnique({ where: { id: userId } });
        if (!dbUser) return null;

        const membership = await db.membership.findFirst({
          where: { userId: dbUser.id },
          orderBy: { createdAt: "asc" },
        });

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: (membership?.role ?? "PLAYER") as "ADMIN" | "PLAYER",
          activeTeamId: membership?.turmaId ?? "",
        };
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        if (process.env.DATABASE_URL) {
          const { db } = await import("@/lib/prisma");
          const { compare } = await import("bcryptjs");

          const dbUser = await db.user.findUnique({ where: { email: parsed.data.email } });

          if (dbUser) {
            const valid = await compare(parsed.data.password, dbUser.passwordHash);
            if (!valid) return null;

            const membership = await db.membership.findFirst({
              where: { userId: dbUser.id },
              orderBy: { createdAt: "asc" },
            });

            return {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: (membership?.role ?? "PLAYER") as "ADMIN" | "PLAYER",
              activeTeamId: membership?.turmaId ?? "",
            };
          }
          // user not in DB → fall through to demo store
        }

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
