import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "palermo-manaza-secret-key-change-in-production"
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(
  userId: string,
  role: string
): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{
  userId: string
  role: string
} | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as { userId: string; role: string }
  } catch {
    return null
  }
}

export async function createOtp(
  userId: string,
  type: "RESET_PASSWORD" | "VERIFY_EMAIL"
): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await prisma.otpCode.upsert({
    where: { userId },
    update: { code, type, expiresAt, createdAt: new Date() },
    create: { userId, code, type, expiresAt },
  })

  return code
}

export async function verifyOtp(
  userId: string,
  code: string,
  type: "RESET_PASSWORD" | "VERIFY_EMAIL"
): Promise<boolean> {
  const otp = await prisma.otpCode.findUnique({
    where: { userId },
  })

  if (!otp || otp.type !== type) return false
  if (otp.expiresAt < new Date()) return false
  if (otp.usedAt) return false
  if (otp.code !== code) return false

  await prisma.otpCode.update({
    where: { userId },
    update: { usedAt: new Date() },
  })

  return true
}

export function hasPermission(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole)
}

export async function auth() {
  // This is a simplified auth function for the server components
  // In production, you would get the token from cookies or headers
  return null
}