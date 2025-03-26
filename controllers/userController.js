const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Application = require('../models/application');
const Course = require('../models/course');
const ShopItem = require('../models/shopitem_temp');
const Assignment = require('../models/assignment');
const Announcement = require('../models/announcement');

// Dashboard
exports.renderDashboardPage = async (req, res) => {
  try {
    // Get user with enrolled courses
    const user = await User.findById(req.session.userId)
      .populate('enrolledCourses');
    
    if (!user) {
      return res.redirect('/login');
    }
    
    // Get enrolled courses
    const enrolledCourses = user.enrolledCourses || [];
    
    // Get upcoming assignments for enrolled courses
    const today = new Date();
    const upcomingAssignments = await Assignment.find({
      course: { $in: enrolledCourses.map(course => course._id) },
      dueDate: { $gte: today }
    })
    .populate('course', 'code name')
    .sort({ dueDate: 1 })
    .limit(5);
    
    // Count pending assignments
    const pendingAssignments = await Assignment.countDocuments({
      course: { $in: enrolledCourses.map(course => course._id) },
      dueDate: { $gte: today }
    });
    
    // Get announcements for enrolled courses and general announcements
    const announcements = await Announcement.find({
      $or: [
        { course: { $in: enrolledCourses.map(course => course._id) } },
        { course: null } // General announcements
      ],
      visibleToStudents: true,
      $or: [
        { expiryDate: { $gte: today } },
        { expiryDate: null }
      ]
    })
    .populate('course', 'code name')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get all courses for browsing
    const allCourses = await Course.find({ status: 'active' })
      .sort({ code: 1 })
      .limit(10);
    
    res.render('student/studentDashboard', { 
      title: 'Student Dashboard', 
      user, 
      enrolledCourses,
      allCourses,
      upcomingAssignments,
      pendingAssignments,
      announcements,
      activeTab: 'dashboard',
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/login');
  }
};

// Authentication Pages
exports.renderLoginPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'Login', activeTab: 'login' });
};

exports.renderRegisterPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { title: 'Register' });
};

// Student Application Page
exports.renderApplicationPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('common/application', { title: 'Apply to University', activeTab: 'apply' });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { 
        title: 'Login',
        error: 'Invalid email or password',
        email,
        activeTab: 'login'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', { 
        title: 'Login',
        error: 'Invalid email or password',
        email,
        activeTab: 'login'
      });
    }

    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;

    // Redirect based on user role
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else if (user.role === 'faculty') {
      res.redirect('/faculty/dashboard');
    } else {
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('auth/login', {
      title: 'Login',
      error: 'Server error. Please try again later.',
      email,
      activeTab: 'login'
    });
  }
};

// Submit Application
exports.submitApplication = async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    dateOfBirth, 
    address, 
    city, 
    state, 
    zipCode, 
    country,
    educationLevel,
    previousSchool,
    gpa,
    desiredProgram,
    personalStatement
  } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('common/application', {
        title: 'Apply to University',
        error: 'An account with this email already exists',
        formData: req.body,
        activeTab: 'apply'
      });
    }
    
    // Create new application
    const application = new Application({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country,
      educationLevel,
      previousSchool,
      gpa: parseFloat(gpa),
      desiredProgram,
      personalStatement,
      status: 'pending'
    });
    
    await application.save();
    
    res.render('common/applicationSuccess', {
      title: 'Application Submitted',
      email,
      activeTab: 'apply'
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('common/application', {
      title: 'Apply to University',
      error: 'Server error. Please try again later.',
      formData: req.body,
      activeTab: 'apply'
    });
  }
};

