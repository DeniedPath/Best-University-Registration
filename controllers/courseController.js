const Course = require('../models/course');

// Render the courses page
exports.listCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.render('student/courses', { title: 'Available Courses', courses });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Handle course enrollment
exports.enrollCourse = async (req, res) => {
  const courseId = req.params.id;
  const userId = req.session.userId;

  try {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).send('User or course not found.');
    }

    // Add course to user's enrolled courses
    user.enrolledCourses.push(courseId);
    await user.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
  
  // Render the page to add a new course
  exports.renderAddCoursePage = (req, res) => {
    res.render('admin/addCourse', { title: 'Add Course' });
  };
  
  // Handle adding a new course
  exports.addCourse = async (req, res) => {
    const { name, description, credits } = req.body;
    try {
      const newCourse = new Course({ name, description, credits });
      await newCourse.save();
      res.redirect('/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  };


// Render the page to edit a course
exports.renderEditCoursePage = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render('admin/editCourse', { title: 'Edit Course', course });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Handle updating a course
exports.updateCourse = async (req, res) => {
  const { name, description, credits } = req.body;
  try {
    await Course.findByIdAndUpdate(req.params.id, { name, description, credits });
    res.redirect('/courses');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Handle deleting a course
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.redirect('/courses');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.renderDashboardPage = async (req, res) => {
  try {
    const courses = await Course.find();
    res.render('student/dashboard', { title: 'Dashboard', courses });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};