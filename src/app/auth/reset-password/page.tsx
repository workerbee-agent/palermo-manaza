import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email || ""
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-gray-100 p-4">
      <ResetPasswordForm email={email} />
    </div>
  )
}