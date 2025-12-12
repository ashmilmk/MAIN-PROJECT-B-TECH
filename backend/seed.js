const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dyslexia_detection';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB for seeding...');
  
  // Check if admin user exists
  const adminExists = await User.findOne({ email: 'admin@example.com' });
  if (adminExists) {
    console.log('Admin user already exists.');
  } else {
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created.');
  }
  
  // Create a sample student if none exists
  const studentExists = await User.findOne({ email: 'student@example.com' });
  if (studentExists) {
    console.log('Student user already exists.');
  } else {
    const student = new User({
      firstName: 'Sample',
      lastName: 'Student',
      email: 'student@example.com',
      password: 'StudentPassword123!',
      role: 'student',
      studentId: 'STU12345',
      grade: '5'
    });
    await student.save();
    console.log('Student user created.');
  }

  console.log('Seeding completed.');
  process.exit(0);
})
.catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
