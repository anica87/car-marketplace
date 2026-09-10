import { PrismaClient, Role, CarCondition, ListingStatus } from '@prisma/client'

const prisma = new PrismaClient()

const makes = [
  { make: 'BMW', models: ['320d', '330i', 'X3', 'X5', '520d'] },
  { make: 'Audi', models: ['A3', 'A4', 'A6', 'Q3', 'Q5'] },
  { make: 'Mercedes-Benz', models: ['A200', 'C220', 'E220', 'GLC', 'GLE'] },
  { make: 'Volkswagen', models: ['Golf 8', 'Passat', 'Tiguan', 'T-Roc', 'Arteon'] },
  { make: 'Toyota', models: ['Corolla', 'Camry', 'RAV4', 'Yaris', 'C-HR'] },
  { make: 'Ford', models: ['Focus', 'Mondeo', 'Kuga', 'Puma', 'Mustang'] },
  { make: 'Škoda', models: ['Octavia', 'Superb', 'Kodiaq', 'Karoq', 'Fabia'] },
  { make: 'Peugeot', models: ['208', '308', '3008', '508', '2008'] },
  { make: 'Renault', models: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Austral'] },
  { make: 'Volvo', models: ['XC40', 'XC60', 'XC90', 'S60', 'V60'] },
]

const fuelTypes = ['diesel', 'petrol', 'hybrid', 'electric']
const transmissions = ['manual', 'automatic']
const bodyTypes = ['sedan', 'hatchback', 'suv', 'wagon', 'coupe']
const colors = ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red']
const cities = [
  { city: 'Belgrade', state: 'Serbia', lat: 44.7866, lng: 20.4489 },
  { city: 'Novi Sad', state: 'Serbia', lat: 45.2671, lng: 19.8335 },
  { city: 'Niš', state: 'Serbia', lat: 43.3209, lng: 21.8958 },
  { city: 'Kragujevac', state: 'Serbia', lat: 44.0128, lng: 20.9114 },
  { city: 'Subotica', state: 'Serbia', lat: 46.1000, lng: 19.6676 },
]

function random<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPrice(): number {
  return randomInt(7000, 65000)
}

async function main() {
  console.log('🌱 Starting database seed...')

  // ------------------------------------------------------------
  // CLEAN DATABASE
  // ------------------------------------------------------------

  await prisma.transaction.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.carImage.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.car.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Database cleaned')

  // ------------------------------------------------------------
  // CREATE SELLERS
  // ------------------------------------------------------------

  const sellers = []

  for (let i = 1; i <= 10; i++) {
    const seller = await prisma.user.create({
      data: {
        name: `Car Dealer ${i}`,
        email: `seller${i}@example.com`,
        phone: `+38160${String(1000000 + i)}`,
        passwordHash: 'seed-password',
        role: Role.SELLER,
        city: random(cities).city,
      },
    })

    sellers.push(seller)
  }

  console.log(`👤 Created ${sellers.length} sellers`)

  // ------------------------------------------------------------
  // CREATE BUYERS
  // ------------------------------------------------------------

  const buyers = []

  for (let i = 1; i <= 5; i++) {
    const buyer = await prisma.user.create({
      data: {
        name: `Buyer ${i}`,
        email: `buyer${i}@example.com`,
        phone: `+38161${String(2000000 + i)}`,
        passwordHash: 'seed-password',
        role: Role.BUYER,
        city: random(cities).city,
      },
    })

    buyers.push(buyer)
  }

  console.log(`👤 Created ${buyers.length} buyers`)

  // ------------------------------------------------------------
  // CREATE 100 CARS
  // ------------------------------------------------------------

  for (let i = 0; i < 100; i++) {
    const brand = random(makes)
    const model = random(brand.models)
    const seller = random(sellers)
    const location = random(cities)

    const year = randomInt(2015, 2025)
    const condition =
      Math.random() < 0.1
        ? CarCondition.NEW
        : CarCondition.USED

    const mileage =
      condition === CarCondition.NEW
        ? 0
        : randomInt(10000, 220000)

    const fuelType = random(fuelTypes)
    const transmission = random(transmissions)
    const bodyType = random(bodyTypes)
    const color = random(colors)
    const price = randomPrice()

    const car = await prisma.car.create({
      data: {
        sellerId: seller.id,

        make: brand.make,
        model,
        year,

        variant: random([
          'Base',
          'Comfort',
          'Sport',
          'Luxury',
          'Premium',
          'M Sport',
          'S Line',
          'AMG Line',
        ]),

        mileage,
        fuelType,
        transmission,
        bodyType,
        color,

        vin: `VIN${String(i + 1).padStart(14, '0')}`,

        registrationNumber:
          `${location.city.substring(0, 2).toUpperCase()}${String(
            100 + i,
          )}AA`,

        price,

        condition,

        description:
          `${brand.make} ${model} ${year}. ` +
          `${condition === CarCondition.NEW ? 'Brand new vehicle.' : 'Well maintained used vehicle.'} ` +
          `${fuelType}, ${transmission}, ${mileage.toLocaleString()} km.`,
      },
    })

    // ----------------------------------------------------------
    // CREATE LISTING
    // ----------------------------------------------------------

    const listing = await prisma.listing.create({
      data: {
        carId: car.id,

        status: ListingStatus.ACTIVE,

        city: location.city,
        state: location.state,

        lat: location.lat,
        lng: location.lng,

        viewsCount: randomInt(0, 5000),

        featured: Math.random() < 0.15,

        expiresAt: new Date(
          Date.now() + randomInt(7, 90) * 24 * 60 * 60 * 1000,
        ),
      },
    })

    // ----------------------------------------------------------
    // CREATE IMAGES
    // ----------------------------------------------------------

    await prisma.carImage.createMany({
      data: [
        {
          carId: car.id,
          url: `https://picsum.photos/seed/car-${i}-1/1200/800`,
          isPrimary: true,
          order: 0,
        },
        {
          carId: car.id,
          url: `https://picsum.photos/seed/car-${i}-2/1200/800`,
          isPrimary: false,
          order: 1,
        },
        {
          carId: car.id,
          url: `https://picsum.photos/seed/car-${i}-3/1200/800`,
          isPrimary: false,
          order: 2,
        },
      ],
    })

    console.log(
      `🚗 ${i + 1}/100 ${brand.make} ${model} - €${price}`,
    )
  }

  // ------------------------------------------------------------
  // CREATE SOME FAVORITES
  // ------------------------------------------------------------

  const listings = await prisma.listing.findMany()

  for (let i = 0; i < 20; i++) {
    const buyer = random(buyers)
    const listing = random(listings)

    try {
      await prisma.favorite.create({
        data: {
          userId: buyer.id,
          listingId: listing.id,
        },
      })
    } catch {
      // Ignore duplicate favorite
    }
  }

  console.log('❤️ Created favorites')

  console.log('✅ Seed completed!')
  console.log(`🚗 Cars: ${await prisma.car.count()}`)
  console.log(`📋 Listings: ${await prisma.listing.count()}`)
  console.log(`👤 Users: ${await prisma.user.count()}`)
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })