import { render } from "@react-email/render"
import WelcomeEmail from "./templates/welcome"
import ForgotPasswordEmail from "./templates/forgot-password"

export async function sendEmail(
  to: string,
  subject: string,
  template: "welcome" | "forgot-password",
  data: Record<string, any>
) {
  const { Resend } = await import("resend")
  
  const resend = new Resend(process.env.RESEND_API_KEY)

  let html = ""
  let emailComponent: React.ReactElement

  switch (template) {
    case "welcome":
      emailComponent = <WelcomeEmail {...data} />
      break
    case "forgot-password":
      emailComponent = <ForgotPasswordEmail {...data} />
      break
    default:
      throw new Error("Unknown template")
  }

  html = await render(emailComponent)

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Palermo Manaza <noreply@palermo-manaza.com>",
    to,
    subject,
    html,
  })

  return result
}