import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      name: 'Administrador',
      password: hashedPassword,
    },
  })

  await prisma.sector.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Recursos Humanos',
      color: '#E91E63'
    }
  })

  await prisma.sector.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'T.I.',
      color: '#2196F3'
    }
  })

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      primaryColor: '#0057FF',
      footerText: '© 2026 Todos os direitos reservados - Sua Empresa'
    }
  })

  console.log('✅ Banco populado com sucesso (Incluindo Usuário Admin)!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })