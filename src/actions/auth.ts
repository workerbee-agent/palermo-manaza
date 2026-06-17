"use server"

import { prisma } from "@/lib/db"
import { hashPassword, createToken, createOtp } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string
  const role = (formData.get("role") as string) || "RESIDENT"

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "El correo ya está registrado" }
  }

  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role as any,
    },
  })

  // Send welcome email
  try {
    await sendEmail(email, "Bienvenido a Palermo Manaza", "welcome", {
      firstName,
      email,
      password,
    })
  } catch (e) {
    console.error("Failed to send welcome email:", e)
  }

  const token = await createToken(user.id, user.role)

  revalidatePath("/dashboard")
  redirect(`/dashboard?token=${token}`)
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = await prisma.user.findUnique({
    where: { email },
    include: { residence: true },
  })

  if (!user) {
    return { error: "Credenciales inválidas" }
  }

  const { verifyPassword } = await import("@/lib/auth")
  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return { error: "Credenciales inválidas" }
  }

  if (!user.isActive) {
    return { error: "Usuario inactivo. Contacte al administrador." }
  }

  const token = await createToken(user.id, user.role)

  revalidatePath("/dashboard")
  redirect(`/dashboard?token=${token}`)
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Don't reveal if email exists
    return { success: true }
  }

  const otpCode = await createOtp(user.id, "RESET_PASSWORD")

  try {
    await sendEmail(email, "Restablecer tu contraseña", "forgot-password", {
      firstName: user.firstName,
      otpCode,
    })
  } catch (e) {
    console.error("Failed to send OTP email:", e)
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string
  const otp = formData.get("otp") as string
  const newPassword = formData.get("newPassword") as string

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: "Usuario no encontrado" }
  }

  const { verifyOtp } = await import("@/lib/auth")
  const isValid = await verifyOtp(user.id, otp, "RESET_PASSWORD")

  if (!isValid) {
    return { error: "Código OTP inválido o expirado" }
  }

  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  return { success: true }
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { error: "Usuario no encontrado" }
  }

  const { verifyPassword } = await import("@/lib/auth")
  const isValid = await verifyPassword(oldPassword, user.password)

  if (!isValid) {
    return { error: "Contraseña actual incorrecta" }
  }

  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return { success: true }
}