import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "~/server/db";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.mobile?.trim();
        const password = credentials?.password;
        if (!identifier || !password) return null;

        const user = await db.user.findFirst({
          where: {
            OR: [{ mobile: identifier }, { email: identifier }],
          },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.fullName, email: user.email, mobile: user.mobile, role: user.role };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.mobile = user.mobile;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.mobile = token.mobile as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};