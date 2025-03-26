const mongoose = require('mongoose');
const Course = require('../models/course');
const Product = require('../models/product');
const User = require('../models/user');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

// Sample courses data
const coursesData = [
  {
    name: 'Introduction to Computer Science',
    code: 'CS101',
    description: 'An introductory course to computer science covering basic programming concepts, algorithms, and data structures.',
    credits: 3,
    department: 'Computer Science',
    capacity: 50,
    schedule: {
      days: ['Monday', 'Wednesday'],
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      location: 'Science Building, Room 101'
    },
    price: 1200,
    syllabus: 'Introduction to programming using Python, basic algorithms, and data structures.',
    semester: 'Fall',
    year: 2025
  },
  {
    name: 'Calculus I',
    code: 'MATH201',
    description: 'Introduction to differential and integral calculus of functions of one variable.',
    credits: 4,
    department: 'Mathematics',
    capacity: 40,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '11:00 AM',
      endTime: '12:30 PM',
      location: 'Math Building, Room 205'
    },
    price: 1500,
    syllabus: 'Limits, derivatives, integrals, and applications.',
    semester: 'Fall',
    year: 2025
  },
  {
    name: 'Introduction to Psychology',
    code: 'PSYC101',
    description: 'Survey of major topics in psychology, introducing the scientific study of behavior and mental processes.',
    credits: 3,
    department: 'Psychology',
    capacity: 60,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      location: 'Social Sciences Building, Room 302'
    },
    price: 1100,
    syllabus: 'Introduction to psychological theories, research methods, and applications.',
    semester: 'Fall',
    year: 2025
  },
  {
    name: 'Organic Chemistry',
    code: 'CHEM301',
    description: 'Study of carbon compounds, including structure, properties, and reactions of organic molecules.',
    credits: 4,
    department: 'Chemistry',
    capacity: 30,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      location: 'Science Building, Room 205'
    },
    price: 1600,
    syllabus: 'Carbon compounds, functional groups, reaction mechanisms, and synthesis.',
    semester: 'Spring',
    year: 2025
  },
  {
    name: 'World History',
    code: 'HIST101',
    description: 'Survey of world history from ancient civilizations to the modern era.',
    credits: 3,
    department: 'History',
    capacity: 45,
    schedule: {
      days: ['Monday', 'Wednesday'],
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      location: 'Humanities Building, Room 105'
    },
    price: 1100,
    syllabus: 'Ancient civilizations, medieval period, renaissance, industrial revolution, and modern history.',
    semester: 'Spring',
    year: 2025
  },
  {
    name: 'Database Systems',
    code: 'CS440',
    description: 'Introduction to database design, implementation, and management.',
    credits: 3,
    department: 'Computer Science',
    capacity: 35,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      location: 'Science Building, Room 110'
    },
    price: 1300,
    syllabus: 'Relational databases, SQL, normalization, transaction processing, and database administration.',
    semester: 'Fall',
    year: 2025
  }
];

// Sample products data
const productsData = [
  {
    name: 'University Textbook Bundle',
    description: 'A bundle of essential textbooks for first-year students.',
    price: 299.99,
    category: 'Textbooks',
    imageUrl: '/images/products/textbook-bundle.jpg',
    stock: 50,
    sku: 'TXT-BUNDLE-001'
  },
  {
    name: 'Premium Notebook Set',
    description: 'Set of 5 premium notebooks with university logo.',
    price: 24.99,
    category: 'Stationery',
    imageUrl: '/images/products/notebook-set.jpg',
    stock: 100,
    sku: 'STAT-NB-001'
  },
  {
    name: 'Scientific Calculator',
    description: 'Advanced scientific calculator for math and science courses.',
    price: 49.99,
    category: 'Electronics',
    imageUrl: '/images/products/calculator.jpg',
    stock: 75,
    sku: 'ELEC-CALC-001'
  },
  {
    name: 'University Hoodie',
    description: 'Comfortable hoodie with university logo and colors.',
    price: 39.99,
    category: 'Apparel',
    imageUrl: '/images/products/hoodie.jpg',
    stock: 60,
    sku: 'APP-HOOD-001'
  },
  {
    name: 'Wireless Earbuds',
    description: 'High-quality wireless earbuds for studying or leisure.',
    price: 79.99,
    category: 'Electronics',
    imageUrl: '/images/products/earbuds.jpg',
    stock: 40,
    sku: 'ELEC-EAR-001'
  },
  {
    name: 'Laptop Backpack',
    description: 'Durable backpack with laptop compartment and multiple pockets.',
    price: 59.99,
    category: 'Accessories',
    imageUrl: '/images/products/backpack.jpg',
    stock: 55,
    sku: 'ACC-BACK-001'
  },
  {
    name: 'Art Supplies Kit',
    description: 'Complete art supplies kit for art and design students.',
    price: 89.99,
    category: 'Stationery',
    imageUrl: '/images/products/art-kit.jpg',
    stock: 30,
    sku: 'STAT-ART-001'
  },
  {
    name: 'Water Bottle',
    description: 'Insulated water bottle with university logo.',
    price: 19.99,
    category: 'Accessories',
    imageUrl: '/images/products/water-bottle.jpg',
    stock: 120,
    sku: 'ACC-BOT-001'
  }
];

// Sample users data
const usersData = [
  {
    name: 'Admin User',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Faculty Member',
    email: 'faculty@university.edu',
    password: 'faculty123',
    role: 'faculty'
  },
  {
    name: 'Student User',
    email: 'student@university.edu',
    password: 'student123',
    role: 'student'
  }
];

// Seed data function
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await Course.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    
    console.log('Previous data cleared');
    
    // Create users with hashed passwords
    const userPromises = usersData.map(async (userData) => {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      return new User({
        ...userData,
        password: hashedPassword
      }).save();
    });
    
    const users = await Promise.all(userPromises);
    console.log(`${users.length} users created`);
    
    // Create courses
    const facultyUser = users.find(user => user.role === 'faculty');
    
    const coursePromises = coursesData.map(courseData => {
      return new Course({
        ...courseData,
        instructor: facultyUser._id
      }).save();
    });
    
    const courses = await Promise.all(coursePromises);
    console.log(`${courses.length} courses created`);
    
    // Create products
    const products = await Product.insertMany(productsData);
    console.log(`${products.length} products created`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
