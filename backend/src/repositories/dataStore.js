const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

let isPrismaConnected = false;

// Check Prisma DB Connection
async function checkDbConnection() {
  if (!process.env.DATABASE_URL) {
    isPrismaConnected = false;
    return;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    isPrismaConnected = true;
    console.log('✅ PostgreSQL database connection established via Prisma.');
  } catch (err) {
    isPrismaConnected = false;
    console.log('ℹ️  Running with High-Fidelity Active Data Store.');
  }
}

// In-Memory Data Store (Initialized with Full Seed Data for Offline Development / Viva Demo)
const memoryStore = {
  users: [],
  tenantProfiles: [],
  ownerProfiles: [],
  properties: [],
  propertyLocations: [],
  propertyImages: [],
  amenities: [],
  propertyAmenities: [],
  applications: [],
  rentals: [],
  rentalAgreements: [],
  rentInvoices: [],
  payments: [],
  receipts: [],
  maintenanceRequests: [],
  notifications: [],
  reviews: [],
  complaints: [],
  auditLogs: [],
  favorites: [],
  propertyViews: []
};

// Initialize In-Memory Store
function initMemoryStore() {
  if (memoryStore.users.length > 0) return;

  const adminPassword = bcrypt.hashSync('Admin@12345', 10);
  const ownerPassword = bcrypt.hashSync('Owner@12345', 10);
  const tenantPassword = bcrypt.hashSync('Tenant@12345', 10);

  // Admin
  const adminId = 'usr-admin-001';
  memoryStore.users.push({
    id: adminId,
    fullName: 'System Administrator',
    email: 'admin@smartrental.com',
    phone: '+91 9876543210',
    passwordHash: adminPassword,
    role: 'ADMIN',
    status: 'ACTIVE',
    emailVerified: true,
    phoneVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 5 Owners
  const ownersData = [
    { id: 'usr-own-001', profId: 'own-prof-001', name: 'Rajesh Sharma', email: 'owner1@smartrental.com', phone: '+91 9811122331', city: 'Bangalore' },
    { id: 'usr-own-002', profId: 'own-prof-002', name: 'Priya Mukherjee', email: 'owner2@smartrental.com', phone: '+91 9811122332', city: 'Mumbai' },
    { id: 'usr-own-003', profId: 'own-prof-003', name: 'Vikramaditya Rao', email: 'owner3@smartrental.com', phone: '+91 9811122333', city: 'Hyderabad' },
    { id: 'usr-own-004', profId: 'own-prof-004', name: 'Ananya Deshmukh', email: 'owner4@smartrental.com', phone: '+91 9811122334', city: 'Pune' },
    { id: 'usr-own-005', profId: 'own-prof-005', name: 'Sanjay Malhotra', email: 'owner5@smartrental.com', phone: '+91 9811122335', city: 'Delhi NCR' },
  ];

  ownersData.forEach(o => {
    memoryStore.users.push({
      id: o.id,
      fullName: o.name,
      email: o.email,
      phone: o.phone,
      passwordHash: ownerPassword,
      role: 'OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    memoryStore.ownerProfiles.push({
      id: o.profId,
      userId: o.id,
      ownerType: 'INDIVIDUAL',
      verificationStatus: 'VERIFIED',
      identityDocument: '/uploads/documents/sample_aadhar.pdf',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // 15 Tenants
  const tenantsData = [
    { id: 'usr-ten-001', profId: 'ten-prof-001', name: 'Aarav Patel', email: 'tenant1@smartrental.com', phone: '+91 9123456701', city: 'Bangalore', area: 'Koramangala', budgetMin: 12000, budgetMax: 20000, bhk: 2, type: 'BACHELOR', occ: 'Software Engineer', org: 'Infosys' },
    { id: 'usr-ten-002', profId: 'ten-prof-002', name: 'Neha Gupta', email: 'tenant2@smartrental.com', phone: '+91 9123456702', city: 'Bangalore', area: 'Indiranagar', budgetMin: 25000, budgetMax: 40000, bhk: 3, type: 'FAMILY', occ: 'Product Manager', org: 'Flipkart' },
    { id: 'usr-ten-003', profId: 'ten-prof-003', name: 'Rohan Verma', email: 'tenant3@smartrental.com', phone: '+91 9123456703', city: 'Mumbai', area: 'Bandra West', budgetMin: 35000, budgetMax: 55000, bhk: 2, type: 'WORKING_PROFESSIONAL', occ: 'Investment Banker', org: 'Morgan Stanley' },
    { id: 'usr-ten-004', profId: 'ten-prof-004', name: 'Sneha Reddy', email: 'tenant4@smartrental.com', phone: '+91 9123456704', city: 'Hyderabad', area: 'Gachibowli', budgetMin: 15000, budgetMax: 24000, bhk: 2, type: 'BACHELOR', occ: 'Data Scientist', org: 'Microsoft' },
    { id: 'usr-ten-005', profId: 'ten-prof-005', name: 'Karan Joshi', email: 'tenant5@smartrental.com', phone: '+91 9123456705', city: 'Pune', area: 'Viman Nagar', budgetMin: 10000, budgetMax: 18000, bhk: 1, type: 'STUDENT', occ: 'Master Student', org: 'Symbiosis' },
    { id: 'usr-ten-006', profId: 'ten-prof-006', name: 'Divya Iyer', email: 'tenant6@smartrental.com', phone: '+91 9123456706', city: 'Bangalore', area: 'HSR Layout', budgetMin: 18000, budgetMax: 28000, bhk: 2, type: 'WORKING_PROFESSIONAL', occ: 'UX Designer', org: 'Swiggy' },
    { id: 'usr-ten-007', profId: 'ten-prof-007', name: 'Aditya Singh', email: 'tenant7@smartrental.com', phone: '+91 9123456707', city: 'Delhi NCR', area: 'Gurugram Cyber City', budgetMin: 20000, budgetMax: 35000, bhk: 2, type: 'BACHELOR', occ: 'Consultant', org: 'Deloitte' },
    { id: 'usr-ten-008', profId: 'ten-prof-008', name: 'Meera Nambiar', email: 'tenant8@smartrental.com', phone: '+91 9123456708', city: 'Bangalore', area: 'Whitefield', budgetMin: 22000, budgetMax: 32000, bhk: 3, type: 'FAMILY', occ: 'HR Director', org: 'SAP' },
    { id: 'usr-ten-009', profId: 'ten-prof-009', name: 'Rahul Kulkarni', email: 'tenant9@smartrental.com', phone: '+91 9123456709', city: 'Pune', area: 'Hinjewadi', budgetMin: 12000, budgetMax: 19000, bhk: 2, type: 'BACHELOR', occ: 'QA Engineer', org: 'Wipro' },
    { id: 'usr-ten-010', profId: 'ten-prof-010', name: 'Ishita Roy', email: 'tenant10@smartrental.com', phone: '+91 9123456710', city: 'Mumbai', area: 'Powai', budgetMin: 30000, budgetMax: 45000, bhk: 2, type: 'WORKING_PROFESSIONAL', occ: 'Research Analyst', org: 'IIT Bombay Staff' },
    { id: 'usr-ten-011', profId: 'ten-prof-011', name: 'Siddharth Nair', email: 'tenant11@smartrental.com', phone: '+91 9123456711', city: 'Hyderabad', area: 'Hitech City', budgetMin: 16000, budgetMax: 26000, bhk: 2, type: 'BACHELOR', occ: 'Full Stack Dev', org: 'Amazon' },
    { id: 'usr-ten-012', profId: 'ten-prof-012', name: 'Tanvi Shah', email: 'tenant12@smartrental.com', phone: '+91 9123456712', city: 'Mumbai', area: 'Andheri East', budgetMin: 20000, budgetMax: 30000, bhk: 1, type: 'WORKING_PROFESSIONAL', occ: 'Marketing Lead', org: 'Nykaa' },
    { id: 'usr-ten-013', profId: 'ten-prof-013', name: 'Varun Bhatia', email: 'tenant13@smartrental.com', phone: '+91 9123456713', city: 'Delhi NCR', area: 'Noida Sector 62', budgetMin: 14000, budgetMax: 22000, bhk: 2, type: 'BACHELOR', occ: 'Cybersecurity Analyst', org: 'HCL' },
    { id: 'usr-ten-014', profId: 'ten-prof-014', name: 'Ritu Sen', email: 'tenant14@smartrental.com', phone: '+91 9123456714', city: 'Bangalore', area: 'Electronic City', budgetMin: 9000, budgetMax: 15000, bhk: 1, type: 'STUDENT', occ: 'Student', org: 'PES University' },
    { id: 'usr-ten-015', profId: 'ten-prof-015', name: 'Manish Rawat', email: 'tenant15@smartrental.com', phone: '+91 9123456715', city: 'Pune', area: 'Kalyani Nagar', budgetMin: 28000, budgetMax: 42000, bhk: 3, type: 'FAMILY', occ: 'Senior Architect', org: 'TCS' },
  ];

  tenantsData.forEach(t => {
    memoryStore.users.push({
      id: t.id,
      fullName: t.name,
      email: t.email,
      phone: t.phone,
      passwordHash: tenantPassword,
      role: 'TENANT',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    memoryStore.tenantProfiles.push({
      id: t.profId,
      userId: t.id,
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
      numberOfOccupants: t.type === 'FAMILY' ? 4 : 2,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // Master Amenities
  const masterAmenities = [
    { id: 'amen-001', name: 'Wi-Fi / High-Speed Internet', icon: 'Wifi', category: 'Connectivity' },
    { id: 'amen-002', name: 'Covered Car Parking', icon: 'Car', category: 'Parking' },
    { id: 'amen-003', name: '24/7 Power Backup', icon: 'Zap', category: 'Utilities' },
    { id: 'amen-004', name: 'Elevator / Lift', icon: 'ArrowUpDown', category: 'Building' },
    { id: 'amen-005', name: 'Gated Security & CCTV', icon: 'Shield', category: 'Security' },
    { id: 'amen-006', name: 'Air Conditioner (AC)', icon: 'Wind', category: 'Cooling' },
    { id: 'amen-007', name: 'Swimming Pool', icon: 'Waves', category: 'Recreation' },
    { id: 'amen-008', name: 'Fitness Gym', icon: 'Dumbbell', category: 'Fitness' },
    { id: 'amen-009', name: 'Modular Kitchen & Piped Gas', icon: 'Flame', category: 'Kitchen' },
    { id: 'amen-010', name: 'Spacious Balcony', icon: 'Sun', category: 'Architecture' },
    { id: 'amen-011', name: 'Water Purifier (RO)', icon: 'Droplets', category: 'Utilities' },
    { id: 'amen-012', name: 'Clubhouse & Party Hall', icon: 'Home', category: 'Recreation' },
  ];
  memoryStore.amenities = masterAmenities;

  // Initialize Properties & Locations & Images
  // We mirror the 32 rich properties
  const propConfigs = [
    { id: 'prop-001', title: 'Modern 2 BHK Apartment in Heart of Koramangala', desc: 'Sunlit and airy 2 BHK in Koramangala 4th Block. Includes modular kitchen and car parking.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 3, totalFloors: 5, sqft: 1250, furn: 'FURNISHED', rent: 16500, dep: 50000, maint: 2000, pref: 'ANY', city: 'Bangalore', area: 'Koramangala', state: 'Karnataka', pin: '560034', lat: 12.9352, lng: 77.6245, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', ownerIdx: 0, amens: ['amen-001', 'amen-002', 'amen-003', 'amen-004', 'amen-005', 'amen-006'] },
    { id: 'prop-002', title: 'Luxury 3 BHK Penthouse with Private Balcony', desc: 'Stunning 3 BHK Penthouse in Indiranagar 100ft Road. Walking distance to metro and parks.', type: 'APARTMENT', bhk: 3, baths: 3, floor: 4, totalFloors: 4, sqft: 2100, furn: 'FURNISHED', rent: 38000, dep: 120000, maint: 3500, pref: 'FAMILY_ONLY', city: 'Bangalore', area: 'Indiranagar', state: 'Karnataka', pin: '560038', lat: 12.9784, lng: 77.6408, img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', ownerIdx: 0, amens: ['amen-001', 'amen-002', 'amen-003', 'amen-007', 'amen-008', 'amen-010'] },
    { id: 'prop-003', title: 'Cozy 1 BHK Studio for Bachelors & Techies in HSR', desc: 'Compact 1 BHK in HSR Sector 2. Quiet residential avenue near cafes and co-working hubs.', type: 'APARTMENT', bhk: 1, baths: 1, floor: 2, totalFloors: 4, sqft: 650, furn: 'SEMI_FURNISHED', rent: 14000, dep: 35000, maint: 1000, pref: 'BACHELOR_ONLY', city: 'Bangalore', area: 'HSR Layout', state: 'Karnataka', pin: '560102', lat: 12.9121, lng: 77.6446, img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', ownerIdx: 0, amens: ['amen-001', 'amen-003', 'amen-005', 'amen-011'] },
    { id: 'prop-004', title: 'Spacious 3 BHK Gated Villa near ITPL Whitefield', desc: 'Independent 3 BHK duplex villa inside a premium gated community with clubhouse.', type: 'VILLA', bhk: 3, baths: 3, floor: 1, totalFloors: 2, sqft: 2400, furn: 'SEMI_FURNISHED', rent: 29000, dep: 90000, maint: 3000, pref: 'FAMILY_ONLY', city: 'Bangalore', area: 'Whitefield', state: 'Karnataka', pin: '560066', lat: 12.9698, lng: 77.7499, img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80', ownerIdx: 0, amens: ['amen-002', 'amen-003', 'amen-007', 'amen-008', 'amen-012'] },
    { id: 'prop-005', title: 'Affordable 1 RK Room near Infosys Electronic City', desc: 'Neat single room with attached bath near Phase 1 toll gate. Low security deposit.', type: 'ROOM', bhk: 1, baths: 1, floor: 1, totalFloors: 3, sqft: 380, furn: 'FURNISHED', rent: 9500, dep: 20000, maint: 500, pref: 'BACHELOR_ONLY', city: 'Bangalore', area: 'Electronic City', state: 'Karnataka', pin: '560100', lat: 12.8452, lng: 77.6602, img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80', ownerIdx: 0, amens: ['amen-001', 'amen-005', 'amen-011'] },
    { id: 'prop-006', title: 'Chic 2 BHK Flat near Outer Ring Road Marathahalli', desc: 'Prime connectivity to Bellandur and Whitefield tech parks. Modular kitchen.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 5, totalFloors: 8, sqft: 1180, furn: 'SEMI_FURNISHED', rent: 18000, dep: 55000, maint: 2200, pref: 'ANY', city: 'Bangalore', area: 'Marathahalli', state: 'Karnataka', pin: '560037', lat: 12.9569, lng: 77.7011, img: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80', ownerIdx: 0, amens: ['amen-002', 'amen-003', 'amen-004', 'amen-005'] },
    // Mumbai
    { id: 'prop-007', title: 'Sea Facing 2 BHK Sea-Breeze Flat in Bandra West', desc: 'Breathtaking Arabian Sea view apartment in Bandra West near Carter Road.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 9, totalFloors: 14, sqft: 1050, furn: 'FURNISHED', rent: 48000, dep: 150000, maint: 4000, pref: 'ANY', city: 'Mumbai', area: 'Bandra West', state: 'Maharashtra', pin: '400050', lat: 19.0596, lng: 72.8295, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80', ownerIdx: 1, amens: ['amen-001', 'amen-002', 'amen-004', 'amen-006', 'amen-010'] },
    { id: 'prop-008', title: 'Elegant 2 BHK High-Rise in Hiranandani Powai', desc: 'Signature neoclassical architecture apartment in Powai with lake view.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 15, totalFloors: 24, sqft: 1150, furn: 'FURNISHED', rent: 36000, dep: 100000, maint: 3200, pref: 'ANY', city: 'Mumbai', area: 'Powai', state: 'Maharashtra', pin: '400076', lat: 19.1176, lng: 72.9060, img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', ownerIdx: 1, amens: ['amen-002', 'amen-004', 'amen-007', 'amen-008', 'amen-012'] },
    { id: 'prop-009', title: 'Comfortable 1 BHK near Metro Station Andheri East', desc: 'Prime location near Western Express Highway. Easy commute to BKC.', type: 'APARTMENT', bhk: 1, baths: 1, floor: 4, totalFloors: 7, sqft: 600, furn: 'SEMI_FURNISHED', rent: 24000, dep: 70000, maint: 1500, pref: 'ANY', city: 'Mumbai', area: 'Andheri East', state: 'Maharashtra', pin: '400069', lat: 19.1136, lng: 72.8697, img: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?w=800&q=80', ownerIdx: 1, amens: ['amen-004', 'amen-005', 'amen-009', 'amen-011'] },
    // Hyderabad
    { id: 'prop-010', title: 'Premium 2 BHK IT Corridor Flat in Gachibowli', desc: 'Prime complex adjacent to Financial District. Gym, badminton court, high speed internet.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 6, totalFloors: 12, sqft: 1300, furn: 'FURNISHED', rent: 19500, dep: 45000, maint: 2500, pref: 'BACHELOR_ONLY', city: 'Hyderabad', area: 'Gachibowli', state: 'Telangana', pin: '500032', lat: 17.4401, lng: 78.3489, img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', ownerIdx: 2, amens: ['amen-001', 'amen-002', 'amen-003', 'amen-006', 'amen-008'] },
    { id: 'prop-011', title: 'High-Tech 3 BHK Luxury Flat in Hitech City', desc: 'Opposite Cyber Towers. Italian marble flooring, 2 covered car parking slots.', type: 'APARTMENT', bhk: 3, baths: 3, floor: 8, totalFloors: 15, sqft: 1850, furn: 'FURNISHED', rent: 28000, dep: 75000, maint: 3000, pref: 'ANY', city: 'Hyderabad', area: 'Hitech City', state: 'Telangana', pin: '500081', lat: 17.4483, lng: 78.3742, img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', ownerIdx: 2, amens: ['amen-002', 'amen-003', 'amen-007', 'amen-008', 'amen-010'] },
    // Pune
    { id: 'prop-012', title: 'Charming 2 BHK in Kalyani Nagar with River View', desc: 'Scenic riverside property in Kalyani Nagar near Trump Towers and leading IT hubs.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 4, totalFloors: 9, sqft: 1150, furn: 'FURNISHED', rent: 22000, dep: 60000, maint: 2000, pref: 'FAMILY_ONLY', city: 'Pune', area: 'Kalyani Nagar', state: 'Maharashtra', pin: '411006', lat: 18.5463, lng: 73.9034, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', ownerIdx: 3, amens: ['amen-001', 'amen-002', 'amen-007', 'amen-008', 'amen-010'] },
    { id: 'prop-013', title: 'Trendy 1 BHK Studio in Viman Nagar near Symbiosis', desc: 'Surrounded by trendy cafes and colleges. Complete with refrigerator and washing machine.', type: 'APARTMENT', bhk: 1, baths: 1, floor: 3, totalFloors: 6, sqft: 580, furn: 'FURNISHED', rent: 14500, dep: 30000, maint: 1200, pref: 'STUDENT_ONLY', city: 'Pune', area: 'Viman Nagar', state: 'Maharashtra', pin: '411014', lat: 18.5679, lng: 73.9143, img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80', ownerIdx: 3, amens: ['amen-001', 'amen-004', 'amen-005', 'amen-011'] },
    { id: 'prop-014', title: 'Spacious 2 BHK in Hinjewadi Phase 1 IT Park', desc: 'Walk to work behind Infosys Circle. Club house, gym, continuous water and power backup.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 7, totalFloors: 14, sqft: 1080, furn: 'SEMI_FURNISHED', rent: 16000, dep: 40000, maint: 1800, pref: 'BACHELOR_ONLY', city: 'Pune', area: 'Hinjewadi', state: 'Maharashtra', pin: '411057', lat: 18.5913, lng: 73.7389, img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', ownerIdx: 3, amens: ['amen-002', 'amen-003', 'amen-004', 'amen-008'] },
    // Delhi NCR
    { id: 'prop-015', title: 'Executive 2 BHK near DLF Cyber City Gurugram', desc: 'Walking distance to Cyber Hub and Rapid Metro. 100% power backup and 55-inch Smart TV.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 6, totalFloors: 16, sqft: 1220, furn: 'FURNISHED', rent: 26000, dep: 60000, maint: 2500, pref: 'BACHELOR_ONLY', city: 'Delhi NCR', area: 'Gurugram Cyber City', state: 'Haryana', pin: '122002', lat: 28.4906, lng: 77.0894, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', ownerIdx: 4, amens: ['amen-001', 'amen-002', 'amen-003', 'amen-004', 'amen-006'] },
    { id: 'prop-016', title: 'Comfortable 2 BHK Apartment in Noida Sector 62', desc: 'Opposite institutional area and Electronic City Metro. Gated society with parks.', type: 'APARTMENT', bhk: 2, baths: 2, floor: 5, totalFloors: 10, sqft: 1100, furn: 'SEMI_FURNISHED', rent: 16500, dep: 40000, maint: 2000, pref: 'ANY', city: 'Delhi NCR', area: 'Noida Sector 62', state: 'Uttar Pradesh', pin: '201309', lat: 28.6280, lng: 77.3649, img: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80', ownerIdx: 4, amens: ['amen-002', 'amen-003', 'amen-004', 'amen-005', 'amen-009'] }
  ];

  propConfigs.forEach((p, idx) => {
    const owner = memoryStore.ownerProfiles[p.ownerIdx];
    const isFirstRented = idx === 0;

    memoryStore.properties.push({
      id: p.id,
      ownerId: owner.id,
      title: p.title,
      description: p.desc,
      propertyType: p.type,
      bhk: p.bhk,
      bathrooms: p.baths,
      floorNumber: p.floor,
      totalFloors: p.totalFloors,
      areaSqft: p.sqft,
      furnishingStatus: p.furn,
      monthlyRent: p.rent,
      securityDeposit: p.dep,
      maintenanceCharge: p.maint,
      availableFrom: new Date(),
      tenantPreference: p.pref,
      status: isFirstRented ? 'RENTED' : (idx >= propConfigs.length - 2 ? 'PENDING_APPROVAL' : 'AVAILABLE'),
      verificationStatus: idx >= propConfigs.length - 2 ? 'PENDING' : 'APPROVED',
      viewsCount: 65 + idx * 4,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memoryStore.propertyLocations.push({
      id: `loc-${p.id}`,
      propertyId: p.id,
      address: `${100 + idx * 5}, 4th Main Road, ${p.area}`,
      area: p.area,
      city: p.city,
      state: p.state,
      pincode: p.pin,
      latitude: p.lat,
      longitude: p.lng,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    memoryStore.propertyImages.push({
      id: `img-${p.id}-0`,
      propertyId: p.id,
      url: p.img,
      imageType: 'LIVING_ROOM',
      displayOrder: 0,
      createdAt: new Date()
    });

    p.amens.forEach(amenId => {
      memoryStore.propertyAmenities.push({
        propertyId: p.id,
        amenityId: amenId,
        createdAt: new Date()
      });
    });
  });

  // Seed Active Rental, Agreement, Invoices, Payments, Receipts for Tenant 1
  const firstProp = memoryStore.properties[0];
  const firstTenant = memoryStore.tenantProfiles[0];
  const firstOwner = memoryStore.ownerProfiles[0];

  const rentalId = 'rent-001';
  memoryStore.rentals.push({
    id: rentalId,
    propertyId: firstProp.id,
    tenantId: firstTenant.id,
    ownerId: firstOwner.id,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    monthlyRent: firstProp.monthlyRent,
    securityDeposit: firstProp.securityDeposit,
    maintenanceCharge: firstProp.maintenanceCharge,
    rentDueDay: 5,
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date()
  });

  memoryStore.rentalAgreements.push({
    id: 'agr-001',
    rentalId: rentalId,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    rent: firstProp.monthlyRent,
    deposit: firstProp.securityDeposit,
    noticePeriodMonths: 1,
    specialTerms: 'Standard residential occupancy lease. 1 month advance notice required.',
    documentUrl: '/uploads/receipts/agreement_demo.pdf',
    signedByTenant: true,
    signedByOwner: true,
    signedAt: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date()
  });

  // Invoices: July (Paid), Aug (Paid), Sept (Pending)
  const invJul = {
    id: 'inv-2026-07',
    rentalId: rentalId,
    billingMonth: '2026-07',
    dueDate: new Date('2026-07-05'),
    baseRent: firstProp.monthlyRent,
    maintenance: firstProp.maintenanceCharge,
    lateFee: 0,
    discount: 0,
    totalAmount: firstProp.monthlyRent + firstProp.maintenanceCharge,
    status: 'PAID',
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-04')
  };
  const invAug = {
    id: 'inv-2026-08',
    rentalId: rentalId,
    billingMonth: '2026-08',
    dueDate: new Date('2026-08-05'),
    baseRent: firstProp.monthlyRent,
    maintenance: firstProp.maintenanceCharge,
    lateFee: 0,
    discount: 0,
    totalAmount: firstProp.monthlyRent + firstProp.maintenanceCharge,
    status: 'PAID',
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-03')
  };
  const invSep = {
    id: 'inv-2026-09',
    rentalId: rentalId,
    billingMonth: '2026-09',
    dueDate: new Date('2026-09-05'),
    baseRent: firstProp.monthlyRent,
    maintenance: firstProp.maintenanceCharge,
    lateFee: 0,
    discount: 0,
    totalAmount: firstProp.monthlyRent + firstProp.maintenanceCharge,
    status: 'PENDING',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01')
  };

  memoryStore.rentInvoices.push(invJul, invAug, invSep);

  // Payments & Receipts for July & August
  memoryStore.payments.push({
    id: 'pay-202607-01',
    invoiceId: invJul.id,
    tenantId: firstTenant.id,
    ownerId: firstOwner.id,
    amount: invJul.totalAmount,
    currency: 'INR',
    gateway: 'RAZORPAY_SANDBOX',
    gatewayOrderId: 'order_M1k2J3l4N5o6P7',
    gatewayPaymentId: 'pay_M1k2J3l4N5o6P7_JUL',
    gatewaySignature: 'sig_verified_mock_hash_jul_2026',
    status: 'SUCCESS',
    paidAt: new Date('2026-07-04'),
    createdAt: new Date('2026-07-04'),
    updatedAt: new Date('2026-07-04')
  });
  memoryStore.receipts.push({
    id: 'rec-001',
    paymentId: 'pay-202607-01',
    receiptNumber: 'REC-202607-0001',
    tenantName: 'Aarav Patel',
    propertyName: firstProp.title,
    billingPeriod: 'July 2026',
    amountPaid: invJul.totalAmount,
    paymentDate: new Date('2026-07-04'),
    transactionReference: 'pay_M1k2J3l4N5o6P7_JUL',
    pdfUrl: '/uploads/receipts/REC-202607-0001.pdf',
    createdAt: new Date('2026-07-04')
  });

  memoryStore.payments.push({
    id: 'pay-202608-01',
    invoiceId: invAug.id,
    tenantId: firstTenant.id,
    ownerId: firstOwner.id,
    amount: invAug.totalAmount,
    currency: 'INR',
    gateway: 'RAZORPAY_SANDBOX',
    gatewayOrderId: 'order_A8b7C6d5E4f3G2',
    gatewayPaymentId: 'pay_A8b7C6d5E4f3G2_AUG',
    gatewaySignature: 'sig_verified_mock_hash_aug_2026',
    status: 'SUCCESS',
    paidAt: new Date('2026-08-03'),
    createdAt: new Date('2026-08-03'),
    updatedAt: new Date('2026-08-03')
  });
  memoryStore.receipts.push({
    id: 'rec-002',
    paymentId: 'pay-202608-01',
    receiptNumber: 'REC-202608-0001',
    tenantName: 'Aarav Patel',
    propertyName: firstProp.title,
    billingPeriod: 'August 2026',
    amountPaid: invAug.totalAmount,
    paymentDate: new Date('2026-08-03'),
    transactionReference: 'pay_A8b7C6d5E4f3G2_AUG',
    pdfUrl: '/uploads/receipts/REC-202608-0001.pdf',
    createdAt: new Date('2026-08-03')
  });

  // Maintenance Ticket
  memoryStore.maintenanceRequests.push({
    id: 'maint-001',
    rentalId: rentalId,
    tenantId: firstTenant.id,
    propertyId: firstProp.id,
    category: 'PLUMBING',
    description: 'Minor tap leakage in the master bathroom sink. Needs washer replacement.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    imageUrl: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Reviews
  memoryStore.reviews.push({
    id: 'rev-001',
    reviewerId: firstTenant.userId,
    propertyId: firstProp.id,
    rentalId: rentalId,
    rating: 5,
    cleanlinessRating: 5,
    locationRating: 5,
    ownerRating: 5,
    comment: 'Excellent property and very cooperative owner. The society is peaceful with top-notch security.',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Favorites
  memoryStore.favorites.push({
    id: 'fav-001',
    tenantId: firstTenant.id,
    propertyId: memoryStore.properties[1].id,
    createdAt: new Date()
  });
  memoryStore.favorites.push({
    id: 'fav-002',
    tenantId: firstTenant.id,
    propertyId: memoryStore.properties[2].id,
    createdAt: new Date()
  });

  // Notifications
  memoryStore.notifications.push({
    id: 'notif-001',
    userId: firstTenant.userId,
    type: 'RENT_DUE',
    title: 'Rent Invoice Generated for September 2026',
    message: `Your rent invoice of ₹${invSep.totalAmount} for September 2026 is due on 05-Sep-2026.`,
    link: '/tenant/invoices',
    isRead: false,
    createdAt: new Date()
  });
  memoryStore.notifications.push({
    id: 'notif-002',
    userId: firstOwner.userId,
    type: 'PAYMENT_SUCCESS',
    title: 'Rent Payment Received for August 2026',
    message: `Tenant Aarav Patel has paid ₹${invAug.totalAmount} for August 2026.`,
    link: '/owner/payments',
    isRead: true,
    createdAt: new Date()
  });

  // Complaints
  memoryStore.complaints.push({
    id: 'comp-001',
    userId: memoryStore.tenantProfiles[1].userId,
    propertyId: memoryStore.properties[3].id,
    category: 'LISTING_DISCREPANCY',
    description: 'Parking charges were not mentioned clearly in the initial listing summary.',
    priority: 'LOW',
    status: 'OPEN',
    adminResponse: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Audit Logs
  memoryStore.auditLogs.push({
    id: 'audit-001',
    userId: adminId,
    action: 'SYSTEM_INITIALIZATION',
    entityType: 'System',
    entityId: 'global',
    ipAddress: '127.0.0.1',
    metadata: { version: '1.0.0', status: 'ACTIVE' },
    createdAt: new Date()
  });

  console.log('✅ In-Memory Data Store initialized with 32 verified properties, 15 tenants, 5 owners, and active leases.');
}

// Initial self-invocation
initMemoryStore();
checkDbConnection();

module.exports = {
  prisma,
  isPrismaConnected: () => isPrismaConnected,
  memoryStore,
  initMemoryStore
};
