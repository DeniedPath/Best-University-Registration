# Best-University-Registration

## Overview
Best-University-Registration is a web application designed to manage user registrations and logins for a university. It supports different user roles such as Admin, Faculty, and Student, and redirects users to their respective dashboards upon login.

## Features
- User Registration
- User Login
- Role-based Redirection
  - Admin Dashboard
  - Faculty Dashboard
  - Student Dashboard
- Course Enrollment

## Technologies Used
- Node.js
- Express.js
- MongoDB
- EJS (Embedded JavaScript templates)
- bcrypt (for password hashing)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Best-University-Registration.git# Best-University-Registration

2. Navigate to the project directory:
    cd Best-University-Registration

3. Install the dependencies:
    npm install

4. Set up your MongoDB connection string in a .env file:
    MONGODB_URI=your_mongodb_connection_string

5. Start the application:
    npm start

## Usage
1. Open your web browser and navigate to http://localhost:3000.
2. Register a new user by filling out the registration form.
3. Log in with your registered email and password.
4. Depending on your role (Admin, Faculty, or Student), you willbe redirected to the appropriate dashboard.

## Project Structure
controllers: Contains the logic for handling user registration and login.
models: Contains the Mongoose models for the application.
routes: Contains the route definitions for the application.
views: Contains the EJS templates for rendering the web pages.
public: Contains static assets such as CSS and JavaScript files.

## Contributing
1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Make your changes.
4. Commit your changes (git commit -m 'Add some feature').
5. Push to the branch (git push origin feature-branch).
6. Open a pull request.