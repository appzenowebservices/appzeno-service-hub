import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
  // Unique cookie names: localhost cookies are port-agnostic, so the default
  // authjs.* names collide with our other apps (e.g. ADDies on :3000) and
  // produce "no matching decryption secret" noise + surprise logouts.
  cookies: {
    sessionToken: { name: "addies.session-token" },
    callbackUrl: { name: "addies.callback-url" },
    csrfToken: { name: "addies.csrf-token" },
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
        scope: { label: "Scope", type: "text" },
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        const identifier = ((credentials?.mobile as string) ?? "").trim();
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        // The dedicated /auth/superadmin page sends scope="superadmin". Only
        // the env-root credential can sign in there; the normal /auth/login
        // page never reaches this branch, so the two doors stay separate.
        const scope = ((credentials?.scope as string) ?? "").trim().toLowerCase();
        if (scope === "superadmin") {
          // ── Env superadmin: DB-independent bootstrap login ──
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
          if (envMobile === "" || !/^\$2[aby]\$/.test(envHash) || identifier !== envMobile) return null;
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

        // Normal login: DB accounts only. The env-root account deliberately
        // has no DB password, so it can never sign in from here.

        // Mobile first (globally unique login key), then email — email may
        // exist on several role accounts, so an email match picks any one of
        // them; mobile login is always unambiguous.
        const user =
          (await db.user.findFirst({ where: { mobile: identifier } })) ??
          (await db.user.findFirst({ where: { email: identifier } }));

        if (!user?.passwordHash) return null;
        if (!user.isActive) return null;
        // Email-gated login per role. Rule (explicit for vendors): a vendor
        // logs in when their email is verified (isVerified === true) — flipped
        // by the Omnipost subscriber.confirmed webhook, never by KYC.
        // Env superadmin above bypasses this — it has no DB row.
        if (!user.isVerified) {
          console.info(
            `[auth] login.blocked {"role":"${user.role}","reason":"unverified"}`,
          );
          return null;
        }
        if (user.role === "VENDOR") {
          console.info(`[auth] login.vendor {"verified":true}`);
        }

        const valid = await compare(password, user.passwordHash as string);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email ?? undefined,
          mobile: user.mobile,
          role: user.role,
          city: user.city,
          mobileVerified: user.mobileVerified,
          avatar: user.avatar,
        } as unknown as { id: string; name: string };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    /**
     * Google sign-in is only allowed for emails that already have an ADDies
     * account (mobile is our primary identity). Unknown emails are sent to
     * registration instead of silently creating an account.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: any) {
      if (account?.provider !== "google") return true;
      const email = (user?.email ?? "").trim();
      if (!email) return false;
      const existing =
        (await db.user.findFirst({ where: { email }, select: { id: true, isActive: true } })) ??
        (await db.user.findFirst({ where: { email: email.toLowerCase() }, select: { id: true, isActive: true } }));
      if (!existing) return `/auth/register?google=1&email=${encodeURIComponent(email)}`;
      return existing.isActive;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account }: any) {
      if (user) {
        // Google returns its own profile — map it onto our DB user so the
        // session carries the same id/role/mobile as password logins.
        if (account?.provider === "google") {
          const email = (user.email ?? "").trim();
          const dbUser =
            (await db.user.findFirst({
              where: { email },
              select: { id: true, fullName: true, mobile: true, role: true, city: true, mobileVerified: true, isVerified: true, avatar: true },
            })) ??
            (await db.user.findFirst({
              where: { email: email.toLowerCase() },
              select: { id: true, fullName: true, mobile: true, role: true, city: true, mobileVerified: true, isVerified: true, avatar: true },
            }));
          if (dbUser) {
            if (!dbUser.isVerified) {
              // Google proved ownership of the email — clear the email gate.
              await db.user.update({ where: { id: dbUser.id }, data: { isVerified: true } });
            }
            // Persist the Google profile picture so every console can show it.
            const googleAvatar = (user.image as string | undefined) ?? null;
            if (googleAvatar && dbUser.avatar !== googleAvatar) {
              await db.user.update({ where: { id: dbUser.id }, data: { avatar: googleAvatar } });
            }
            token.id = dbUser.id;
            token.mobile = dbUser.mobile;
            token.role = dbUser.role;
            token.city = dbUser.city;
            token.mobileVerified = dbUser.mobileVerified;
            token.name = dbUser.fullName;
            token.avatar = googleAvatar ?? dbUser.avatar ?? null;
            token.picture = googleAvatar ?? token.picture;
            return token;
          }
        }
        token.id = user.id ?? token.sub;
        token.mobile = user.mobile;
        token.role = user.role;
        token.city = user.city;
        token.mobileVerified = (user as { mobileVerified?: boolean }).mobileVerified ?? false;
        token.avatar = (user as { avatar?: string | null }).avatar ?? token.avatar ?? null;
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
        session.user.mobileVerified = Boolean(token.mobileVerified);
        session.user.avatar = (token.avatar as string | null | undefined) ?? (token.picture as string | null | undefined) ?? null;
        // Keep NextAuth's own image field in sync for components that use it.
        session.user.image = (token.picture as string | undefined) ?? (token.avatar as string | undefined) ?? null;
      }
      return session;
    },
  },
} satisfies Record<string, unknown>;