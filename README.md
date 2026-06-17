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
- **Pagos**: Registro con recibo automático
- **Convenios**: Creación y aprobación (presidente)
- **Certificados**: Expensas, deuda, propiedad, arrendatario

## 🛠️ Tech Stack

- Next.js 15 (App Router)
- Prisma + PostgreSQL
- shadcn/ui + Tailwind CSS
- JWT + OTP
- nodemailer (SMTP)

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

# 5. Iniciar servidor
npm run dev
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