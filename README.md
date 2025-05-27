Personalized Study Planner
Overview
The Personalized Study Planner is a web application designed to help users manage their study schedules efficiently. Users can add subjects, track study progress, and generate schedules within a specified date range while respecting unavailable time slots. The application ensures practical study sessions (30 minutes to 2 hours) with 15-minute breaks between sessions on the same day.
Features

Subject Management: Add, view, and delete subjects with details like total hours, hours studied, and deadlines.
Schedule Generation: Generate study schedules for selected subjects within a date range, avoiding unavailable times.
Progress Tracking: Track hours studied for each subject and calculate remaining hours.
Authentication: Secure user authentication using JSON Web Tokens (JWT).
Data Isolation: Each user’s data (subjects and schedules) is isolated using userId.
Responsive UI: Built with React, providing a user-friendly interface.

Tech Stack

Frontend: React, Axios
Backend: Node.js, Express
Database: MongoDB
Authentication: JSON Web Tokens (JWT)
Other Tools: Mongoose (MongoDB ORM), Vite (for React development)

Project Structure
personalized-study-planner/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SubjectList.jsx   # Component to list and manage subjects
│   │   │   └── SchedulePage.jsx  # Component to generate and view schedules
│   │   └── App.jsx
│   └── package.json
└── server/                 # Node.js backend
    ├── models/
    │   ├── Subject.js         # Mongoose schema for subjects
    │   └── SubjectSchedule.js # Mongoose schema for schedules
    ├── routes/
    │   ├── subjects.js        # API routes for subject management
    │   └── schedules.js       # API routes for schedule generation
    ├── middleware/
    │   └── auth.js            # JWT authentication middleware
    ├── index.js               # Server entry point
    └── package.json

Prerequisites

Node.js (v16 or higher)
MongoDB (running locally or via a cloud provider like MongoDB Atlas)
npm (comes with Node.js)

Setup Instructions
1. Clone the Repository
git clone <repository-url>
cd personalized-study-planner

2. Set Up the Backend

Navigate to the server directory:cd server


Install dependencies:npm install


Create a .env file in the server directory with the following:PORT=5000
MONGODB_URI=mongodb://localhost:27017/studyPlanner
JWT_SECRET=your_jwt_secret


Replace your_jwt_secret with a secure secret key for JWT.
Update MONGODB_URI if using a cloud MongoDB instance.


Start MongoDB (if running locally):mongod


Start the backend server:npm start

The server will run on http://localhost:5000.

3. Set Up the Frontend

Navigate to the client directory:cd client


Install dependencies:npm install


Start the development server:npm run dev

The frontend will run on http://localhost:5173 (default Vite port).

4. Access the Application

Open your browser and go to http://localhost:5173.
Log in (or sign up if the auth routes are implemented) to start managing subjects and generating schedules.

API Endpoints
Authentication

POST /api/auth/login (assumed, not implemented in provided code)
Body: { "username": "string", "password": "string" }
Response: { "token": "JWT_TOKEN" }


Include the JWT in the Authorization header for protected routes: Bearer <token>.

Subjects

GET /api/subjects
Fetch all subjects for the authenticated user.
Response: [{ "_id": "string", "userId": "string", "name": "string", "hours": number, "hoursStudied": number, "deadline": "date" }]


POST /api/subjects
Add a new subject.
Body: { "name": "string", "hours": number, "hoursStudied": number, "deadline": "date" }
Response: { "_id": "string", ...subjectData }


DELETE /api/subjects/:id
Delete a subject and its associated schedule.
Response: { "message": "Subject and its schedule deleted successfully" }



Schedules

GET /api/schedules
Fetch all schedules for the authenticated user.
Response: [{ "userId": "string", "subject": "string", "startDate": "string", "endDate": "string", "schedule": [{ "date": "string", "slots": [{ "startTime": "string", "endTime": "string" }] }], "unavailableTimes": [{ "date": "string", "startTime": "string", "endTime": "string" }] }]


POST /api/schedules
Generate and save a schedule for selected subjects.
Body: { "startDate": "string", "endDate": "string", "selectedSubjects": ["string"], "unavailableTimes": [{ "date": "string", "startTime": "string", "endTime": "string" }] }
Response: { "message": "Schedules generated successfully" }








