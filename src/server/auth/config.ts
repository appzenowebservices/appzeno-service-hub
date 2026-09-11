import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "~/server/db";

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

        const user = await db.user.findFirst({
          where: {
            OR: [{ mobile: identifier }, { email: identifier }],
          },
        });

        if (!user?.passwordHash) return null;
        if (!user.isActive) return null;

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