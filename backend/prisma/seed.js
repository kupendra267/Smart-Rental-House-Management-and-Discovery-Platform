const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Clear existing data in reverse relational order
  await prisma.auditLog.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentInvoice.deleteMany();
  await prisma.rentalAgreement.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.application.deleteMany();
  await prisma.propertyView.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyLocation.deleteMany();
  await prisma.propertyVerification.deleteMany();
  await prisma.verificationDocument.deleteMany();
  await prisma.property.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.tenantProfile.deleteMany();
  await prisma.ownerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up existing records.');

  // Password hashes
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const ownerPassword = await bcrypt.hash('Owner@12345', 10);
  const tenantPassword = await bcrypt.hash('Tenant@12345', 10);

  // 2. Create Master Admin
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin@smartrental.com',
      phone: '+91 9876543210',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    }
  });

  // 3. Create 5 Owners
  const ownersData = [
    { name: 'Rajesh Sharma', email: 'owner1@smartrental.com', phone: '+91 9811122331', city: 'Bangalore' },
    { name: 'Priya Mukherjee', email: 'owner2@smartrental.com', phone: '+91 9811122332', city: 'Mumbai' },
    { name: 'Vikramaditya Rao', email: 'owner3@smartrental.com', phone: '+91 9811122333', city: 'Hyderabad' },
    { name: 'Ananya Deshmukh', email: 'owner4@smartrental.com', phone: '+91 9811122334', city: 'Pune' },
    { name: 'Sanjay Malhotra', email: 'owner5@smartrental.com', phone: '+91 9811122335', city: 'Delhi NCR' },
  ];

  const ownerProfiles = [];
  for (const o of ownersData) {
    const user = await prisma.user.create({
      data: {
        fullName: o.name,
        email: o.email,
        phone: o.phone,
        passwordHash: ownerPassword,
        role: 'OWNER',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        ownerProfile: {
          create: {
            ownerType: 'INDIVIDUAL',
            verificationStatus: 'VERIFIED',
            identityDocument: '/uploads/documents/sample_aadhar.pdf'
          }
        }
      },
      include: { ownerProfile: true }
    });
    ownerProfiles.push(user.ownerProfile);
  }

  // 4. Create 15 Tenants
  const tenantsData = [
    { name: 'Aarav Patel', email: 'tenant1@smartrental.com', phone: '+91 9123456701', city: 'Bangalore', area: 'Koramangala', budgetMin: 12000, budgetMax: 20000, bhk: 2, type: 'BACHELOR', occ: 'Software Engineer', org: 'Infosys' },
    { name: 'Neha Gupta', email: 'tenant2@smartrental.com', phone: '+91 9123456702', city: 'Bangalore', area: 'Indiranagar', budgetMin: 25000, budgetMax: 40000, bhk: 3, type: 'FAMILY', occ: 'Product Manager', org: 'Flipkart' },
    { name: 'Rohan Verma', email: 'tenant3@smartrental.com', phone: '+91 9123456703', city: 'Mumbai', area: 'Bandra West', budgetMin: 35000, budgetMax: 55000, bhk: 2, type: 'WORKING_PROFESSIONAL', occ: 'Investment Banker', org: 'Morgan Stanley' },
    { name: 'Sneha Reddy', email: 'tenant4@smartrental.com', phone: '+91 9123456704', city: 'Hyderabad', area: 'Gachibowli', budgetMin: 15000, budgetMax: 24000, bhk: 2, type: 'BACHELOR', occ: 'Data Scientist', org: 'Microsoft' },
    { name: 'Karan Joshi', email: 'tenant5@smartrental.com', phone: '+91 9123456705', city: 'Pune', area: 'Viman Nagar', budgetMin: 10000, budgetMax: 18000, bhk: 1, type: 'STUDENT', occ: 'Master Student', org: 'Symbiosis' },
    { name: 'Divya Iyer', email: 'tenant6@smartrental.com', phone: '+91 9123456706', city: 'Bangalore', area: 'HSR Layout', budgetMin: 18000, budgetMax: 28000, bhk: 2, type: 'WORKING_PROFESSIONAL', occ: 'UX Designer', org: 'Swiggy' },
    { name: 'Aditya Singh', email: 'tenant7@smartrental.com', phone: '+91 9123456707', city: 'Delhi NCR', area: 'Gurugram Cyber City', budgetMin: 20000, budgetMax: 35000, bhk: 2, type: 'BACHELOR', occ: 'Consultant', org: 'Deloitte' },
    { name: 'Meera Nambiar', email: 'tenant8@smartrental.com', phone: '+91 9123456708', city: 'Bangalore', area: 'Whitefield', budgetMin: 22000, budgetMax: 32000, bhk: 3, type: 'FAMILY', occ: 'HR Director', org: 'SAP' },
    { name: 'Rahul Kulkarni', email: 'tenant9@smartrental.com', phone: '+91 9123456709', city: 'Pune', area: 'Hinjewadi', budgetMin: 12000, budgetMax: 19000, bhk: 2, type: 'BACHELOR', occ: 'QA Engineer', org: 'Wipro' },
    { name: 'Ishita Roy', email: 'tenant10@smartrental.com', phone: '+91 9123456710', city: 'Mumbai', area: 'Powai', budgetMin: 30000, budgetMax: 45000, bhk: 2, type: 'WORKING_PROFESSIONAL', occ: 'Research Analyst', org: 'IIT Bombay Staff' },
    { name: 'Siddharth Nair', email: 'tenant11@smartrental.com', phone: '+91 9123456711', city: 'Hyderabad', area: 'Hitech City', budgetMin: 16000, budgetMax: 26000, bhk: 2, type: 'BACHELOR', occ: 'Full Stack Dev', org: 'Amazon' },
    { name: 'Tanvi Shah', email: 'tenant12@smartrental.com', phone: '+91 9123456712', city: 'Mumbai', area: 'Andheri East', budgetMin: 20000, budgetMax: 30000, bhk: 1, type: 'WORKING_PROFESSIONAL', occ: 'Marketing Lead', org: 'Nykaa' },
    { name: 'Varun Bhatia', email: 'tenant13@smartrental.com', phone: '+91 9123456713', city: 'Delhi NCR', area: 'Noida Sector 62', budgetMin: 14000, budgetMax: 22000, bhk: 2, type: 'BACHELOR', occ: 'Cybersecurity Analyst', org: 'HCL' },
    { name: 'Ritu Sen', email: 'tenant14@smartrental.com', phone: '+91 9123456714', city: 'Bangalore', area: 'Electronic City', budgetMin: 9000, budgetMax: 15000, bhk: 1, type: 'STUDENT', occ: 'Student', org: 'PES University' },
    { name: 'Manish Rawat', email: 'tenant15@smartrental.com', phone: '+91 9123456715', city: 'Pune', area: 'Kalyani Nagar', budgetMin: 28000, budgetMax: 42000, bhk: 3, type: 'FAMILY', occ: 'Senior Architect', org: 'TCS' },
  ];

  const tenantProfiles = [];
  for (const t of tenantsData) {
    const user = await prisma.user.create({
      data: {
        fullName: t.name,
        email: t.email,
        phone: t.phone,
        passwordHash: tenantPassword,
        role: 'TENANT',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        tenantProfile: {
          create: {
            occupation: t.occ,
            companyOrCollege: t.org,
            preferredCity: t.city,
            preferredArea: t.area,
            budgetMin: t.budgetMin,
            budgetMax: t.budgetMax,
            preferredPropertyType: 'APARTMENT',
            preferredBhk: t.bhk,
            tenantType: t.type,
            moveInDate: new Date(),
            numberOfOccupants: t.type === 'FAMILY' ? 4 : 2
          }
        }
      },
      include: { tenantProfile: true }
    });
    tenantProfiles.push(user.tenantProfile);
  }

  // 5. Create Master Amenities
  const masterAmenities = [
    { name: 'Wi-Fi / High-Speed Internet', icon: 'Wifi', category: 'Connectivity' },
    { name: 'Covered Car Parking', icon: 'Car', category: 'Parking' },
    { name: '24/7 Power Backup', icon: 'Zap', category: 'Utilities' },
    { name: 'Elevator / Lift', icon: 'ArrowUpDown', category: 'Building' },
    { name: 'Gated Security & CCTV', icon: 'Shield', category: 'Security' },
    { name: 'Air Conditioner (AC)', icon: 'Wind', category: 'Cooling' },
    { name: 'Swimming Pool', icon: 'Waves', category: 'Recreation' },
    { name: 'Fitness Gym', icon: 'Dumbbell', category: 'Fitness' },
    { name: 'Modular Kitchen & Piped Gas', icon: 'Flame', category: 'Kitchen' },
    { name: 'Spacious Balcony', icon: 'Sun', category: 'Architecture' },
    { name: 'Water Purifier (RO)', icon: 'Droplets', category: 'Utilities' },
    { name: 'Clubhouse & Party Hall', icon: 'Home', category: 'Recreation' },
  ];

  const amenityMap = {};
  for (const a of masterAmenities) {
    const created = await prisma.amenity.create({
      data: a
    });
    amenityMap[a.name] = created.id;
  }

  // 6. Create 32 Properties Across 5 Metros
  const propertiesList = [
    // --- BANGALORE PROPERTIES ---
    {
      title: 'Modern 2 BHK Apartment in Heart of Koramangala',
      desc: 'Sunlit and airy 2 BHK apartment situated in Koramangala 4th Block. Includes modular kitchen, Italian flooring, premium bath fittings, and 1 covered car parking space.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 3,
      totalFloors: 5,
      areaSqft: 1250,
      furnishing: 'FURNISHED',
      rent: 16500,
      deposit: 50000,
      maintenance: 2000,
      tenantPref: 'ANY',
      city: 'Bangalore',
      area: 'Koramangala',
      state: 'Karnataka',
      pincode: '560034',
      lat: 12.9352,
      lng: 77.6245,
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', type: 'LIVING_ROOM' },
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', type: 'BEDROOM' },
        { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', type: 'KITCHEN' },
        { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', type: 'BATHROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Covered Car Parking', '24/7 Power Backup', 'Elevator / Lift', 'Gated Security & CCTV', 'Air Conditioner (AC)']
    },
    {
      title: 'Luxury 3 BHK Penthouse with Private Balcony',
      desc: 'Stunning 3 BHK Penthouse in Indiranagar 100ft Road. Walking distance to metro, gourmet dining, and parks. Equipped with rooftop garden view and 2 dedicated parking bays.',
      propertyType: 'APARTMENT',
      bhk: 3,
      bathrooms: 3,
      floorNumber: 4,
      totalFloors: 4,
      areaSqft: 2100,
      furnishing: 'FURNISHED',
      rent: 38000,
      deposit: 120000,
      maintenance: 3500,
      tenantPref: 'FAMILY_ONLY',
      city: 'Bangalore',
      area: 'Indiranagar',
      state: 'Karnataka',
      pincode: '560038',
      lat: 12.9784,
      lng: 77.6408,
      images: [
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', type: 'EXTERIOR' },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', type: 'LIVING_ROOM' },
        { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Covered Car Parking', '24/7 Power Backup', 'Elevator / Lift', 'Swimming Pool', 'Fitness Gym', 'Spacious Balcony']
    },
    {
      title: 'Cozy 1 BHK Studio for Bachelors & Techies in HSR',
      desc: 'Compact and smartly designed 1 BHK in HSR Sector 2. Quiet residential avenue near cafes and co-working hubs. Ideal for single professionals and tech workers.',
      propertyType: 'APARTMENT',
      bhk: 1,
      bathrooms: 1,
      floorNumber: 2,
      totalFloors: 4,
      areaSqft: 650,
      furnishing: 'SEMI_FURNISHED',
      rent: 14000,
      deposit: 35000,
      maintenance: 1000,
      tenantPref: 'BACHELOR_ONLY',
      city: 'Bangalore',
      area: 'HSR Layout',
      state: 'Karnataka',
      pincode: '560102',
      lat: 12.9121,
      lng: 77.6446,
      images: [
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', type: 'LIVING_ROOM' },
        { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', '24/7 Power Backup', 'Gated Security & CCTV', 'Water Purifier (RO)']
    },
    {
      title: 'Spacious 3 BHK Gated Villa near ITPL Whitefield',
      desc: 'Independent 3 BHK duplex villa inside a premium gated community with clubhouse, tennis court, jogging track, and 24hr security. Perfect for families seeking serenity.',
      propertyType: 'VILLA',
      bhk: 3,
      bathrooms: 3,
      floorNumber: 1,
      totalFloors: 2,
      areaSqft: 2400,
      furnishing: 'SEMI_FURNISHED',
      rent: 29000,
      deposit: 90000,
      maintenance: 3000,
      tenantPref: 'FAMILY_ONLY',
      city: 'Bangalore',
      area: 'Whitefield',
      state: 'Karnataka',
      pincode: '560066',
      lat: 12.9698,
      lng: 77.7499,
      images: [
        { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80', type: 'EXTERIOR' },
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', '24/7 Power Backup', 'Swimming Pool', 'Fitness Gym', 'Gated Security & CCTV', 'Clubhouse & Party Hall']
    },
    {
      title: 'Affordable 1 RK Room near Infosys Electronic City',
      desc: 'Neat single room with attached bath and kitchenette near Phase 1 toll gate. Low security deposit, high speed fiber optic internet, and daily housekeeping option.',
      propertyType: 'ROOM',
      bhk: 1,
      bathrooms: 1,
      floorNumber: 1,
      totalFloors: 3,
      areaSqft: 380,
      furnishing: 'FURNISHED',
      rent: 9500,
      deposit: 20000,
      maintenance: 500,
      tenantPref: 'BACHELOR_ONLY',
      city: 'Bangalore',
      area: 'Electronic City',
      state: 'Karnataka',
      pincode: '560100',
      lat: 12.8452,
      lng: 77.6602,
      images: [
        { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Water Purifier (RO)', 'Gated Security & CCTV']
    },
    {
      title: 'Chic 2 BHK Flat near Outer Ring Road Marathahalli',
      desc: 'Prime connectivity to Bellandur, Marathahalli, and Whitefield tech parks. 2 bathrooms, modular kitchen, east-facing Vaastu compliant unit.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 5,
      totalFloors: 8,
      areaSqft: 1180,
      furnishing: 'SEMI_FURNISHED',
      rent: 18000,
      deposit: 55000,
      maintenance: 2200,
      tenantPref: 'ANY',
      city: 'Bangalore',
      area: 'Marathahalli',
      state: 'Karnataka',
      pincode: '560037',
      lat: 12.9569,
      lng: 77.7011,
      images: [
        { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Gated Security & CCTV']
    },

    // --- MUMBAI PROPERTIES ---
    {
      title: 'Sea Facing 2 BHK Sea-Breeze Flat in Bandra West',
      desc: 'Breathtaking Arabian Sea view apartment in Bandra West near Carter Road. Marble flooring, split ACs in all rooms, and modern designer kitchen.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 9,
      totalFloors: 14,
      areaSqft: 1050,
      furnishing: 'FURNISHED',
      rent: 48000,
      deposit: 150000,
      maintenance: 4000,
      tenantPref: 'WORKING_PROFESSIONAL',
      city: 'Mumbai',
      area: 'Bandra West',
      state: 'Maharashtra',
      pincode: '400050',
      lat: 19.0596,
      lng: 72.8295,
      images: [
        { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', type: 'LIVING_ROOM' },
        { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Air Conditioner (AC)', 'Covered Car Parking', 'Elevator / Lift', 'Gated Security & CCTV', 'Spacious Balcony']
    },
    {
      title: 'Elegant 2 BHK High-Rise in Hiranandani Powai',
      desc: 'Signature neoclassical architecture apartment in Powai with lake view. Clubhouse, Olympic swimming pool, tennis court, and lush botanical garden inside campus.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 15,
      totalFloors: 24,
      areaSqft: 1150,
      furnishing: 'FURNISHED',
      rent: 36000,
      deposit: 100000,
      maintenance: 3200,
      tenantPref: 'ANY',
      city: 'Mumbai',
      area: 'Powai',
      state: 'Maharashtra',
      pincode: '400076',
      lat: 19.1176,
      lng: 72.9060,
      images: [
        { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', type: 'EXTERIOR' },
        { url: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Swimming Pool', 'Fitness Gym', 'Clubhouse & Party Hall', 'Elevator / Lift', '24/7 Power Backup', 'Covered Car Parking']
    },
    {
      title: 'Comfortable 1 BHK near Metro Station Andheri East',
      desc: 'Prime location near Western Express Highway & Metro Line 1. Easy commute to BKC and airport. Fully piped gas line and 24x7 municipal water supply.',
      propertyType: 'APARTMENT',
      bhk: 1,
      bathrooms: 1,
      floorNumber: 4,
      totalFloors: 7,
      areaSqft: 600,
      furnishing: 'SEMI_FURNISHED',
      rent: 24000,
      deposit: 70000,
      maintenance: 1500,
      tenantPref: 'ANY',
      city: 'Mumbai',
      area: 'Andheri East',
      state: 'Maharashtra',
      pincode: '400069',
      lat: 19.1136,
      lng: 72.8697,
      images: [
        { url: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Elevator / Lift', 'Gated Security & CCTV', 'Modular Kitchen & Piped Gas', 'Water Purifier (RO)']
    },
    {
      title: 'Lavish 4 BHK Villa with Private Lawn in Juhu',
      desc: 'Exquisite independent bungalow in affluent Juhu neighbourhood. Custom interior decor, hardwood floor, private lawn, and servant quarters.',
      propertyType: 'VILLA',
      bhk: 4,
      bathrooms: 4,
      floorNumber: 1,
      totalFloors: 2,
      areaSqft: 3400,
      furnishing: 'FURNISHED',
      rent: 65000,
      deposit: 200000,
      maintenance: 5000,
      tenantPref: 'FAMILY_ONLY',
      city: 'Mumbai',
      area: 'Juhu',
      state: 'Maharashtra',
      pincode: '400049',
      lat: 19.1075,
      lng: 72.8263,
      images: [
        { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80', type: 'EXTERIOR' },
        { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', '24/7 Power Backup', 'Air Conditioner (AC)', 'Gated Security & CCTV', 'Spacious Balcony']
    },
    {
      title: 'Spacious 2 BHK Family Home in Thane West',
      desc: 'Serene mountain view apartment in Majiwada, Thane West. Close to Viviana Mall and Eastern Express Highway.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 11,
      totalFloors: 18,
      areaSqft: 980,
      furnishing: 'UNFURNISHED',
      rent: 21000,
      deposit: 60000,
      maintenance: 1800,
      tenantPref: 'FAMILY_ONLY',
      city: 'Mumbai',
      area: 'Thane',
      state: 'Maharashtra',
      pincode: '400601',
      lat: 19.2183,
      lng: 72.9781,
      images: [
        { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Gated Security & CCTV']
    },

    // --- HYDERABAD PROPERTIES ---
    {
      title: 'Premium 2 BHK IT Corridor Flat in Gachibowli',
      desc: 'Prime residential complex situated adjacent to Financial District and DLF Cyber City. Gym, badminton court, high-speed fiber internet, and supermarket within campus.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 6,
      totalFloors: 12,
      areaSqft: 1300,
      furnishing: 'FURNISHED',
      rent: 19500,
      deposit: 45000,
      maintenance: 2500,
      tenantPref: 'BACHELOR_ONLY',
      city: 'Hyderabad',
      area: 'Gachibowli',
      state: 'Telangana',
      pincode: '500032',
      lat: 17.4401,
      lng: 78.3489,
      images: [
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', type: 'LIVING_ROOM' },
        { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Fitness Gym', 'Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Air Conditioner (AC)']
    },
    {
      title: 'High-Tech 3 BHK Luxury Flat in Hitech City',
      desc: 'Opposite Cyber Towers. Italian marble flooring, false ceiling with ambient warm lighting, centralized air conditioning and 2 covered basement parking slots.',
      propertyType: 'APARTMENT',
      bhk: 3,
      bathrooms: 3,
      floorNumber: 8,
      totalFloors: 15,
      areaSqft: 1850,
      furnishing: 'FURNISHED',
      rent: 28000,
      deposit: 75000,
      maintenance: 3000,
      tenantPref: 'ANY',
      city: 'Hyderabad',
      area: 'Hitech City',
      state: 'Telangana',
      pincode: '500081',
      lat: 17.4483,
      lng: 78.3742,
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Swimming Pool', 'Fitness Gym', 'Covered Car Parking', '24/7 Power Backup', 'Gated Security & CCTV', 'Spacious Balcony']
    },
    {
      title: 'Contemporary 2 BHK in Madhapur near Durgam Cheruvu',
      desc: 'Just 5 mins from cable bridge and metro station. Peaceful neighbourhood, modular kitchen, cross-ventilation in all bedrooms.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 3,
      totalFloors: 5,
      areaSqft: 1200,
      furnishing: 'SEMI_FURNISHED',
      rent: 18000,
      deposit: 40000,
      maintenance: 1800,
      tenantPref: 'ANY',
      city: 'Hyderabad',
      area: 'Madhapur',
      state: 'Telangana',
      pincode: '500081',
      lat: 17.4486,
      lng: 78.3908,
      images: [
        { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Elevator / Lift', '24/7 Power Backup', 'Covered Car Parking']
    },
    {
      title: 'Grand 3 BHK Independent Floor in Jubilee Hills',
      desc: 'Exclusive independent floor in elite Jubilee Hills. 100% privacy, private terrace, solar water heater, and luxury finishes.',
      propertyType: 'INDEPENDENT_HOUSE',
      bhk: 3,
      bathrooms: 3,
      floorNumber: 2,
      totalFloors: 3,
      areaSqft: 2200,
      furnishing: 'FURNISHED',
      rent: 42000,
      deposit: 120000,
      maintenance: 3000,
      tenantPref: 'FAMILY_ONLY',
      city: 'Hyderabad',
      area: 'Jubilee Hills',
      state: 'Telangana',
      pincode: '500033',
      lat: 17.4319,
      lng: 78.4073,
      images: [
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', type: 'EXTERIOR' }
      ],
      amenities: ['Covered Car Parking', '24/7 Power Backup', 'Air Conditioner (AC)', 'Gated Security & CCTV', 'Spacious Balcony']
    },
    {
      title: 'Budget Friendly 1 BHK Apartment in Kondapur',
      desc: 'Near Botanical Gardens. Ideal for young IT professionals starting their career in Hyderabad. Affordable deposit and clean society.',
      propertyType: 'APARTMENT',
      bhk: 1,
      bathrooms: 1,
      floorNumber: 2,
      totalFloors: 5,
      areaSqft: 620,
      furnishing: 'UNFURNISHED',
      rent: 11000,
      deposit: 25000,
      maintenance: 800,
      tenantPref: 'BACHELOR_ONLY',
      city: 'Hyderabad',
      area: 'Kondapur',
      state: 'Telangana',
      pincode: '500084',
      lat: 17.4699,
      lng: 78.3578,
      images: [
        { url: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Elevator / Lift', '24/7 Power Backup', 'Gated Security & CCTV']
    },

    // --- PUNE PROPERTIES ---
    {
      title: 'Charming 2 BHK in Kalyani Nagar with River View',
      desc: 'Scenic riverside property in Kalyani Nagar. Proximity to Trump Towers, Bishop School, and leading IT hubs. Lush green gated premises.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 4,
      totalFloors: 9,
      areaSqft: 1150,
      furnishing: 'FURNISHED',
      rent: 22000,
      deposit: 60000,
      maintenance: 2000,
      tenantPref: 'FAMILY_ONLY',
      city: 'Pune',
      area: 'Kalyani Nagar',
      state: 'Maharashtra',
      pincode: '411006',
      lat: 18.5463,
      lng: 73.9034,
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', type: 'LIVING_ROOM' },
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Covered Car Parking', '24/7 Power Backup', 'Swimming Pool', 'Fitness Gym', 'Spacious Balcony']
    },
    {
      title: 'Trendy 1 BHK Studio in Viman Nagar near Symbiosis',
      desc: 'Surrounded by trendy cafes, Phoenix Marketcity mall, and university colleges. Complete with refrigerator, washing machine, study table, and fiber internet.',
      propertyType: 'APARTMENT',
      bhk: 1,
      bathrooms: 1,
      floorNumber: 3,
      totalFloors: 6,
      areaSqft: 580,
      furnishing: 'FURNISHED',
      rent: 14500,
      deposit: 30000,
      maintenance: 1200,
      tenantPref: 'STUDENT_ONLY',
      city: 'Pune',
      area: 'Viman Nagar',
      state: 'Maharashtra',
      pincode: '411014',
      lat: 18.5679,
      lng: 73.9143,
      images: [
        { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Elevator / Lift', 'Gated Security & CCTV', 'Water Purifier (RO)']
    },
    {
      title: 'Spacious 2 BHK in Hinjewadi Phase 1 IT Park',
      desc: 'Walk to work! Located right behind Infosys Circle Hinjewadi. Club house, gym, continuous water and electricity backup, friendly community.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 7,
      totalFloors: 14,
      areaSqft: 1080,
      furnishing: 'SEMI_FURNISHED',
      rent: 16000,
      deposit: 40000,
      maintenance: 1800,
      tenantPref: 'BACHELOR_ONLY',
      city: 'Pune',
      area: 'Hinjewadi',
      state: 'Maharashtra',
      pincode: '411057',
      lat: 18.5913,
      lng: 73.7389,
      images: [
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', 'Fitness Gym', 'Elevator / Lift', '24/7 Power Backup', 'Gated Security & CCTV']
    },
    {
      title: 'Modern 3 BHK Luxury Flat in Baner High Street',
      desc: 'Prime Baner location with designer interiors, wooden flooring in master bedroom, double glazed soundproof windows, and 2 parking spaces.',
      propertyType: 'APARTMENT',
      bhk: 3,
      bathrooms: 3,
      floorNumber: 5,
      totalFloors: 11,
      areaSqft: 1650,
      furnishing: 'FURNISHED',
      rent: 32000,
      deposit: 90000,
      maintenance: 2800,
      tenantPref: 'FAMILY_ONLY',
      city: 'Pune',
      area: 'Baner',
      state: 'Maharashtra',
      pincode: '411045',
      lat: 18.5590,
      lng: 73.7868,
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Swimming Pool', 'Fitness Gym', 'Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Spacious Balcony']
    },
    {
      title: 'Affordable 2 BHK in Wakad near Mumbai-Pune Expressway',
      desc: 'Great connectivity to Hinjewadi and Pune city. Spacious rooms, children play area, solar water heater installed.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 2,
      totalFloors: 8,
      areaSqft: 980,
      furnishing: 'UNFURNISHED',
      rent: 14000,
      deposit: 35000,
      maintenance: 1500,
      tenantPref: 'ANY',
      city: 'Pune',
      area: 'Wakad',
      state: 'Maharashtra',
      pincode: '411057',
      lat: 18.5987,
      lng: 73.7681,
      images: [
        { url: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Gated Security & CCTV']
    },

    // --- DELHI NCR PROPERTIES ---
    {
      title: 'Executive 2 BHK near DLF Cyber City Gurugram',
      desc: 'Walking distance to Cyber Hub and Rapid Metro. 100% power backup, smart electronic lock, 55 inch Smart TV, and modular kitchen with microwave & chimney.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 6,
      totalFloors: 16,
      areaSqft: 1220,
      furnishing: 'FURNISHED',
      rent: 26000,
      deposit: 60000,
      maintenance: 2500,
      tenantPref: 'BACHELOR_ONLY',
      city: 'Delhi NCR',
      area: 'Gurugram Cyber City',
      state: 'Haryana',
      pincode: '122002',
      lat: 28.4906,
      lng: 77.0894,
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', type: 'LIVING_ROOM' },
        { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Air Conditioner (AC)', 'Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Gated Security & CCTV']
    },
    {
      title: 'Comfortable 2 BHK Apartment in Noida Sector 62',
      desc: 'Opposite institutional and IT area. Very close to Electronic City Metro Station Noida. High security society with parks and grocery store inside.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 5,
      totalFloors: 10,
      areaSqft: 1100,
      furnishing: 'SEMI_FURNISHED',
      rent: 16500,
      deposit: 40000,
      maintenance: 2000,
      tenantPref: 'ANY',
      city: 'Delhi NCR',
      area: 'Noida Sector 62',
      state: 'Uttar Pradesh',
      pincode: '201309',
      lat: 28.6280,
      lng: 77.3649,
      images: [
        { url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Gated Security & CCTV', 'Modular Kitchen & Piped Gas']
    },
    {
      title: 'Premium 3 BHK Builder Floor in South Extension Delhi',
      desc: 'Prime South Delhi location. Wide tree-lined road, dedicated stilt car parking, lift, Italian marble bathrooms, and VRV air conditioning.',
      propertyType: 'INDEPENDENT_HOUSE',
      bhk: 3,
      bathrooms: 3,
      floorNumber: 2,
      totalFloors: 4,
      areaSqft: 1900,
      furnishing: 'FURNISHED',
      rent: 45000,
      deposit: 130000,
      maintenance: 3000,
      tenantPref: 'FAMILY_ONLY',
      city: 'Delhi NCR',
      area: 'South Extension',
      state: 'Delhi',
      pincode: '110049',
      lat: 28.5728,
      lng: 77.2215,
      images: [
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', type: 'EXTERIOR' },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Air Conditioner (AC)', 'Spacious Balcony', 'Gated Security & CCTV']
    },
    {
      title: 'Spacious 3 BHK in DDA Sector 10 Dwarka',
      desc: 'Close to Dwarka Sector 10 Metro station and Venkateshwar Hospital. Serene, peaceful neighborhood with abundant sunlight and dual balconies.',
      propertyType: 'APARTMENT',
      bhk: 3,
      bathrooms: 2,
      floorNumber: 3,
      totalFloors: 7,
      areaSqft: 1450,
      furnishing: 'SEMI_FURNISHED',
      rent: 23000,
      deposit: 55000,
      maintenance: 2200,
      tenantPref: 'FAMILY_ONLY',
      city: 'Delhi NCR',
      area: 'Dwarka',
      state: 'Delhi',
      pincode: '110075',
      lat: 28.5813,
      lng: 77.0594,
      images: [
        { url: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Covered Car Parking', 'Elevator / Lift', 'Gated Security & CCTV', 'Spacious Balcony', 'Modular Kitchen & Piped Gas']
    },
    {
      title: 'Cozy 1 BHK in Sector 14 Gurugram near Old DLF',
      desc: 'Self-contained 1 BHK unit in Sector 14 Gurugram. Walking distance to local markets, shopping complexes, and bus stops.',
      propertyType: 'APARTMENT',
      bhk: 1,
      bathrooms: 1,
      floorNumber: 1,
      totalFloors: 3,
      areaSqft: 550,
      furnishing: 'SEMI_FURNISHED',
      rent: 12500,
      deposit: 25000,
      maintenance: 700,
      tenantPref: 'BACHELOR_ONLY',
      city: 'Delhi NCR',
      area: 'Gurugram Sector 14',
      state: 'Haryana',
      pincode: '122001',
      lat: 28.4721,
      lng: 77.0428,
      images: [
        { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80', type: 'BEDROOM' }
      ],
      amenities: ['Wi-Fi / High-Speed Internet', 'Water Purifier (RO)', 'Gated Security & CCTV']
    },
    {
      title: 'Premium 2 BHK in Golf Course Extension Road Gurugram',
      desc: 'Ultra luxury high-rise condominium with clubhouse, infinity pool, tennis court, jogging track, and 3-tier security.',
      propertyType: 'APARTMENT',
      bhk: 2,
      bathrooms: 2,
      floorNumber: 12,
      totalFloors: 26,
      areaSqft: 1350,
      furnishing: 'FURNISHED',
      rent: 31000,
      deposit: 80000,
      maintenance: 3500,
      tenantPref: 'ANY',
      city: 'Delhi NCR',
      area: 'Golf Course Extension',
      state: 'Haryana',
      pincode: '122018',
      lat: 28.4118,
      lng: 77.0827,
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Swimming Pool', 'Fitness Gym', 'Covered Car Parking', 'Elevator / Lift', '24/7 Power Backup', 'Air Conditioner (AC)', 'Clubhouse & Party Hall']
    },
    {
      title: 'Budget 1 BHK Apartment in Noida Extension Sector 1',
      desc: 'Affordable modern living in newly constructed high-rise township. 24x7 security, water supply, and easy connectivity to Greater Noida & Noida.',
      propertyType: 'APARTMENT',
      bhk: 1,
      bathrooms: 1,
      floorNumber: 8,
      totalFloors: 19,
      areaSqft: 600,
      furnishing: 'UNFURNISHED',
      rent: 8500,
      deposit: 18000,
      maintenance: 1200,
      tenantPref: 'ANY',
      city: 'Delhi NCR',
      area: 'Noida Extension',
      state: 'Uttar Pradesh',
      pincode: '201306',
      lat: 28.5891,
      lng: 77.4410,
      images: [
        { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&q=80', type: 'LIVING_ROOM' }
      ],
      amenities: ['Elevator / Lift', '24/7 Power Backup', 'Gated Security & CCTV', 'Covered Car Parking']
    }
  ];

  const createdProperties = [];
  for (let i = 0; i < propertiesList.length; i++) {
    const p = propertiesList[i];
    const assignedOwner = ownerProfiles[i % ownerProfiles.length];

    const property = await prisma.property.create({
      data: {
        ownerId: assignedOwner.id,
        title: p.title,
        description: p.desc,
        propertyType: p.propertyType,
        bhk: p.bhk,
        bathrooms: p.bathrooms,
        floorNumber: p.floorNumber,
        totalFloors: p.totalFloors,
        areaSqft: p.areaSqft,
        furnishingStatus: p.furnishing,
        monthlyRent: p.rent,
        securityDeposit: p.deposit,
        maintenanceCharge: p.maintenance,
        tenantPreference: p.tenantPref,
        status: 'AVAILABLE',
        verificationStatus: 'APPROVED',
        viewsCount: 45 + i * 7,
        location: {
          create: {
            address: `${100 + i * 5}, 4th Main Road, ${p.area}`,
            area: p.area,
            city: p.city,
            state: p.state,
            pincode: p.pincode,
            latitude: p.lat,
            longitude: p.lng
          }
        },
        images: {
          create: p.images.map((img, idx) => ({
            url: img.url,
            imageType: img.type,
            displayOrder: idx
          }))
        },
        amenities: {
          create: p.amenities.map(name => ({
            amenityId: amenityMap[name]
          }))
        },
        verifications: {
          create: {
            reviewedBy: adminUser.id,
            decision: 'APPROVED',
            reason: 'All property documents and ownership deeds verified successfully.',
            reviewedAt: new Date()
          }
        }
      },
      include: { location: true, images: true, amenities: true }
    });
    createdProperties.push(property);
  }

  console.log(`🏠 Created ${createdProperties.length} verified properties across 5 metros.`);

  // 7. Seed Sample Applications, Leases, Invoices, Payments, Receipts, and Maintenance
  // Active Rental 1: Tenant 1 in Property 0 (Koramangala 2 BHK)
  const prop1 = createdProperties[0];
  const tenant1 = tenantProfiles[0];
  const owner1 = ownerProfiles[0];

  const app1 = await prisma.application.create({
    data: {
      tenantId: tenant1.id,
      propertyId: prop1.id,
      moveInDate: new Date('2026-01-01'),
      occupants: 2,
      message: 'Hello, I am a software engineer working in Koramangala. Looking for a neat 2 BHK home.',
      status: 'APPROVED'
    }
  });

  const rental1 = await prisma.rental.create({
    data: {
      propertyId: prop1.id,
      tenantId: tenant1.id,
      ownerId: owner1.id,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      monthlyRent: prop1.monthlyRent,
      securityDeposit: prop1.securityDeposit,
      maintenanceCharge: prop1.maintenanceCharge,
      rentDueDay: 5,
      status: 'ACTIVE',
      agreement: {
        create: {
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          rent: prop1.monthlyRent,
          deposit: prop1.securityDeposit,
          noticePeriodMonths: 1,
          specialTerms: 'No loud music after 10 PM. Maintenance included in regular schedule.',
          documentUrl: '/uploads/receipts/agreement_demo.pdf',
          signedByTenant: true,
          signedByOwner: true,
          signedAt: new Date('2026-01-01')
        }
      }
    }
  });

  // Mark property as RENTED
  await prisma.property.update({
    where: { id: prop1.id },
    data: { status: 'RENTED' }
  });

  // Create Past Paid Invoices + Current Pending Invoice for Rental 1
  // Past Month Paid Invoice (July 2026)
  const invoiceJuly = await prisma.rentInvoice.create({
    data: {
      rentalId: rental1.id,
      billingMonth: '2026-07',
      dueDate: new Date('2026-07-05'),
      baseRent: prop1.monthlyRent,
      maintenance: prop1.maintenanceCharge,
      totalAmount: prop1.monthlyRent + prop1.maintenanceCharge,
      status: 'PAID'
    }
  });

  const paymentJuly = await prisma.payment.create({
    data: {
      invoiceId: invoiceJuly.id,
      tenantId: tenant1.id,
      ownerId: owner1.id,
      amount: invoiceJuly.totalAmount,
      currency: 'INR',
      gateway: 'RAZORPAY_SANDBOX',
      gatewayOrderId: 'order_M1k2J3l4N5o6P7',
      gatewayPaymentId: 'pay_M1k2J3l4N5o6P7_JUL',
      gatewaySignature: 'sig_verified_mock_hash_jul_2026',
      status: 'SUCCESS',
      paidAt: new Date('2026-07-04'),
      receipt: {
        create: {
          receiptNumber: 'REC-202607-0001',
          tenantName: 'Aarav Patel',
          propertyName: prop1.title,
          billingPeriod: 'July 2026',
          amountPaid: invoiceJuly.totalAmount,
          paymentDate: new Date('2026-07-04'),
          transactionReference: 'pay_M1k2J3l4N5o6P7_JUL',
          pdfUrl: '/uploads/receipts/REC-202607-0001.pdf'
        }
      }
    }
  });

  // Current Month Paid Invoice (August 2026)
  const invoiceAug = await prisma.rentInvoice.create({
    data: {
      rentalId: rental1.id,
      billingMonth: '2026-08',
      dueDate: new Date('2026-08-05'),
      baseRent: prop1.monthlyRent,
      maintenance: prop1.maintenanceCharge,
      totalAmount: prop1.monthlyRent + prop1.maintenanceCharge,
      status: 'PAID'
    }
  });

  const paymentAug = await prisma.payment.create({
    data: {
      invoiceId: invoiceAug.id,
      tenantId: tenant1.id,
      ownerId: owner1.id,
      amount: invoiceAug.totalAmount,
      currency: 'INR',
      gateway: 'RAZORPAY_SANDBOX',
      gatewayOrderId: 'order_A8b7C6d5E4f3G2',
      gatewayPaymentId: 'pay_A8b7C6d5E4f3G2_AUG',
      gatewaySignature: 'sig_verified_mock_hash_aug_2026',
      status: 'SUCCESS',
      paidAt: new Date('2026-08-03'),
      receipt: {
        create: {
          receiptNumber: 'REC-202608-0001',
          tenantName: 'Aarav Patel',
          propertyName: prop1.title,
          billingPeriod: 'August 2026',
          amountPaid: invoiceAug.totalAmount,
          paymentDate: new Date('2026-08-03'),
          transactionReference: 'pay_A8b7C6d5E4f3G2_AUG',
          pdfUrl: '/uploads/receipts/REC-202608-0001.pdf'
        }
      }
    }
  });

  // Next Month Pending Invoice (September 2026 - Ready for Live Demo Payment)
  const invoiceSept = await prisma.rentInvoice.create({
    data: {
      rentalId: rental1.id,
      billingMonth: '2026-09',
      dueDate: new Date('2026-09-05'),
      baseRent: prop1.monthlyRent,
      maintenance: prop1.maintenanceCharge,
      totalAmount: prop1.monthlyRent + prop1.maintenanceCharge,
      status: 'PENDING'
    }
  });

  // 8. Maintenance Request
  await prisma.maintenanceRequest.create({
    data: {
      rentalId: rental1.id,
      tenantId: tenant1.id,
      propertyId: prop1.id,
      category: 'PLUMBING',
      description: 'Minor tap leakage in the master bathroom sink. Needs washer replacement.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS'
    }
  });

  // 9. Property Reviews
  await prisma.review.create({
    data: {
      reviewerId: tenant1.userId,
      propertyId: prop1.id,
      rentalId: rental1.id,
      rating: 5,
      cleanlinessRating: 5,
      locationRating: 5,
      ownerRating: 5,
      comment: 'Excellent property and very cooperative owner. The society is peaceful with top-notch security.'
    }
  });

  // 10. Favorites & Notifications
  await prisma.favorite.create({
    data: {
      tenantId: tenant1.id,
      propertyId: createdProperties[1].id // Indiranagar Penthouse
    }
  });

  await prisma.favorite.create({
    data: {
      tenantId: tenant1.id,
      propertyId: createdProperties[2].id // HSR Studio
    }
  });

  await prisma.notification.create({
    data: {
      userId: tenant1.userId,
      type: 'RENT_DUE',
      title: 'Rent Invoice Generated for September 2026',
      message: `Your rent invoice of ₹${invoiceSept.totalAmount} for September 2026 is due on 05-Sep-2026.`,
      link: '/tenant/invoices',
      isRead: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: owner1.userId,
      type: 'PAYMENT_SUCCESS',
      title: 'Rent Payment Received for August 2026',
      message: `Tenant Aarav Patel has paid ₹${invoiceAug.totalAmount} for August 2026.`,
      link: '/owner/payments',
      isRead: true
    }
  });

  // 11. Platform Complaint (for Admin Moderation Demo)
  await prisma.complaint.create({
    data: {
      userId: tenantProfiles[1].userId,
      propertyId: createdProperties[3].id,
      category: 'LISTING_DISCREPANCY',
      description: 'Parking charges were not mentioned clearly in the initial listing summary.',
      priority: 'LOW',
      status: 'OPEN'
    }
  });

  // 12. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'PROPERTY_VERIFICATION_APPROVED',
      entityType: 'Property',
      entityId: prop1.id,
      ipAddress: '127.0.0.1',
      metadata: { propertyTitle: prop1.title, decision: 'APPROVED' }
    }
  });

  console.log('✅ Comprehensive Seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('👑 Admin: admin@smartrental.com / Admin@12345');
  console.log('🔑 Owner: owner1@smartrental.com / Owner@12345');
  console.log('👤 Tenant: tenant1@smartrental.com / Tenant@12345');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
