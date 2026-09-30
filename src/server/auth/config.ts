import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "~/server/db";

if (process.env.SUPERADMIN_MOBILE && process.env.SUPERADMIN_PASSWORD_HASH_B64) {
  console.log("[auth] env superadmin login enabled");
} else {
  console.warn("[auth] SUPERADMIN_MOBILE / SUPERADMIN_PASSWORD_HASH_B64 not set — env superadmin login disabled");
}

export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        const identifier = ((credentials?.mobile as string) ?? "").trim();
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        // ── Env superadmin: DB-independent bootstrap login (checked first) ──
        // Mobile + base64(bcrypt hash) live only in `.env` (gitignored), never in code/DB.
        // Base64 because a raw bcrypt hash contains `$`, which Next.js .env
        // expansion would silently swallow.
        const envMobile = (process.env.SUPERADMIN_MOBILE ?? "").trim();
        let envHash = "";
        try {
          envHash = Buffer.from(process.env.SUPERADMIN_PASSWORD_HASH_B64 ?? "", "base64").toString("utf8");
        } catch {
          envHash = "";
        }
        if (envMobile !== "" && /^\$2[aby]\$/.test(envHash) && identifier === envMobile) {
          const valid = await compare(password, envHash);
          if (!valid) return null;
          return {
            id: "env-superadmin",
            name: "Super Administrator",
            email: undefined,
            mobile: envMobile,
            role: "ADMIN",
            city: "Lucknow",
          } as unknown as { id: string; name: string };
        }

        // Mobile first (globally unique login key), then email — email may
        // exist on several role accounts, so an email match picks any one of
        // them; mobile login is always unambiguous.
        const user =
          (await db.user.findFirst({ where: { mobile: identifier } })) ??
          (await db.user.findFirst({ where: { email: identifier } }));

        if (!user?.passwordHash) return null;
        if (!user.isActive) return null;
        // Email-gated login: accounts stay locked until the owner confirms
        // their email (Omnipost event flips isVerified). Env superadmin above
        // bypasses this — it has no DB row.
        if (!user.isVerified) return null;

        const valid = await compare(password, user.passwordHash as string);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email ?? undefined,
          mobile: user.mobile,
          role: user.role,
          city: user.city,
        } as unknown as { id: string; name: string };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.mobile = user.mobile;
        token.role = user.role;
        token.city = user.city;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.mobile = token.mobile as string;
        session.user.role = token.role as string;
        session.user.city = token.city as string;
      }
      return session;
    },
  },
} satisfies Record<string, unknown>;