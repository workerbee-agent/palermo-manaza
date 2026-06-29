import { PrismaClient, Role, ResidenceType, OccupancyStatus, OwnerType, PaymentMethod, DocumentType, DebtStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.finePayment.deleteMany()
  await prisma.fine.deleteMany()
  await prisma.installment.deleteMany()
  await prisma.paymentAgreement.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.otpCode.deleteMany()
  await prisma.document.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.debt.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.owner.deleteMany()
  await prisma.residence.deleteMany()
  await prisma.yearConfig.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // Create users with roles
  const hashedPassword = await bcrypt.hash('Password123!', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@palermo.com',
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Palermo',
      phone: '+593999999999',
      role: Role.ADMIN,
      isActive: true,
    },
  })

  const president = await prisma.user.create({
    data: {
      email: 'presidente@palermo.com',
      password: hashedPassword,
      firstName: 'Ricardo',
      lastName: 'Yaguachi',
      phone: '+593912345678',
      role: Role.PRESIDENT,
      isActive: true,
    },
  })

  const treasurer = await prisma.user.create({
    data: {
      email: 'tesorero@palermo.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'García',
      phone: '+593912345679',
      role: Role.TREASURER,
      isActive: true,
    },
  })

  const secretary = await prisma.user.create({
    data: {
      email: 'secretario@palermo.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Mendoza',
      phone: '+593912345680',
      role: Role.SECRETARY,
      isActive: true,
    },
  })

  // Create resident users
  const resident1 = await prisma.user.create({
    data: {
      email: 'resident1@palermo.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+593912345681',
      role: Role.RESIDENT,
      isActive: true,
    },
  })

  const resident2 = await prisma.user.create({
    data: {
      email: 'resident2@palermo.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'López',
      phone: '+593912345682',
      role: Role.RESIDENT,
      isActive: true,
    },
  })

  console.log('✅ Created users:', { admin, president, treasurer, secretary, resident1, resident2 })

  // Create YearConfig for current year
  const currentYear = new Date().getFullYear()
  await prisma.yearConfig.create({
    data: {
      year: currentYear,
      amount: 150, // Monthly fee
      dueDay: 10,
    },
  })

  // Create YearConfig for next year
  await prisma.yearConfig.create({
    data: {
      year: currentYear + 1,
      amount: 165,
      dueDay: 10,
    },
  })

  console.log('✅ Created YearConfig')

  // Create residences
  const res1 = await prisma.residence.create({
    data: {
      name: 'Casa 1',
      type: ResidenceType.HOUSE,
      block: 'A',
      floor: 1,
      address: 'Calle 1, Casa 1',
      status: OccupancyStatus.OCCUPIED,
      ownerId: 'owner-1',
    },
  })

  const res2 = await prisma.residence.create({
    data: {
      name: 'Apartamento 101',
      type: ResidenceType.APARTMENT,
      block: 'B',
      floor: 1,
      address: 'Bloque B, Piso 1, Dpto 101',
      status: OccupancyStatus.OCCUPIED,
      ownerId: 'owner-2',
    },
  })

  const res3 = await prisma.residence.create({
    data: {
      name: 'Apartamento 102',
      type: ResidenceType.APARTMENT,
      block: 'B',
      floor: 1,
      address: 'Bloque B, Piso 1, Dpto 102',
      status: OccupancyStatus.RENTED,
      ownerId: 'owner-3',
    },
  })

  console.log('✅ Created residences')

  // Create owners
  await prisma.owner.create({
    data: {
      id: 'owner-1',
      residenceId: res1.id,
      type: OwnerType.SINGLE,
      identification: '1712345678',
      spouseName: null,
      spouseId: null,
    },
  })

  await prisma.owner.create({
    data: {
      id: 'owner-2',
      residenceId: res2.id,
      type: OwnerType.MARRIED,
      identification: '1712345679',
      spouseName: 'Sofía Mendoza',
      spouseId: '1723456789',
    },
  })

  await prisma.owner.create({
    data: {
      id: 'owner-3',
      residenceId: res3.id,
      type: OwnerType.SINGLE,
      identification: '1712345680',
    },
  })

  console.log('✅ Created owners')

  // Create tenants
  await prisma.tenant.create({
    data: {
      residenceId: res3.id,
      identification: '1723456780',
      name: 'Pedro Torres',
      phone: '+593912345683',
      email: 'pedro@email.com',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
    },
  })

  console.log('✅ Created tenants')

  // Create PaymentConfig
  await prisma.paymentConfig.create({
    data: {
      bankName: 'Banco Pichincha',
      accountNumber: '1234567890',
      accountName: 'Conjunto Residencial Palermo Manaza',
      clabe: '170123456789012345',
      paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
      paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      payphoneApiKey: process.env.PAYPHONE_API_KEY || '',
      payphoneApiSecret: process.env.PAYPHONE_API_SECRET || '',
      isActive: true,
    },
  })

  console.log('✅ Created PaymentConfig')

  // Create some debts for current year
  const yearConfig = await prisma.yearConfig.findUnique({ where: { year: currentYear } })
  if (yearConfig) {
    for (let month = 1; month <= 6; month++) {
      await prisma.debt.create({
        data: {
          residenceId: res1.id,
          yearConfigId: yearConfig.id,
          month,
          amount: yearConfig.amount,
          status: month < 5 ? DebtStatus.PAID : DebtStatus.PENDING,
          dueDate: new Date(currentYear, month - 1, yearConfig.dueDay),
        },
      })
    }
  }

  console.log('✅ Created debts')

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: president.id,
      title: 'Bienvenido al sistema',
      message: 'Su cuenta ha sido creada exitosamente.',
      type: 'SYSTEM',
    },
  })

  console.log('✅ Created notifications')

  console.log('🎉 Seed completed!')
  console.log('')
  console.log('📧 Login credentials:')
  console.log('  Admin: admin@palermo.com / Password123!')
  console.log('  Presidente: presidente@palermo.com / Password123!')
  console.log('  Tesorero: tesorero@palermo.com / Password123!')
  console.log('  Residente: resident1@palermo.com / Password123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })