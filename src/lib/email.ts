import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import WelcomeEmail from "../emails/templates/welcome"
import ForgotPasswordEmail from "../emails/templates/forgot-password"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.urbeecode.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "sales@urbeecode.com",
    pass: process.env.SMTP_PASS || "30,iAlicKlEYspIPte,?",
  },
})

export async function sendEmail(
  to: string,
  subject: string,
  template: "welcome" | "forgot-password",
  data: Record<string, any>
) {
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

  const result = await transporter.sendMail({
    from: process.env.SMTP_FROM || "Palermo Manaza <noreply@palermo-manaza.com>",
    to,
    subject,
    html,
  })

  return result
}