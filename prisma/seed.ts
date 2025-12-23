import { PrismaClient, UserRole, PromotionStatus, DeductionStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create tenant settings first (since Tenant references it)
  const tenantSettings1 = await prisma.tenantSettings.create({
    data: {
      tenantId: 'tenant-1',
      currency: 'USD',
      fiscalYearStart: 0,
      defaultMargin: 0.35,
      timezone: 'America/New_York'
    }
  })

  // Create tenants
  const tenant1 = await prisma.tenant.create({
    data: {
      id: 'tenant-1',
      name: 'CPG Corporation',
      industry: 'Consumer Packaged Goods',
      size: 'Enterprise',
      domain: 'cpg-corp.com'
    }
  })

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'u-1',
        name: 'Sarah Chen',
        email: 's.chen@cpg-corp.com',
        role: UserRole.REVENUE_MANAGER,
        tenantId: tenant1.id,
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-2',
        name: 'Mike Johnson',
        email: 'm.johnson@cpg-corp.com',
        role: UserRole.EXECUTIVE,
        tenantId: tenant1.id,
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-3',
        name: 'Lisa Rodriguez',
        email: 'l.rodriguez@cpg-corp.com',
        role: UserRole.FINANCE,
        tenantId: tenant1.id,
      }
    }),
    prisma.user.create({
      data: {
        id: 'u-4',
        name: 'David Kim',
        email: 'd.kim@cpg-corp.com',
        role: UserRole.ACCOUNT_MANAGER,
        tenantId: tenant1.id,
      }
    })
  ])

  // Create product categories
  const categories = await Promise.all([
    prisma.productCategory.create({
      data: {
        tenantId: tenant1.id,
        name: 'Coffee',
      }
    }),
    prisma.productCategory.create({
      data: {
        tenantId: tenant1.id,
        name: 'Dairy Alternatives',
      }
    }),
    prisma.productCategory.create({
      data: {
        tenantId: tenant1.id,
        name: 'Add-ons',
      }
    })
  ])

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        tenantId: tenant1.id,
        name: 'Premium Espresso 250g',
        sku: 'COF-PRE-250',
        categoryId: categories[0].id,
        basePrice: 8.50,
        cost: 4.25,
        margin: 0.50,
        unit: 'units',
      }
    }),
    prisma.product.create({
      data: {
        tenantId: tenant1.id,
        name: 'Classic Roast 500g',
        sku: 'COF-CLS-500',
        categoryId: categories[0].id,
        basePrice: 12.00,
        cost: 7.20,
        margin: 0.40,
        unit: 'units',
      }
    }),
    prisma.product.create({
      data: {
        tenantId: tenant1.id,
        name: 'Oat Milk Barista 1L',
        sku: 'DAI-OAT-1L',
        categoryId: categories[1].id,
        basePrice: 3.20,
        cost: 2.11,
        margin: 0.34,
        unit: 'liters',
      }
    }),
    prisma.product.create({
      data: {
        tenantId: tenant1.id,
        name: 'Caramel Syrup 500ml',
        sku: 'ADD-CAR-500',
        categoryId: categories[2].id,
        basePrice: 5.50,
        cost: 2.75,
        margin: 0.50,
        unit: 'bottles',
      }
    })
  ])

  // Create retailers
  const retailers = await Promise.all([
    prisma.retailer.create({
      data: {
        tenantId: tenant1.id,
        name: 'Whole Foods Market',
        code: 'WFM001',
        region: 'National',
        channel: 'Natural',
        tier: 'A',
        contactEmail: 'promotions@wholefoods.com',
      }
    }),
    prisma.retailer.create({
      data: {
        tenantId: tenant1.id,
        name: 'Kroger',
        code: 'KRO001',
        region: 'Midwest',
        channel: 'Grocery',
        tier: 'A',
        contactEmail: 'trade@kroger.com',
      }
    }),
    prisma.retailer.create({
      data: {
        tenantId: tenant1.id,
        name: 'Costco',
        code: 'COS001',
        region: 'West',
        channel: 'Club',
        tier: 'A',
        contactEmail: 'merchandise@costco.com',
      }
    }),
    prisma.retailer.create({
      data: {
        tenantId: tenant1.id,
        name: 'Target',
        code: 'TAR001',
        region: 'East',
        channel: 'Mass',
        tier: 'B',
        contactEmail: 'vendor.services@target.com',
      }
    })
  ])

  // Create promotions
  const promotions = await Promise.all([
    prisma.tradePromotion.create({
      data: {
        tenantId: tenant1.id,
        name: 'Coffee Month Special',
        description: 'December coffee promotion with 15% off TPR',
        status: PromotionStatus.ACTIVE,
        retailerId: retailers[0].id,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        mechanic: {
          type: 'TPR',
          description: '15% Off Temporary Price Reduction',
          discountDepth: 0.15,
        },
        discountDepth: 0.15,
        plannedSpend: 25000,
        actualSpend: 24200,
        plannedVolume: 5000,
        actualVolume: 5200,
        plannedRevenue: 42500,
        actualRevenue: 44200,
        plannedMargin: 0.45,
        actualMargin: 0.47,
        roi: 1.83,
        liftPercent: 24,
        createdBy: users[0].id,
        approvedBy: users[1].id,
        approvedAt: new Date('2024-11-15'),
      }
    }),
    prisma.tradePromotion.create({
      data: {
        tenantId: tenant1.id,
        name: 'Q4 Barista Bundle',
        description: 'Bundle promotion for coffee and dairy alternatives',
        status: PromotionStatus.PLANNED,
        retailerId: retailers[1].id,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-02-15'),
        mechanic: {
          type: 'BUNDLE',
          description: 'Buy 2 Get 1 Free on barista items',
          buyQuantity: 2,
          getQuantity: 1,
        },
        discountDepth: 0.33,
        plannedSpend: 45000,
        plannedVolume: 12000,
        plannedRevenue: 38400,
        plannedMargin: 0.42,
        roi: 1.15,
        liftPercent: 45,
        createdBy: users[3].id,
      }
    }),
    prisma.tradePromotion.create({
      data: {
        tenantId: tenant1.id,
        name: 'Holiday Gifting Boost',
        description: 'Seasonal promotion for gift items',
        status: PromotionStatus.COMPLETED,
        retailerId: retailers[2].id,
        startDate: new Date('2024-11-20'),
        endDate: new Date('2024-12-25'),
        mechanic: {
          type: 'DISPLAY',
          description: 'Display placement + $1 off promotion',
          discountDepth: 0.18,
        },
        discountDepth: 0.18,
        plannedSpend: 15000,
        actualSpend: 15200,
        plannedVolume: 3000,
        actualVolume: 2850,
        plannedRevenue: 16500,
        actualRevenue: 15675,
        plannedMargin: 0.48,
        actualMargin: 0.46,
        roi: 1.03,
        liftPercent: 12,
        createdBy: users[0].id,
        approvedBy: users[1].id,
        approvedAt: new Date('2024-11-10'),
      }
    })
  ])

  // Add products to promotions
  await Promise.all([
    prisma.product.update({
      where: { id: products[0].id },
      data: {
        promotions: {
          connect: { id: promotions[0].id }
        }
      }
    }),
    prisma.product.update({
      where: { id: products[2].id },
      data: {
        promotions: {
          connect: { id: promotions[1].id }
        }
      }
    }),
    prisma.product.update({
      where: { id: products[3].id },
      data: {
        promotions: {
          connect: { id: promotions[2].id }
        }
      }
    })
  ])

  // Create deductions
  await Promise.all([
    prisma.deduction.create({
      data: {
        tenantId: tenant1.id,
        retailerId: retailers[0].id,
        promotionId: promotions[0].id,
        amount: 450.00,
        status: DeductionStatus.OPEN,
        type: 'Shortage',
        reason: 'Inventory shortage at store #1234',
        date: new Date('2024-12-10'),
      }
    }),
    prisma.deduction.create({
      data: {
        tenantId: tenant1.id,
        retailerId: retailers[1].id,
        amount: 1250.00,
        status: DeductionStatus.PENDING,
        type: 'Trade Discount',
        reason: 'Additional trade discount applied',
        date: new Date('2024-12-05'),
      }
    }),
    prisma.deduction.create({
      data: {
        tenantId: tenant1.id,
        retailerId: retailers[2].id,
        amount: 230.50,
        status: DeductionStatus.CLEARED,
        type: 'Damaged Goods',
        reason: 'Product damaged in transit',
        date: new Date('2024-11-28'),
        resolvedAt: new Date('2024-12-01'),
        resolvedBy: users[2].id,
      }
    })
  ])

  // Create company goals
  await Promise.all([
    prisma.companyGoal.create({
      data: {
        tenantId: tenant1.id,
        type: 'Revenue',
        target: 5000000,
        current: 3250000,
        period: 'FY2025',
      }
    }),
    prisma.companyGoal.create({
      data: {
        tenantId: tenant1.id,
        type: 'Volume',
        target: 1000000,
        current: 650000,
        period: 'FY2025',
      }
    }),
    prisma.companyGoal.create({
      data: {
        tenantId: tenant1.id,
        type: 'Margin',
        target: 0.42,
        current: 0.39,
        period: 'FY2025',
      }
    })
  ])

  // Create some sample POS data
  const posData = []
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    posData.push(
      prisma.pOSData.create({
        data: {
          tenantId: tenant1.id,
          retailerId: retailers[Math.floor(Math.random() * retailers.length)].id,
          productId: products[Math.floor(Math.random() * products.length)].id,
          date,
          baselineSales: Math.floor(Math.random() * 1000) + 500,
          promotedSales: Math.floor(Math.random() * 1500) + 800,
          baselineRevenue: Math.floor(Math.random() * 5000) + 2000,
          promotedRevenue: Math.floor(Math.random() * 8000) + 3000,
          units: Math.floor(Math.random() * 200) + 50,
          price: Math.random() * 10 + 5,
          isPromotion: Math.random() > 0.7,
        }
      })
    )
  }

  await Promise.all(posData)

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
