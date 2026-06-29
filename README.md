# Palermo Manaza - Sistema de Gestión de Conjunto Residencial

Sistema de administración para el Conjunto Residencial Palermo Manaza, construido con Next.js, Prisma y shadcn/ui.

## 🚀 Características

- **Autenticación** con JWT y código OTP por correo
- **Roles**: Administrador, Presidente, Tesorera, Secretaria, Residente
- **Gestión de Residencias**: Casas y departamentos (estado: habitada, abandonada, arrendada, anticresis)
- **Multas**: Creación, pagos, aprobación por presidencia
- **Email**: SMTP con nodemailer
- **Propietarios**: Solteros o casados (concónyuge)
- **Arrendatarios**: Registro independiente
- **Deudas**: Generación automática por año/mes
- **Pagos**: Registro manual + pagos en línea (Stripe/Payku)
- **Convenios**: Creación y aprobación (presidente)
- **Certificados**: Expensas, deuda, propiedad, arrendatario

## 🛠️ Tech Stack

- Next.js 15 (App Router)
- Prisma + PostgreSQL
- shadcn/ui + Tailwind CSS
- JWT + OTP
- nodemailer (SMTP)
- Stripe / Payku (Pagos en línea)

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Generar cliente Prisma
npx prisma generate

# 4. Crear base de datos
npx prisma db push

# 5. Poblar datos iniciales (seeds)
npm run db:seed

# 6. Iniciar servidor
npm run dev
```

## 🌱 Seeds (Datos de Prueba)

El seed crea usuarios, roles, residencias y deudas de ejemplo:

```bash
# Ejecutar seeds
npm run db:seed

# Reset completo (borra todo y vuelve a seed)
npm run db:reset && npm run db:seed
```

### Credenciales por defecto

| Rol | Email | Password |
|----|-------|----------|
| Admin | admin@palermo.com | Password123! |
| Presidente | presidente@palermo.com | Password123! |
| Tesorero | tesorero@palermo.com | Password123! |
| Residente | resident1@palermo.com | Password123! |

## 💳 Pagos en Línea

### Métodos soportados

| Método | Flujo |
|--------|------|
| **PayPal** | Usuario paga → Sube comprobante → Admin aprueba |
| **Payphone** | Usuario paga → Sube comprobante → Admin aprueba |
| **Transferencia** | Usuario transfiere → Sube comprobante → Admin aprueba |

### Flujo de Pago

1. **Residente** inicia pago desde su dashboard
2. Selecciona método (PayPal / Payphone / Transferencia)
3. **Paga** en la plataforma externa
4. **Sube comprobante** (captura de pago / voucher)
5. Estado: **PENDIENTE** (espera aprobación)
6. **Admin/Tesorero** verifica y aprueba
7. Sistema actualiza deuda como **PAID**
8. Notificación enviada al residente

### Estados de pago

| Estado | Descripción |
|--------|-------------|
| PENDING | Esperando aprobación del comprobante |
| APPROVED | Comprobante verificado → deuda pagada |
| REJECTED | Comprobante inválido → residente debe subir otro |

### Configuración

```env
# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_MODE="live"  # sandbox | live

# Payphone (Ecuador)
PAYPHONE_API_KEY="..."
PAYPHONE_API_SECRET="..."
PAYPHONE_ENV="production"

# Datos para transferencias (mostrados al usuario)
BANK_NAME="Banco Pichincha"
ACCOUNT_NUMBER="****1234"
ACCOUNT_NAME="Conjunto Palermo Manaza"
CLABE="..."
```

## 📤 Despliegue (Production)

```bash
# Build de producción
npm run build

# Generar migrations para producción
npx prisma migrate deploy
```

## 🔧 Variables de Entorno

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/palermo_manaza"

# JWT Secret
JWT_SECRET="tu-secret-key-aqui"

# SMTP Email
SMTP_HOST="mail.urbeecode.com"
SMTP_PORT="587"
SMTP_USER="sales@urbeecode.com"
SMTP_PASS="tu-password"
SMTP_FROM="Palermo Manaza <noreply@palermo-manaza.com>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🐘 PostgreSQL

```bash
# Crear base de datos
createdb palermo_manaza

# Generar migraciones
npx prisma migrate dev --name init

# O solo push (desarrollo)
npx prisma db push
```

## 📝 Estructura

```
src/
├── actions/        # Server Actions
├── app/           # Next.js App Router
├── components/     # UI Components
├── emails/        # Email Templates
├── lib/           # Utilities
└── types/          # TypeScript Types
```

## 🔐 Roles

| Rol | Permisos |
|-----|---------|
| ADMIN | Full acceso |
| PRESIDENT | Aprobar convenios, reportes |
| TREASURER | Pagos, certificados |
| SECRETARY | Residentes, basic |
| RESIDENT | Ver su deuda, pagar |

## 📄 License

MIT