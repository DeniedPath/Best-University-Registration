const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin, isFaculty, isStudent } = require('../middleware/auth');

// Public routes
router.get('/', (req, res) => {
  res.render('common/home', { 
    title: 'Best University',
    user: req.user,
    activeTab: 'home'
  });
});

router.get('/login', userController.renderLoginPage);
router.post('/login', userController.login);

router.get('/apply', userController.renderApplicationPage);
router.post('/apply', userController.submitApplication);

router.get('/logout', userController.logout);

// Student routes
router.get('/dashboard', isAuthenticated, isStudent, userController.renderDashboardPage);
router.get('/courses', isAuthenticated, isStudent, userController.renderStudentCoursesPage);
router.get('/profile', isAuthenticated, userController.renderProfilePage);
router.get('/settings', isAuthenticated, userController.renderSettingsPage);
router.post('/settings', isAuthenticated, userController.updateSettings);

// Admin routes
router.get('/admin/dashboard', isAuthenticated, isAdmin, userController.renderAdminDashboard);
router.get('/admin/applications', isAuthenticated, isAdmin, userController.viewApplications);
router.get('/admin/applications/:id', isAuthenticated, isAdmin, userController.viewApplicationDetails);
router.post('/admin/applications/:id/approve', isAuthenticated, isAdmin, userController.approveApplication);
router.post('/admin/applications/:id/reject', isAuthenticated, isAdmin, userController.rejectApplication);

router.get('/admin/users', isAuthenticated, isAdmin, userController.viewUsers);
router.get('/admin/users/create', isAuthenticated, isAdmin, userController.renderCreateUserPage);
router.post('/admin/users/create', isAuthenticated, isAdmin, userController.createUser);
router.get('/admin/users/:id/edit', isAuthenticated, isAdmin, userController.renderEditUserPage);
router.post('/admin/users/:id/edit', isAuthenticated, isAdmin, userController.updateUser);
router.get('/admin/users/:id/delete', isAuthenticated, isAdmin, userController.deleteUser);

// Admin Course Management routes
router.get('/admin/courses', isAuthenticated, isAdmin, userController.viewCourses);
router.get('/admin/courses/create', isAuthenticated, isAdmin, userController.renderCreateCoursePage);
router.post('/admin/courses/create', isAuthenticated, isAdmin, userController.createCourse);
router.get('/admin/courses/:id/edit', isAuthenticated, isAdmin, userController.renderEditCoursePage);
router.post('/admin/courses/:id/edit', isAuthenticated, isAdmin, userController.updateCourse);
router.get('/admin/courses/:id/delete', isAuthenticated, isAdmin, userController.deleteCourse);
router.get('/admin/courses/:id/toggle', isAuthenticated, isAdmin, userController.toggleCourseStatus);

// Admin Shop Management routes
router.get('/admin/shop', isAuthenticated, isAdmin, userController.viewShop);
router.get('/admin/shop/create', isAuthenticated, isAdmin, userController.renderCreateShopItemPage);
router.post('/admin/shop/create', isAuthenticated, isAdmin, userController.createShopItem);
router.get('/admin/shop/:id/edit', isAuthenticated, isAdmin, userController.renderEditShopItemPage);
router.post('/admin/shop/:id/edit', isAuthenticated, isAdmin, userController.updateShopItem);
router.get('/admin/shop/:id/delete', isAuthenticated, isAdmin, userController.deleteShopItem);
router.get('/admin/shop/:id/toggle', isAuthenticated, isAdmin, userController.toggleShopItemStatus);

// Admin Payment Reports routes
router.get('/admin/payments', isAuthenticated, isAdmin, userController.viewPaymentReports);
router.get('/admin/payments/:id', isAuthenticated, isAdmin, userController.viewPaymentDetails);
router.post('/admin/payments/:id/update-status', isAuthenticated, isAdmin, userController.updatePaymentStatus);

// Admin System Settings routes
router.get('/admin/settings', isAuthenticated, isAdmin, userController.viewSystemSettings);
router.post('/admin/settings', isAuthenticated, isAdmin, userController.updateSystemSettings);

// Faculty routes
router.get('/faculty/dashboard', isAuthenticated, isFaculty, userController.viewFacultyDashboard);
router.get('/faculty/courses', isAuthenticated, isFaculty, userController.viewFacultyCourses);
router.get('/faculty/courses/create', isAuthenticated, isFaculty, userController.renderFacultyCreateCoursePage);
router.post('/faculty/courses/create', isAuthenticated, isFaculty, userController.createFacultyCourse);
router.get('/faculty/students', isAuthenticated, isFaculty, userController.viewFacultyStudents);
router.get('/faculty/grades', isAuthenticated, isFaculty, userController.viewFacultyGrades);
router.get('/faculty/assignments/create', isAuthenticated, isFaculty, userController.renderFacultyCreateAssignmentPage);
router.post('/faculty/assignments/create', isAuthenticated, isFaculty, userController.createFacultyAssignment);
router.get('/faculty/announcements/create', isAuthenticated, isFaculty, userController.renderFacultyCreateAnnouncementPage);
router.post('/faculty/announcements/create', isAuthenticated, isFaculty, userController.createFacultyAnnouncement);

module.exports = router;