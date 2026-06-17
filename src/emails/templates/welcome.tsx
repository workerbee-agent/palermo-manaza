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

interface WelcomeEmailProps {
  firstName: string
  email: string
  password: string
}

export default function WelcomeEmail({
  firstName,
  email,
  password,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a Palermo Manaza</Preview>
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
              🏠 Bienvenido a Palermo Manaza
            </Text>
            <Text style={{ fontSize: "16px", color: "#333333" }}>
              Hola <strong>{firstName}</strong>,
            </Text>
            <Text style={{ fontSize: "16px", color: "#333333" }}>
              Tu cuenta ha sido creada exitosamente. Estos son tus datos de acceso:
            </Text>
            <Section
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                padding: "20px",
                margin: "20px 0",
              }}
            >
              <Text style={{ fontSize: "14px", margin: "0" }}>
                <strong>Correo:</strong> {email}
              </Text>
              <Text style={{ fontSize: "14px", margin: "10px 0 0" }}>
                <strong>Contraseña:</strong> {password}
              </Text>
            </Section>
            <Button
              href="https://palermo-manaza.com/auth/login"
              style={{
                backgroundColor: "#10b981",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-block",
                margin: "20px 0",
              }}
            >
              Iniciar Sesión
            </Button>
            <Text style={{ fontSize: "14px", color: "#666666" }}>
              Por favor, cambia tu contraseña después de iniciar sesión por primera vez.
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