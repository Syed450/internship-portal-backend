# Internship Portal Backend

Backend API for an Internship Portal built using Node.js, Express.js, MySQL, JWT Authentication, and bcrypt.

## Features

- User Registration
- User Login Authentication
- JWT Token Authorization
- Password Hashing using bcrypt
- Internship CRUD Operations
- Protected Routes
- Role-Based Access Control
- Internship Application System
- Duplicate Application Prevention

## Tech Stack

- Node.js
- Express.js
- MySQL
- JWT
- bcrypt
- Nodemon

## API Endpoints

### Authentication
- POST /register
- POST /login

### Internships
- GET /internships
- POST /internships
- PUT /internships/:id
- DELETE /internships/:id

### Applications
- POST /apply/:internshipId
- GET /applications

### Protected Route
- GET /profile

## Installation

Clone the repository:

```bash
git clone https://github.com/Syed450/internship-portal-backend.git
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node app.js
```

or

```bash
nodemon app.js
```

## Future Improvements

- Frontend Integration
- Admin Dashboard
- Student Dashboard
- Application Approval System
- Deployment
- Better Validation
- Environment Variables

## Author

Syed Arshad
