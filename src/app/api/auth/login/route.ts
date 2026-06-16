import { compare } from "bcryptjs";
import { db } from "~/server/db";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { mobile, password } = body;

    if (!mobile || !password) {
      return new Response(JSON.stringify({ error: "Mobile and password required" }), { status: 400 });
    }

    const user = await db.user.findUnique({ where: { mobile } });

    if (!user || !user.passwordHash) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    return new Response(JSON.stringify({ id: user.id, mobile: user.mobile, role: user.role }), { status: 200 });
  } catch (error: any) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}