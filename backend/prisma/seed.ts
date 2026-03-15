import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

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

  console.log('✅ Seed finalizado!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())