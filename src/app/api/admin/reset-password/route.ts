import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "admin@csgoscout.com",
  "andersonchagas45@gmail.com",
];

function isAdmin(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email);
}

function generateTempPassword(length = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ success: false, error: "Acesso negado" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json(
      { success: false, error: "Informe o email do usuário" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  const tempPassword = generateTempPassword();
  const hashed = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({
    success: true,
    tempPassword,
  });
}
