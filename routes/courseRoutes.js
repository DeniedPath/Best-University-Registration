const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Route to list all courses
router.get('/', courseController.listCourses);

// Route to handle course enrollment
router.get('/enroll/:id', courseController.enrollCourse);
// routes/courseRoutes.js
router.get('/search', async (req, res) => {
    const query = req.query.query;
    try {
      const courses = await Course.find({ name: { $regex: query, $options: 'i' } });
      res.render('courses', { title: 'Search Results', courses });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
module.exports = router;