import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
} from "@react-email/components"

interface ForgotPasswordEmailProps {
  firstName: string
  otpCode: string
}

export default function ForgotPasswordEmail({
  firstName,
  otpCode,
}: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Restablecer tu contraseña</Preview>
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "sans-serif" }}>
        <Container style={{ padding: "40px 0" }}>
          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "40px",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            <Img
              src="https://palermo-manaza.com/logo.png"
              width="120"
              height="120"
              alt="Palermo Manaza"
              style={{ margin: "0 auto 20px", display: "block" }}
            />
            <Text style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
              🔐 Restablecer Contraseña
            </Text>
            <Text style={{ fontSize: "16px", color: "#333333" }}>
              Hola <strong>{firstName}</strong>,
            </Text>
            <Text style={{ fontSize: "16px", color: "#333333" }}>
              Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código OTP:
            </Text>
            <Section
              style={{
                backgroundColor: "#10b981",
                borderRadius: "8px",
                padding: "20px",
                margin: "20px 0",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  letterSpacing: "8px",
                  margin: "0",
                }}
              >
                {otpCode}
              </Text>
            </Section>
            <Text style={{ fontSize: "14px", color: "#666666" }}>
              Este código expirará en <strong>15 minutos</strong>.
            </Text>
            <Text style={{ fontSize: "14px", color: "#666666", marginTop: "20px" }}>
              Si no solicitaste este cambio, puedes ignorar este correo.
            </Text>
          </Section>
          <Text style={{ textAlign: "center", fontSize: "12px", color: "#999999", marginTop: "20px" }}>
            © 2026 Conjunto Palermo Manaza. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}