// Admin: View Applications
exports.viewApplications = async (req, res) => {
  try {
    // Try to get real applications from database
    let applications = await Application.find().sort({ createdAt: -1 });
    
    // If no applications found, provide dummy data for demonstration
    if (applications.length === 0) {
      const dummyApplications = [
        {
          _id: 'dummy1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '(555) 123-4567',
          dateOfBirth: '1998-05-15',
          address: '123 College Ave',
          city: 'University City',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
          educationLevel: 'High School',
          previousSchool: 'Lincoln High School',
          gpa: 3.8,
          desiredProgram: 'Computer Science',
          personalStatement: 'I have always been passionate about technology and problem-solving...',
          status: 'pending',
          createdAt: new Date('2025-03-20T10:30:00'),
          isDummy: true
        },
        {
          _id: 'dummy2',
          firstName: 'Emily',
          lastName: 'Johnson',
          email: 'emily.johnson@example.com',
          phone: '(555) 987-6543',
          dateOfBirth: '1997-11-22',
          address: '456 University Blvd',
          city: 'Academic Heights',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          educationLevel: 'High School',
          previousSchool: 'Washington High School',
          gpa: 4.0,
          desiredProgram: 'Business Administration',
          personalStatement: 'My goal is to become a successful entrepreneur and make a difference...',
          status: 'pending',
          createdAt: new Date('2025-03-21T14:45:00'),
          isDummy: true
        },
        {
          _id: 'dummy3',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael.brown@example.com',
          phone: '(555) 456-7890',
          dateOfBirth: '1999-02-10',
          address: '789 Scholar St',
          city: 'Education Valley',
          state: 'TX',
          zipCode: '75001',
          country: 'USA',
          educationLevel: 'High School',
          previousSchool: 'Jefferson High School',
          gpa: 3.5,
          desiredProgram: 'Mechanical Engineering',
          personalStatement: 'I have always been fascinated by how things work and are built...',
          status: 'pending',
          createdAt: new Date('2025-03-22T09:15:00'),
          isDummy: true
        },
        {
          _id: 'dummy4',
          firstName: 'Sarah',
          lastName: 'Davis',
          email: 'sarah.davis@example.com',
          phone: '(555) 789-0123',
          dateOfBirth: '1998-07-30',
          address: '321 Knowledge Rd',
          city: 'Wisdom City',
          state: 'FL',
          zipCode: '33101',
          country: 'USA',
          educationLevel: 'Associate Degree',
          previousSchool: 'Community College of Florida',
          gpa: 3.9,
          desiredProgram: 'Psychology',
          personalStatement: 'My experience volunteering at a local mental health clinic...',
          status: 'approved',
          createdAt: new Date('2025-03-19T11:20:00'),
          isDummy: true
        },
        {
          _id: 'dummy5',
          firstName: 'Robert',
          lastName: 'Wilson',
          email: 'robert.wilson@example.com',
          phone: '(555) 234-5678',
          dateOfBirth: '1997-09-05',
          address: '654 Academy Lane',
          city: 'Scholarly Town',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
          educationLevel: 'High School',
          previousSchool: 'Roosevelt High School',
          gpa: 3.2,
          desiredProgram: 'Mathematics',
          personalStatement: 'I have always excelled in mathematics and want to pursue...',
          status: 'rejected',
          createdAt: new Date('2025-03-18T16:30:00'),
          isDummy: true
        }
      ];
      
      applications = dummyApplications;
    }
    
    res.render('admin/applications', {
      title: 'Student Applications',
      applications,
      user: req.user,
      activeTab: 'applications'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Admin: View Application Details
exports.viewApplicationDetails = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'Application not found',
        user: req.user
      });
    }
    
    res.render('admin/applicationDetails', {
      title: 'Application Details',
      application,
      user: req.user,
      activeTab: 'applications'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Admin: Approve Application
exports.approveApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Generate a random password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create user account
    const user = new User({
      name: `${application.firstName} ${application.lastName}`,
      email: application.email,
      password: hashedPassword,
      role: 'student',
      phone: application.phone
    });
    
    await user.save();
    
    // Update application status
    application.status = 'approved';
    application.accountCreated = true;
    application.tempPassword = tempPassword; // In a real app, you'd email this instead of storing it
    await application.save();
    
    res.json({ 
      success: true, 
      message: 'Application approved and account created',
      tempPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Reject Application
exports.rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Update application status
    application.status = 'rejected';
    application.rejectionReason = req.body.reason || 'Application does not meet our requirements';
    await application.save();
    
    res.json({ success: true, message: 'Application rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: User Management
exports.viewUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.render('admin/users', {
      title: 'User Management',
      users,
      user: req.user,
      activeTab: 'users'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Admin: Create User Form
exports.renderCreateUserPage = (req, res) => {
  res.render('admin/createUser', {
    title: 'Create User',
    user: req.user,
    activeTab: 'users'
  });
};

// Admin: Create User
exports.createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('admin/createUser', {
        title: 'Create User',
        error: 'Email already in use',
        formData: req.body,
        user: req.user,
        activeTab: 'users'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      phone
    });
    
    await newUser.save();
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).render('admin/createUser', {
      title: 'Create User',
      error: 'Server error. Please try again later.',
      formData: req.body,
      user: req.user,
      activeTab: 'users'
    });
  }
};

// Admin: Edit User Form
exports.renderEditUserPage = async (req, res) => {
  try {
    const userToEdit = await User.findById(req.params.id);
    
    if (!userToEdit) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found',
        user: req.user
      });
    }
    
    res.render('admin/editUser', {
      title: 'Edit User',
      userToEdit,
      user: req.user,
      activeTab: 'users'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Admin: Update User
exports.updateUser = async (req, res) => {
  const { name, email, role, phone, resetPassword } = req.body;
  
  try {
    const userToUpdate = await User.findById(req.params.id);
    
    if (!userToUpdate) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found',
        user: req.user
      });
    }
    
    // Check if email is already in use by another user
    if (email !== userToUpdate.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.render('admin/editUser', {
          title: 'Edit User',
          error: 'Email already in use by another user',
          userToEdit: { ...userToUpdate._doc, ...req.body },
          user: req.user,
          activeTab: 'users'
        });
      }
    }
    
    // Update user fields
    userToUpdate.name = name;
    userToUpdate.email = email;
    userToUpdate.role = role;
    userToUpdate.phone = phone;
    
    // Reset password if requested
    if (resetPassword === 'on') {
      const tempPassword = Math.random().toString(36).slice(-8);
      userToUpdate.password = await bcrypt.hash(tempPassword, 10);
      await userToUpdate.save();
      
      return res.render('admin/userUpdated', {
        title: 'User Updated',
        message: 'User updated successfully',
        showPassword: true,
        tempPassword,
        user: req.user,
        activeTab: 'users'
      });
    }
    
    await userToUpdate.save();
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).render('admin/editUser', {
      title: 'Edit User',
      error: 'Server error. Please try again later.',
      userToEdit: req.body,
      user: req.user,
      activeTab: 'users'
    });
  }
};

// Admin: Delete User
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Profile
exports.renderProfilePage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('student/profile', { 
      title: 'My Profile',
      user,
      activeTab: 'profile'
    });
  } catch (error) {
    console.error('Error rendering profile page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Settings
exports.renderSettingsPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).send('User not authenticated');
    }
    
    res.render('common/settings', { 
      title: 'Account Settings',
      user,
      activeTab: 'settings'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update Settings
exports.updateSettings = async (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;
  const userId = req.session.userId;

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).render('common/settings', {
        title: 'Account Settings',
        error: 'User not found',
        user: req.body,
        activeTab: 'settings'
      });
    }
    
    // Check if email is already in use by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.render('common/settings', {
          title: 'Account Settings',
          error: 'Email already in use by another user',
          user: { ...user._doc, ...req.body },
          activeTab: 'settings'
        });
      }
    }
    
    // Update basic info
    user.name = name;
    user.email = email;
    user.phone = phone;
    
    // Update password if provided
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.render('common/settings', {
          title: 'Account Settings',
          error: 'Current password is incorrect',
          user: { ...user._doc, ...req.body },
          activeTab: 'settings'
        });
      }
      
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    await user.save();
    
    res.render('common/settings', {
      title: 'Account Settings',
      user,
      success: 'Settings updated successfully',
      activeTab: 'settings'
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('common/settings', {
      title: 'Account Settings',
      error: 'Server error. Please try again later.',
      user: req.body,
      activeTab: 'settings'
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
};

// Admin: Course Management
exports.viewCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor').sort({ createdAt: -1 });
    
    res.render('admin/courses', {
      title: 'Course Management',
      courses,
      user: req.user,
      activeTab: 'courses'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.renderCreateCoursePage = async (req, res) => {
  try {
    // Get all faculty members for the instructor dropdown
    const facultyMembers = await User.find({ role: 'faculty' }).sort({ name: 1 });
    
    // Get all courses for prerequisites dropdown
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    
    res.render('admin/createCourse', {
      title: 'Create New Course',
      facultyMembers,
      courses,
      user: req.user,
      activeTab: 'courses'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { 
      name, code, description, credits, department, instructor, 
      capacity, days, startTime, endTime, location, prerequisites,
      price, syllabus, semester, year
    } = req.body;

    // Format prerequisites as an array of ObjectIds
    const prerequisiteIds = prerequisites ? 
      (Array.isArray(prerequisites) ? prerequisites : [prerequisites]) : 
      [];

    // Create new course
    const newCourse = new Course({
      name,
      code,
      description,
      credits: parseInt(credits),
      department,
      instructor: instructor || null,
      capacity: parseInt(capacity),
      schedule: {
        days: Array.isArray(days) ? days : [days],
        startTime,
        endTime,
        location
      },
      prerequisites: prerequisiteIds,
      price: parseFloat(price),
      syllabus,
      semester,
      year: parseInt(year)
    });

    await newCourse.save();
    
    req.flash('success', `Course "${name}" has been created successfully.`);
    res.redirect('/admin/courses');
  } catch (error) {
    console.error(error);
    req.flash('error', `Error creating course: ${error.message}`);
    res.redirect('/admin/courses/create');
  }
};

exports.renderEditCoursePage = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    
    if (!course) {
      req.flash('error', 'Course not found');
      return res.redirect('/admin/courses');
    }
    
    // Get all faculty members for the instructor dropdown
    const facultyMembers = await User.find({ role: 'faculty' }).sort({ name: 1 });
    
    // Get all courses for prerequisites dropdown
    const allCourses = await Course.find({ _id: { $ne: courseId }, isActive: true }).sort({ name: 1 });
    
    res.render('admin/editCourse', {
      title: 'Edit Course',
      course,
      facultyMembers,
      allCourses,
      user: req.user,
      activeTab: 'courses'
    });
  } catch (error) {
    console.error(error);
    req.flash('error', `Error loading course: ${error.message}`);
    res.redirect('/admin/courses');
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { 
      name, code, description, credits, department, instructor, 
      capacity, days, startTime, endTime, location, prerequisites,
      price, syllabus, semester, year
    } = req.body;

    // Format prerequisites as an array of ObjectIds
    const prerequisiteIds = prerequisites ? 
      (Array.isArray(prerequisites) ? prerequisites : [prerequisites]) : 
      [];

    // Update course
    await Course.findByIdAndUpdate(courseId, {
      name,
      code,
      description,
      credits: parseInt(credits),
      department,
      instructor: instructor || null,
      capacity: parseInt(capacity),
      schedule: {
        days: Array.isArray(days) ? days : [days],
        startTime,
        endTime,
        location
      },
      prerequisites: prerequisiteIds,
      price: parseFloat(price),
      syllabus,
      semester,
      year: parseInt(year)
    });
    
    req.flash('success', `Course "${name}" has been updated successfully.`);
    res.redirect('/admin/courses');
  } catch (error) {
    console.error(error);
    req.flash('error', `Error updating course: ${error.message}`);
    res.redirect(`/admin/courses/${req.params.id}/edit`);
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    
    if (!course) {
      req.flash('error', 'Course not found');
      return res.redirect('/admin/courses');
    }
    
    // Check if course has enrolled students
    if (course.enrolled > 0) {
      req.flash('error', 'Cannot delete a course with enrolled students');
      return res.redirect('/admin/courses');
    }
    
    await Course.findByIdAndDelete(courseId);
    
    req.flash('success', `Course "${course.name}" has been deleted successfully.`);
    res.redirect('/admin/courses');
  } catch (error) {
    console.error(error);
    req.flash('error', `Error deleting course: ${error.message}`);
    res.redirect('/admin/courses');
  }
};

exports.toggleCourseStatus = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    
    if (!course) {
      req.flash('error', 'Course not found');
      return res.redirect('/admin/courses');
    }
    
    // Toggle isActive status
    course.isActive = !course.isActive;
    await course.save();
    
    const statusText = course.isActive ? 'activated' : 'deactivated';
    req.flash('success', `Course "${course.name}" has been ${statusText} successfully.`);
    res.redirect('/admin/courses');
  } catch (error) {
    console.error(error);
    req.flash('error', `Error updating course status: ${error.message}`);
    res.redirect('/admin/courses');
  }
};

// Admin: View Shop Items
exports.viewShop = async (req, res) => {
  try {
    let shopItems = await ShopItem.find().sort({ category: 1, name: 1 });
    
    // If no shop items exist, create some dummy data
    if (shopItems.length === 0) {
      const dummyItems = [
        {
          name: 'University Hoodie',
          description: 'Comfortable hoodie with university logo. Available in multiple sizes.',
          price: 39.99,
          category: 'Apparel',
          imageUrl: '/images/hoodie.jpg',
          inventory: 50,
          isActive: true,
          featured: true
        },
        {
          name: 'Notebook Set',
          description: 'Set of 3 premium notebooks with university branding.',
          price: 12.99,
          category: 'Supplies',
          imageUrl: '/images/notebooks.jpg',
          inventory: 100,
          isActive: true,
          featured: false
        },
        {
          name: 'Coffee Mug',
          description: 'Ceramic mug with university logo. Dishwasher safe.',
          price: 9.99,
          category: 'Accessories',
          imageUrl: '/images/mug.jpg',
          inventory: 75,
          isActive: true,
          featured: true
        },
        {
          name: 'Laptop Backpack',
          description: 'Durable backpack with padded laptop compartment and university logo.',
          price: 49.99,
          category: 'Accessories',
          imageUrl: '/images/backpack.jpg',
          inventory: 30,
          isActive: true,
          featured: false
        },
        {
          name: 'Introduction to Computer Science Textbook',
          description: 'Latest edition of the popular CS textbook. Required for CS101.',
          price: 89.99,
          category: 'Textbooks',
          imageUrl: '/images/cs-textbook.jpg',
          inventory: 25,
          isActive: true,
          featured: false
        },
        {
          name: 'Wireless Earbuds',
          description: 'Bluetooth earbuds with university branding and carrying case.',
          price: 59.99,
          category: 'Electronics',
          imageUrl: '/images/earbuds.jpg',
          inventory: 15,
          isActive: false,
          featured: false
        },
        {
          name: 'Water Bottle',
          description: 'Stainless steel water bottle with university logo. 24oz capacity.',
          price: 19.99,
          category: 'Accessories',
          imageUrl: '/images/water-bottle.jpg',
          inventory: 60,
          isActive: true,
          featured: true
        },
        {
          name: 'University T-Shirt',
          description: 'Cotton t-shirt with university logo. Available in multiple colors and sizes.',
          price: 24.99,
          category: 'Apparel',
          imageUrl: '/images/tshirt.jpg',
          inventory: 80,
          isActive: true,
          featured: false
        }
      ];
      
      await ShopItem.insertMany(dummyItems);
      shopItems = await ShopItem.find().sort({ category: 1, name: 1 });
    }
    
    // Get category counts
    const categoryCounts = {};
    for (const item of shopItems) {
      if (!categoryCounts[item.category]) {
        categoryCounts[item.category] = 0;
      }
      categoryCounts[item.category]++;
    }
    
    res.render('admin/shop', {
      title: 'Shop Management',
      user: req.user,
      activeTab: 'shop',
      shopItems,
      categoryCounts,
      totalItems: shopItems.length,
      activeItems: shopItems.filter(item => item.isActive).length,
      featuredItems: shopItems.filter(item => item.featured).length
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load shop items');
    res.redirect('/admin/dashboard');
  }
};

// Admin: Render Create Shop Item Page
exports.renderCreateShopItemPage = (req, res) => {
  res.render('admin/createShopItem', {
    title: 'Create Shop Item',
    user: req.user,
    activeTab: 'shop',
    categories: ['Apparel', 'Supplies', 'Textbooks', 'Electronics', 'Accessories', 'Other']
  });
};

// Admin: Create Shop Item
exports.createShopItem = async (req, res) => {
  try {
    const { name, description, price, category, inventory, imageUrl, featured, isActive } = req.body;
    
    const newItem = new ShopItem({
      name,
      description,
      price: parseFloat(price),
      category,
      inventory: parseInt(inventory),
      imageUrl: imageUrl || '/images/default-product.jpg',
      featured: featured === 'on',
      isActive: isActive === 'on'
    });
    
    await newItem.save();
    req.flash('success', 'Shop item created successfully');
    res.redirect('/admin/shop');
  } catch (error) {
    console.error(error);
    req.flash('error', `Error creating shop item: ${error.message}`);
    res.redirect('/admin/shop/create');
  }
};

// Admin: Render Edit Shop Item Page
exports.renderEditShopItemPage = async (req, res) => {
  try {
    const shopItem = await ShopItem.findById(req.params.id);
    
    if (!shopItem) {
      req.flash('error', 'Shop item not found');
      return res.redirect('/admin/shop');
    }
    
    res.render('admin/editShopItem', {
      title: 'Edit Shop Item',
      user: req.user,
      activeTab: 'shop',
      shopItem,
      categories: ['Apparel', 'Supplies', 'Textbooks', 'Electronics', 'Accessories', 'Other']
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load shop item details');
    res.redirect('/admin/shop');
  }
};

// Admin: Update Shop Item
exports.updateShopItem = async (req, res) => {
  try {
    const { name, description, price, category, inventory, imageUrl, featured, isActive } = req.body;
    
    await ShopItem.findByIdAndUpdate(req.params.id, {
      name,
      description,
      price: parseFloat(price),
      category,
      inventory: parseInt(inventory),
      imageUrl: imageUrl || '/images/default-product.jpg',
      featured: featured === 'on',
      isActive: isActive === 'on',
      updatedAt: Date.now()
    });
    
    req.flash('success', 'Shop item updated successfully');
    res.redirect('/admin/shop');
  } catch (error) {
    console.error(error);
    req.flash('error', `Error updating shop item: ${error.message}`);
    res.redirect(`/admin/shop/${req.params.id}/edit`);
  }
};

// Admin: Delete Shop Item
exports.deleteShopItem = async (req, res) => {
  try {
    await ShopItem.findByIdAndDelete(req.params.id);
    req.flash('success', 'Shop item deleted successfully');
    res.redirect('/admin/shop');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to delete shop item');
    res.redirect('/admin/shop');
  }
};

// Admin: Toggle Shop Item Status
exports.toggleShopItemStatus = async (req, res) => {
  try {
    const shopItem = await ShopItem.findById(req.params.id);
    
    if (!shopItem) {
      req.flash('error', 'Shop item not found');
      return res.redirect('/admin/shop');
    }
    
    shopItem.isActive = !shopItem.isActive;
    await shopItem.save();
    
    req.flash('success', `Shop item ${shopItem.isActive ? 'activated' : 'deactivated'} successfully`);
    res.redirect('/admin/shop');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to update shop item status');
    res.redirect('/admin/shop');
  }
};

// Admin Dashboard
exports.renderAdminDashboard = async (req, res) => {
  try {
    // Get counts from database
    const pendingApplicationsCount = await Application.countDocuments({ status: 'pending' });
    const totalStudentsCount = await User.countDocuments({ role: 'student' });
    const activeCourses = await Course.countDocuments({ isActive: true });
    
    // Calculate revenue (placeholder - would need actual payment data)
    // This would be replaced with real payment calculation in a production system
    const monthlyRevenue = await calculateMonthlyRevenue();
    
    // Get recent applications
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('program');
    
    // Get popular courses (based on enrollment)
    const popularCourses = await Course.find()
      .sort({ enrolled: -1 })
      .limit(5)
      .populate('instructor');
    
    res.render('admin/dashboard', { 
      title: 'Admin Dashboard',
      user: req.user,
      activeTab: 'dashboard',
      stats: {
        pendingApplications: pendingApplicationsCount,
        totalStudents: totalStudentsCount,
        activeCourses: activeCourses,
        monthlyRevenue: monthlyRevenue
      },
      recentApplications,
      popularCourses
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).send('Server error');
  }
};

// Helper function to calculate monthly revenue
async function calculateMonthlyRevenue() {
  try {
    // This is a placeholder - in a real system, you would query your payment records
    // For now, we'll estimate based on course enrollments and prices
    const courses = await Course.find();
    let revenue = 0;
    
    for (const course of courses) {
      revenue += (course.price || 0) * (course.enrolled || 0);
    }
    
    return revenue;
  } catch (error) {
    console.error('Revenue calculation error:', error);
    return 0;
  }
}

// Admin: View Payment Reports
exports.viewPaymentReports = async (req, res) => {
  try {
    const Payment = require('../models/payment');
    const User = require('../models/user');
    
    // Get all payments
    let payments = await Payment.find().populate('user');
    
    // If no payments exist, create some dummy data for testing
    if (payments.length === 0) {
      // Get some users to associate with payments
      const users = await User.find().limit(5);
      
      // Make sure we have at least one user
      let userId;
      if (users.length === 0) {
        // Create a dummy user if none exist
        const dummyUser = await User.create({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'student'
        });
        userId = dummyUser._id;
      } else {
        // Use the first available user
        userId = users[0]._id;
      }
      
      // Create dummy payments
      const dummyPayments = [
        // Course enrollment
        {
          user: userId,
          amount: 1299.99,
          description: 'Enrollment: Computer Science 101',
          status: 'completed',
          paymentMethod: 'credit_card',
          paymentType: 'course_enrollment',
          items: [{
            itemType: 'course',
            itemId: '60a1b2c3d4e5f6a7b8c9d0e1',
            name: 'Computer Science 101',
            price: 1299.99,
            quantity: 1
          }],
          transactionId: 'TXN-1647889234-123456',
          receiptUrl: 'https://receipts.bestuniversity.edu/txn-1647889234',
          createdAt: new Date('2025-01-15T14:30:00')
        },
        
        // Pending payment
        {
          user: userId,
          amount: 1499.99,
          description: 'Enrollment: Data Structures and Algorithms',
          status: 'pending',
          paymentMethod: 'bank_transfer',
          paymentType: 'course_enrollment',
          items: [{
            itemType: 'course',
            itemId: '60a1b2c3d4e5f6a7b8c9d0e2',
            name: 'Data Structures and Algorithms',
            price: 1499.99,
            quantity: 1
          }],
          transactionId: 'TXN-1648889234-234567',
          createdAt: new Date('2025-01-20T10:45:00')
        },
        
        // Shop purchase
        {
          user: userId,
          amount: 89.97,
          description: 'Shop Purchase: University Hoodie (2) and Coffee Mug',
          status: 'completed',
          paymentMethod: 'debit_card',
          paymentType: 'shop_purchase',
          items: [
            {
              itemType: 'shop_item',
              itemId: '60a1b2c3d4e5f6a7b8c9d0e3',
              name: 'University Hoodie',
              price: 39.99,
              quantity: 2
            },
            {
              itemType: 'shop_item',
              itemId: '60a1b2c3d4e5f6a7b8c9d0e4',
              name: 'Coffee Mug',
              price: 9.99,
              quantity: 1
            }
          ],
          transactionId: 'TXN-1649889234-345678',
          receiptUrl: 'https://receipts.bestuniversity.edu/txn-1649889234',
          createdAt: new Date('2025-02-05T09:15:00')
        },
        
        // Application fee
        {
          user: userId,
          amount: 75.00,
          description: 'Application Fee: Graduate Program',
          status: 'completed',
          paymentMethod: 'paypal',
          paymentType: 'application_fee',
          items: [{
            itemType: 'application',
            itemId: '60a1b2c3d4e5f6a7b8c9d0e5',
            name: 'Graduate Program Application',
            price: 75.00,
            quantity: 1
          }],
          transactionId: 'TXN-1650889234-456789',
          receiptUrl: 'https://receipts.bestuniversity.edu/txn-1650889234',
          createdAt: new Date('2025-02-10T16:20:00')
        },
        
        // Failed payment
        {
          user: userId,
          amount: 1299.99,
          description: 'Enrollment: Web Development Fundamentals',
          status: 'failed',
          paymentMethod: 'credit_card',
          paymentType: 'course_enrollment',
          items: [{
            itemType: 'course',
            itemId: '60a1b2c3d4e5f6a7b8c9d0e6',
            name: 'Web Development Fundamentals',
            price: 1299.99,
            quantity: 1
          }],
          transactionId: 'TXN-1651889234-567890',
          createdAt: new Date('2025-02-15T11:30:00')
        },
        
        // Refunded payment
        {
          user: userId,
          amount: 1499.99,
          description: 'Enrollment: Artificial Intelligence',
          status: 'refunded',
          paymentMethod: 'credit_card',
          paymentType: 'course_enrollment',
          items: [{
            itemType: 'course',
            itemId: '60a1b2c3d4e5f6a7b8c9d0e7',
            name: 'Artificial Intelligence',
            price: 1499.99,
            quantity: 1
          }],
          transactionId: 'TXN-1652889234-678901',
          receiptUrl: 'https://receipts.bestuniversity.edu/txn-1652889234',
          refundReason: 'Course schedule conflict',
          createdAt: new Date('2025-02-20T13:45:00')
        },
        
        // Multiple course enrollment
        {
          user: userId,
          amount: 2799.98,
          description: 'Enrollment: Database Systems and Network Security',
          status: 'completed',
          paymentMethod: 'bank_transfer',
          paymentType: 'course_enrollment',
          items: [
            {
              itemType: 'course',
              itemId: '60a1b2c3d4e5f6a7b8c9d0e8',
              name: 'Database Systems',
              price: 1399.99,
              quantity: 1
            },
            {
              itemType: 'course',
              itemId: '60a1b2c3d4e5f6a7b8c9d0e9',
              name: 'Network Security',
              price: 1399.99,
              quantity: 1
            }
          ],
          transactionId: 'TXN-1653889234-789012',
          receiptUrl: 'https://receipts.bestuniversity.edu/txn-1653889234',
          createdAt: new Date('2025-02-25T15:10:00')
        }
      ];
      
      // Insert dummy payments
      await Payment.insertMany(dummyPayments);
      
      // Fetch the newly created payments
      payments = await Payment.find().populate('user');
    }
    
    // Calculate payment statistics
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
      
    const courseRevenue = payments
      .filter(p => p.status === 'completed' && p.paymentType === 'course_enrollment')
      .reduce((sum, p) => sum + p.amount, 0);
      
    const shopRevenue = payments
      .filter(p => p.status === 'completed' && p.paymentType === 'shop_purchase')
      .reduce((sum, p) => sum + p.amount, 0);
      
    const applicationRevenue = payments
      .filter(p => p.status === 'completed' && p.paymentType === 'application_fee')
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Count payments by status
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const refundedPayments = payments.filter(p => p.status === 'refunded').length;
    
    // Get payment methods distribution
    const paymentMethods = {};
    payments.forEach(payment => {
      if (!paymentMethods[payment.paymentMethod]) {
        paymentMethods[payment.paymentMethod] = 0;
      }
      paymentMethods[payment.paymentMethod]++;
    });
    
    res.render('admin/payments', {
      title: 'Payment Reports',
      user: req.user,
      activeTab: 'payments',
      payments,
      totalRevenue,
      courseRevenue,
      shopRevenue,
      applicationRevenue,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      paymentMethods
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load payment reports');
    res.redirect('/admin/dashboard');
  }
};

// Admin: View Payment Details
exports.viewPaymentDetails = async (req, res) => {
  try {
    const Payment = require('../models/payment');
    
    const payment = await Payment.findById(req.params.id).populate('user');
    
    if (!payment) {
      req.flash('error', 'Payment not found');
      return res.redirect('/admin/payments');
    }
    
    res.render('admin/paymentDetails', {
      title: 'Payment Details',
      user: req.user,
      activeTab: 'payments',
      payment
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load payment details');
    res.redirect('/admin/payments');
  }
};

// Admin: Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const Payment = require('../models/payment');
    const { status, refundReason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      req.flash('error', 'Payment not found');
      return res.redirect('/admin/payments');
    }
    
    payment.status = status;
    if (status === 'refunded' && refundReason) {
      payment.refundReason = refundReason;
    }
    
    await payment.save();
    
    req.flash('success', 'Payment status updated successfully');
    res.redirect(`/admin/payments/${req.params.id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to update payment status');
    res.redirect('/admin/payments');
  }
};

// Admin: View System Settings
exports.viewSystemSettings = async (req, res) => {
  try {
    res.render('admin/settings', {
      title: 'System Settings',
      user: req.user,
      activeTab: 'settings',
      messages: req.flash() // Pass flash messages to the template
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load system settings');
    res.redirect('/admin/dashboard');
  }
};

// Admin: Update System Settings
exports.updateSystemSettings = async (req, res) => {
  try {
    // In a real application, this would save system settings to the database
    // For now, we'll just show a success message
    req.flash('success', 'System settings updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to update system settings');
    res.redirect('/admin/settings');
  }
};

// Faculty: View Dashboard
exports.viewFacultyDashboard = async (req, res) => {
  try {
    const User = require('../models/user');
    const Course = require('../models/course');
    const Announcement = require('../models/announcement');
    
    // Get faculty information
    const faculty = await User.findById(req.session.userId);
    
    // Get courses taught by this faculty
    const courses = await Course.find({ 
      instructor: req.session.userId,
      status: 'active' // Only show active courses
    })
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get total courses count
    const totalCourses = await Course.countDocuments({ 
      instructor: req.session.userId,
      status: 'active'
    });
    
    // Get total students taught by this faculty
    const totalStudents = await User.countDocuments({
      role: 'student',
      enrolledCourses: { $in: (await Course.find({ 
        instructor: req.session.userId,
        status: 'active'
      })).map(course => course._id) }
    });
    
    // Get upcoming classes (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingClasses = await Course.find({ 
      instructor: req.session.userId,
      status: 'active'
    });
    
    // Get recent assignments (placeholder for now)
    const recentAssignments = [];
    
    // Get announcements created by this faculty
    const announcements = await Announcement.find({ 
      createdBy: req.session.userId 
    })
    .populate('course', 'code name')
    .sort({ createdAt: -1 })
    .limit(5);
    
    res.render('faculty/facultyDashboard', {
      title: 'Faculty Dashboard',
      user: faculty,
      courses,
      totalCourses,
      totalStudents,
      upcomingClasses,
      recentAssignments,
      announcements,
      activeTab: 'dashboard',
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/login');
  }
};

// Faculty: View Courses
exports.viewFacultyCourses = async (req, res) => {
  try {
    const User = require('../models/user');
    const Course = require('../models/course');
    
    // Get courses taught by this faculty member
    const facultyCourses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 });
    
    // Get student count and details for each course
    const coursesWithDetails = await Promise.all(
      facultyCourses.map(async (course) => {
        // Get enrolled students
        const enrolledStudents = await User.find({
          role: 'student',
          enrolledCourses: { $in: [course._id] }
        }).select('firstName lastName email');
        
        // Calculate course statistics
        const studentCount = enrolledStudents.length;
        const maleCount = enrolledStudents.filter(s => s.gender === 'male').length;
        const femaleCount = enrolledStudents.filter(s => s.gender === 'female').length;
        const otherCount = studentCount - maleCount - femaleCount;
        
        // Format schedule days for display
        const scheduleDays = course.schedule && course.schedule.days ? 
          course.schedule.days.join(', ') : 'Not scheduled';
        
        // Format schedule time for display
        const scheduleTime = course.schedule && course.schedule.startTime && course.schedule.endTime ? 
          `${course.schedule.startTime} - ${course.schedule.endTime}` : 'Not scheduled';
        
        return {
          ...course.toObject(),
          studentCount,
          enrolledStudents,
          genderStats: { male: maleCount, female: femaleCount, other: otherCount },
          formattedSchedule: `${scheduleDays} ${scheduleTime}`,
          location: course.schedule && course.schedule.location ? course.schedule.location : 'TBA'
        };
      })
    );
    
    // Group courses by semester and year
    const coursesBySemester = {};
    coursesWithDetails.forEach(course => {
      const key = `${course.semester} ${course.year}`;
      if (!coursesBySemester[key]) {
        coursesBySemester[key] = [];
      }
      coursesBySemester[key].push(course);
    });
    
    res.render('faculty/facultyCourses', {
      title: 'My Courses',
      user: req.user,
      activeTab: 'courses',
      courses: coursesWithDetails,
      coursesBySemester,
      currentSemester: getCurrentSemester(),
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load faculty courses');
    res.redirect('/faculty/dashboard');
  }
};

// Faculty: View Students
exports.viewFacultyStudents = async (req, res) => {
  try {
    const User = require('../models/user');
    const Course = require('../models/course');
    
    // Get courses taught by this faculty member
    const facultyCourses = await Course.find({ instructor: req.user._id });
    
    // Get all students enrolled in any of the faculty's courses
    const students = await User.find({
      role: 'student',
      enrolledCourses: { $in: facultyCourses.map(course => course._id) }
    }).sort({ lastName: 1, firstName: 1 });
    
    // Get detailed student information with courses they're enrolled in
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        // Get the courses this student is enrolled in that are taught by this faculty
        const enrolledCourses = await Course.find({
          _id: { $in: student.enrolledCourses },
          instructor: req.user._id
        }).select('name code semester year');
        
        return {
          ...student.toObject(),
          enrolledCourses,
          courseCount: enrolledCourses.length
        };
      })
    );
    
    // Group students by course
    const studentsByCourse = {};
    facultyCourses.forEach(course => {
      studentsByCourse[course._id] = studentsWithDetails.filter(student => 
        student.enrolledCourses.some(c => c._id.toString() === course._id.toString())
      );
    });
    
    // Get student statistics
    const totalStudents = studentsWithDetails.length;
    const uniqueStudentIds = new Set(studentsWithDetails.map(s => s._id.toString()));
    const uniqueStudentCount = uniqueStudentIds.size;
    
    // Group students by academic year/status
    const studentsByYear = {
      'Freshman': studentsWithDetails.filter(s => s.academicYear === 'Freshman').length,
      'Sophomore': studentsWithDetails.filter(s => s.academicYear === 'Sophomore').length,
      'Junior': studentsWithDetails.filter(s => s.academicYear === 'Junior').length,
      'Senior': studentsWithDetails.filter(s => s.academicYear === 'Senior').length,
      'Graduate': studentsWithDetails.filter(s => s.academicYear === 'Graduate').length,
      'Other': studentsWithDetails.filter(s => !s.academicYear || !['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].includes(s.academicYear)).length
    };
    
    res.render('faculty/facultyStudents', {
      title: 'My Students',
      user: req.user,
      activeTab: 'students',
      students: studentsWithDetails,
      courses: facultyCourses,
      studentsByCourse,
      totalStudents,
      uniqueStudentCount,
      studentsByYear,
      currentSemester: getCurrentSemester(),
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load student information');
    res.redirect('/faculty/dashboard');
  }
};

// Faculty: View Grades
exports.viewFacultyGrades = async (req, res) => {
  try {
    const User = require('../models/user');
    const Course = require('../models/course');
    
    // Get faculty user
    const faculty = await User.findById(req.session.userId);
    
    // Get courses taught by this faculty
    const courses = await Course.find({ instructor: req.session.userId });
    
    // Get all students enrolled in these courses
    const enrolledStudentIds = new Set();
    courses.forEach(course => {
      course.students.forEach(studentId => {
        enrolledStudentIds.add(studentId.toString());
      });
    });
    
    // Get student details
    const students = await User.find({ 
      _id: { $in: Array.from(enrolledStudentIds) },
      role: 'student'
    });
    
    // Add sample grades data for demonstration
    const studentsWithGrades = students.map(student => {
      // Generate random grades for demonstration
      const assignment1 = Math.floor(Math.random() * 30) + 70; // 70-100
      const assignment2 = Math.floor(Math.random() * 30) + 70;
      const midterm = Math.floor(Math.random() * 30) + 70;
      const project = Math.floor(Math.random() * 30) + 70;
      const final = Math.floor(Math.random() * 30) + 70;
      
      // Calculate overall grade (weighted)
      const overall = Math.round(
        (assignment1 * 0.1) + 
        (assignment2 * 0.15) + 
        (midterm * 0.25) + 
        (project * 0.2) + 
        (final * 0.3)
      );
      
      // Determine letter grade
      let letterGrade;
      if (overall >= 90) letterGrade = 'A';
      else if (overall >= 80) letterGrade = 'B';
      else if (overall >= 70) letterGrade = 'C';
      else if (overall >= 60) letterGrade = 'D';
      else letterGrade = 'F';
      
      return {
        ...student.toObject(),
        grades: {
          assignment1,
          assignment2,
          midterm,
          project,
          final,
          overall,
          letterGrade
        }
      };
    });
    
    res.render('faculty/facultyGrades', {
      title: 'Grade Management',
      user: req.user,
      activeTab: 'grades',
      courses,
      students: studentsWithGrades,
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load grades data');
    res.redirect('/faculty/dashboard');
  }
};

// Helper function to determine current semester
function getCurrentSemester() {
  const now = new Date();
  const month = now.getMonth() + 1; // January is 0
  const year = now.getFullYear();
  
  let semester;
  if (month >= 1 && month <= 5) {
    semester = 'Spring';
  } else if (month >= 6 && month <= 8) {
    semester = 'Summer';
  } else {
    semester = 'Fall';
  }
  
  return { semester, year };
}

// Render the page for faculty to create a new course
exports.renderFacultyCreateCoursePage = async (req, res) => {
  try {
    const User = require('../models/user');
    const Department = require('../models/department');
    
    // Get faculty user
    const faculty = await User.findById(req.session.userId);
    
    // Get departments for dropdown
    const departments = await Department.find();
    
    // Get current semester and year for defaults
    const currentSemester = getCurrentSemester();
    const currentYear = new Date().getFullYear();
    
    res.render('faculty/facultyCreateCourse', {
      title: 'Create New Course',
      user: req.user,
      activeTab: 'courses',
      departments,
      currentSemester,
      currentYear,
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load course creation page');
    res.redirect('/faculty/courses');
  }
};

// Handle the creation of a new course by faculty
exports.createFacultyCourse = async (req, res) => {
  try {
    const Course = require('../models/course');
    const Department = require('../models/department');
    
    const { 
      code, 
      name, 
      description, 
      department, 
      credits, 
      semester, 
      year,
      schedule,
      location,
      capacity,
      prerequisites,
      syllabus
    } = req.body;
    
    // Validate required fields
    if (!code || !name || !department || !credits || !semester || !year) {
      req.flash('error', 'Please fill all required fields');
      return res.redirect('/faculty/courses/create');
    }
    
    // Create new course
    const newCourse = new Course({
      code,
      name,
      description,
      department,
      credits: parseInt(credits),
      instructor: req.session.userId,
      semester,
      year: parseInt(year),
      schedule,
      location,
      capacity: parseInt(capacity) || 30, // Default capacity
      prerequisites: prerequisites ? prerequisites.split(',').map(p => p.trim()) : [],
      syllabus,
      status: 'pending', // Courses created by faculty need admin approval
      students: [],
      createdAt: new Date()
    });
    
    await newCourse.save();
    
    req.flash('success', 'Course created successfully and pending admin approval');
    res.redirect('/faculty/courses');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to create course: ' + error.message);
    res.redirect('/faculty/courses/create');
  }
};

// Render the page for faculty to create a new assignment
exports.renderFacultyCreateAssignmentPage = async (req, res) => {
  try {
    const Course = require('../models/course');
    
    // Get courses taught by this faculty
    const courses = await Course.find({ 
      instructor: req.session.userId,
      status: 'active' // Only show active courses
    });
    
    // Get current date for default due date (2 weeks from now)
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);
    
    // Format dates for the date input
    const formattedToday = today.toISOString().split('T')[0];
    const formattedTwoWeeksFromNow = twoWeeksFromNow.toISOString().split('T')[0];
    
    res.render('faculty/facultyCreateAssignment', {
      title: 'Create New Assignment',
      user: req.user,
      activeTab: 'assignments',
      courses,
      today: formattedToday,
      defaultDueDate: formattedTwoWeeksFromNow,
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load assignment creation page');
    res.redirect('/faculty/grades');
  }
};

// Handle the creation of a new assignment by faculty
exports.createFacultyAssignment = async (req, res) => {
  try {
    const Assignment = require('../models/assignment');
    const Course = require('../models/course');
    
    const { 
      title, 
      description, 
      courseId, 
      dueDate,
      totalPoints,
      assignmentType,
      instructions,
      allowLateSubmissions,
      lateSubmissionPenalty,
      visibleToStudents
    } = req.body;
    
    // Validate required fields
    if (!title || !courseId || !dueDate || !totalPoints || !assignmentType) {
      req.flash('error', 'Please fill all required fields');
      return res.redirect('/faculty/assignments/create');
    }
    
    // Verify the course belongs to this faculty
    const course = await Course.findOne({ 
      _id: courseId,
      instructor: req.session.userId
    });
    
    if (!course) {
      req.flash('error', 'Invalid course selected');
      return res.redirect('/faculty/assignments/create');
    }
    
    // Create new assignment
    const newAssignment = new Assignment({
      title,
      description,
      course: courseId,
      dueDate: new Date(dueDate),
      totalPoints: parseInt(totalPoints),
      assignmentType,
      instructions,
      allowLateSubmissions: allowLateSubmissions === 'on',
      lateSubmissionPenalty: lateSubmissionPenalty ? parseInt(lateSubmissionPenalty) : 0,
      visibleToStudents: visibleToStudents === 'on',
      createdBy: req.session.userId,
      createdAt: new Date(),
      submissions: []
    });
    
    await newAssignment.save();
    
    // Update course with the new assignment
    course.assignments = course.assignments || [];
    course.assignments.push(newAssignment._id);
    await course.save();
    
    req.flash('success', 'Assignment created successfully');
    res.redirect('/faculty/grades');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to create assignment: ' + error.message);
    res.redirect('/faculty/assignments/create');
  }
};

// Render the page for faculty to create a new announcement
exports.renderFacultyCreateAnnouncementPage = async (req, res) => {
  try {
    const Course = require('../models/course');
    
    // Get courses taught by this faculty
    const courses = await Course.find({ 
      instructor: req.session.userId,
      status: 'active' // Only show active courses
    });
    
    // Get current date for default expiry date (2 weeks from now)
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);
    
    // Format dates for the date input
    const formattedToday = today.toISOString().split('T')[0];
    const formattedTwoWeeksFromNow = twoWeeksFromNow.toISOString().split('T')[0];
    
    res.render('faculty/facultyCreateAnnouncement', {
      title: 'Create Announcement',
      user: req.user,
      activeTab: 'announcements',
      courses,
      today: formattedToday,
      defaultExpiryDate: formattedTwoWeeksFromNow,
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load announcement creation page');
    res.redirect('/faculty/dashboard');
  }
};

// Handle the creation of a new announcement by faculty
exports.createFacultyAnnouncement = async (req, res) => {
  try {
    const Announcement = require('../models/announcement');
    const Course = require('../models/course');
    
    const { 
      title, 
      content, 
      courseId, 
      priority,
      expiryDate,
      sendEmail,
      visibleToStudents
    } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      req.flash('error', 'Please fill all required fields');
      return res.redirect('/faculty/announcements/create');
    }
    
    // Create new announcement
    const newAnnouncement = new Announcement({
      title,
      content,
      course: courseId || null, // If no course is selected, it's a general announcement
      priority: priority || 'normal',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      sendEmail: sendEmail === 'on',
      visibleToStudents: visibleToStudents === 'on',
      createdBy: req.session.userId,
      createdAt: new Date()
    });
    
    await newAnnouncement.save();
    
    // If course-specific announcement, update the course
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        course.announcements = course.announcements || [];
        course.announcements.push(newAnnouncement._id);
        await course.save();
      }
    }
    
    // If email notification is enabled, send emails to relevant students
    if (sendEmail === 'on') {
      // This would be implemented with an email service
      // For now, we'll just log it
      console.log(`Email notification would be sent for announcement: ${title}`);
    }
    
    req.flash('success', 'Announcement created successfully');
    res.redirect('/faculty/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to create announcement: ' + error.message);
    res.redirect('/faculty/announcements/create');
  }
};

// Student Courses Page
exports.renderStudentCoursesPage = async (req, res) => {
  try {
    // Get user with enrolled courses
    const user = await User.findById(req.session.userId)
      .populate({
        path: 'enrolledCourses',
        populate: [
          { path: 'instructor', select: 'firstName lastName email profileImage' },
          { path: 'department', select: 'name code' }
        ]
      });
    
    if (!user) {
      return res.redirect('/login');
    }
    
    // Get enrolled courses with detailed information
    const enrolledCourses = user.enrolledCourses || [];
    
    // Get assignments for enrolled courses
    const assignments = await Assignment.find({
      course: { $in: enrolledCourses.map(course => course._id) }
    })
    .populate('course', 'code name')
    .sort({ dueDate: 1 });
    
    // Group assignments by course
    const assignmentsByCourse = {};
    assignments.forEach(assignment => {
      const courseId = assignment.course._id.toString();
      if (!assignmentsByCourse[courseId]) {
        assignmentsByCourse[courseId] = [];
      }
      assignmentsByCourse[courseId].push(assignment);
    });
    
    // Get all available courses for potential enrollment
    const allCourses = await Course.find({ 
      status: 'active',
      _id: { $nin: enrolledCourses.map(course => course._id) }
    })
    .populate('instructor', 'firstName lastName')
    .populate('department', 'name code')
    .sort({ code: 1 });
    
    // Calculate progress for each course (placeholder for now)
    const courseProgress = {};
    enrolledCourses.forEach(course => {
      // This would typically be calculated based on completed assignments
      // For now, we'll use a random value between 0-100
      courseProgress[course._id.toString()] = Math.floor(Math.random() * 100);
    });
    
    res.render('student/studentCourses', { 
      title: 'My Courses', 
      user,
      enrolledCourses,
      allCourses,
      assignmentsByCourse,
      courseProgress,
      activeTab: 'courses',
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load courses');
    res.redirect('/dashboard');
  }
};