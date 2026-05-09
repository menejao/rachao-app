import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getInvite, acceptInvite } from "@/lib/store";

async function getInviteData(token: string) {
  if (process.env.DATABASE_URL) {
    const { db } = await import("@/lib/prisma");
    const invite = await db.invite.findUnique({
      where: { token },
      include: { turma: true },
    });
    if (!invite || invite.usedAt || invite.expiresAt < new Date()) return null;
    return {
      id: invite.id,
      token: invite.token,
      turmaNome: invite.turma.nome,
      turmaId: invite.turmaId,
      role: invite.role as "ADMIN" | "PLAYER",
    };
  }
  return getInvite(token);
}

async function handleAcceptDB(token: string, userId: string) {
  "use server";
  if (process.env.DATABASE_URL) {
    const { db } = await import("@/lib/prisma");
    const invite = await db.invite.findUnique({ where: { token } });
    if (!invite || invite.usedAt) return;
    await db.membership.upsert({
      where: { userId_turmaId: { userId, turmaId: invite.turmaId } },
      create: { userId, turmaId: invite.turmaId, role: invite.role },
      update: { role: invite.role },
    });
    await db.invite.update({ where: { token }, data: { usedAt: new Date() } });
  } else {
    acceptInvite(token, userId);
  }
  redirect("/");
}

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInviteData(token);

  if (!invite) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[28px] bg-rose-500/10 text-3xl">
            ✗
          </div>
          <h1 className="text-xl font-bold text-white">Convite inválido</h1>
          <p className="mt-2 text-sm text-stone-400">
            Este link expirou ou já foi usado.
          </p>
          <Link
            href={"/" as never}
            className="mt-6 inline-block rounded-2xl bg-white/[0.06] px-6 py-3 text-sm text-white hover:bg-white/10"
          >
            Ir para o início
          </Link>
        </div>
      </main>
    );
  }

  const session = await auth();

  async function handleAccept() {
    "use server";
    if (!session) return;
    await handleAcceptDB(token, session.user.id);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl font-black text-[#07110a] shadow-[0_20px_60px_rgba(34,197,94,0.35)]">
            R
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Rachão</p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-stone-500">
            Convite para
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">{invite.turmaNome}</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1">
            <span className="text-xs font-medium text-emerald-300">
              {invite.role === "ADMIN" ? "Organizador" : "Jogador"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          {session ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-stone-400">
                Entrando como{" "}
                <span className="text-white">{session.user.name}</span>
              </p>
              <form action={handleAccept}>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95"
                >
                  Aceitar convite e entrar
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                href={`/signup?invite=${token}` as never}
                className="block w-full rounded-2xl bg-emerald-500 px-4 py-3.5 text-center text-sm font-semibold text-[#07110a] transition hover:bg-emerald-400 active:scale-95"
              >
                Criar conta para entrar
              </Link>
              <Link
                href={`/login?from=/convite/${token}` as never}
                className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-center text-sm text-white transition hover:bg-white/[0.08] active:scale-95"
              >
                Já tenho conta — Entrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
