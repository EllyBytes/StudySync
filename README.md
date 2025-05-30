
# Personalized Study Planner

The Personalized Study Planner is a **full-stack web application** designed to help users efficiently manage their study schedules. It allows users to add subjects, track progress, and generate optimized study schedules within a specified date range, all while accommodating personal unavailability. The application promotes effective study habits by suggesting practical session lengths (30 minutes to 2 hours) with built-in 15-minute breaks.

---

## Features

* **Subject Management**: Easily add, view, update, and delete subjects. Include details like total study hours, hours already studied, and deadlines.
* **Dynamic Schedule Generation**: Generate tailored study schedules for selected subjects within a defined date range. The planner intelligently avoids pre-set unavailable time slots.
* **Progress Tracking**: Monitor study progress for each subject, with real-time calculations of remaining hours.
* **Secure Authentication**: Features robust user authentication powered by JSON Web Tokens (JWT) to protect user data.
* **User Data Isolation**: Ensures each user's subjects, study progress, and schedules are securely isolated using unique user IDs.
* **Responsive User Interface**: Built with React, providing a seamless and intuitive experience across various devices.

---

## Tech Stack

* **Frontend**:
    * **React**: For building the dynamic and responsive user interface.
    * **Axios**: For making HTTP requests to the backend API.
    * **Vite**: A fast build tool for React development.
* **Backend**:
    * **Node.js**: The JavaScript runtime environment.
    * **Express**: A flexible Node.js web application framework for building APIs.
* **Database**:
    * **MongoDB**: A NoSQL database used for flexible and scalable data storage.
    * **Mongoose**: An elegant MongoDB object modeling tool for Node.js.
* **Authentication**:
    * **JSON Web Tokens (JWT)**: For secure and stateless user authentication.

---

## Project Structure

```
personalized-study-planner/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SubjectList.jsx   # Component to list and manage subjects
│   │   │   └── SchedulePage.jsx  # Component to generate and view schedules
│   │   └── App.jsx               # Main React application component
│   └── package.json            # Frontend dependencies
└── server/                     # Node.js backend
    ├── models/
    │   ├── Subject.js            # Mongoose schema for subjects
    │   └── SubjectSchedule.js    # Mongoose schema for schedules
    ├── routes/
    │   ├── subjects.js           # API routes for subject management
    │   └── schedules.js          # API routes for schedule generation
    ├── middleware/
    │   └── auth.js               # JWT authentication middleware
    ├── index.js                  # Server entry point
    └── package.json            # Backend dependencies
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v16 or higher)
* **npm** (comes with Node.js)
* **MongoDB** (running locally or accessible via a cloud provider like MongoDB Atlas)

---

## Setup Instructions

Follow these steps to get the Personalized Study Planner up and running on your local machine:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personalized-study-planner
```

### 2. Set Up the Backend

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install backend dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory and add the following environment variables. Remember to replace placeholders with your actual values:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/studyPlanner
    JWT_SECRET=your_secure_jwt_secret_key
    ```
    * Replace `your_secure_jwt_secret_key` with a long, strong, and unique secret string.
    * Update `MONGODB_URI` if you're using a cloud MongoDB instance (e.g., MongoDB Atlas connection string).
4.  If running MongoDB locally, ensure your MongoDB server is started:
    ```bash
    mongod
    ```
5.  Start the backend server:
    ```bash
    npm start
    ```
    The server will be running at `http://localhost:5000`.

### 3. Set Up the Frontend

1.  Navigate to the `client` directory (from the project root):
    ```bash
    cd ../client
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will typically run at `http://localhost:5173` (default Vite port).

### 4. Access the Application

Open your web browser and navigate to `http://localhost:5173`. You can then log in (or sign up if user registration routes are available) to begin managing your subjects and generating personalized study schedules!

---

## API Endpoints

The application interacts with the following RESTful API endpoints:

### Authentication

* **`POST /api/auth/login`**
    * **Purpose**: Authenticate a user. (Assumed endpoint for login flow)
    * **Request Body**:
        ```json
        {
          "username": "string",
          "password": "string"
        }
        ```
    * **Response**:
        ```json
        {
          "token": "JWT_TOKEN"
        }
        ```
    * *Note*: Include the returned JWT in the `Authorization` header as `Bearer <token>` for all protected routes.

### Subjects

* **`GET /api/subjects`**
    * **Purpose**: Fetch all subjects belonging to the authenticated user.
    * **Response**: `Array of Subject Objects`
        ```json
        [
          {
            "_id": "string",
            "userId": "string",
            "name": "string",
            "hours": number,
            "hoursStudied": number,
            "deadline": "date"
          }
        ]
        ```
* **`POST /api/subjects`**
    * **Purpose**: Add a new subject.
    * **Request Body**:
        ```json
        {
          "name": "string",
          "hours": number,
          "hoursStudied": number,
          "deadline": "date"
        }
        ```
    * **Response**: `Created Subject Object`
        ```json
        {
          "_id": "string",
          "userId": "string",
          "name": "string",
          "hours": number,
          "hoursStudied": number,
          "deadline": "date"
        }
        ```
* **`DELETE /api/subjects/:id`**
    * **Purpose**: Delete a subject and its associated schedule.
    * **Response**:
        ```json
        {
          "message": "Subject and its schedule deleted successfully"
        }
        ```

### Schedules

* **`GET /api/schedules`**
    * **Purpose**: Fetch all generated schedules for the authenticated user.
    * **Response**: `Array of Schedule Objects`
        ```json
        [
          {
            "userId": "string",
            "subject": "string",
            "startDate": "string",
            "endDate": "string",
            "schedule": [
              {
                "date": "string",
                "slots": [
                  {
                    "startTime": "string",
                    "endTime": "string"
                  }
                ]
              }
            ],
            "unavailableTimes": [
              {
                "date": "string",
                "startTime": "string",
                "endTime": "string"
              }
            ]
          }
        ]
        ```
* **`POST /api/schedules`**
    * **Purpose**: Generate and save a study schedule for selected subjects within a date range, considering unavailable times.
    * **Request Body**:
        ```json
        {
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "selectedSubjects": ["subjectId1", "subjectId2"],
          "unavailableTimes": [
            {
              "date": "YYYY-MM-DD",
              "startTime": "HH:MM",
              "endTime": "HH:MM"
            }
          ]
        }
        ```
    * **Response**:
        ```json
        {
          "message": "Schedules generated successfully"
        }
        
