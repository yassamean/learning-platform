# Learning Platform

A web app for school students. Students can watch course lectures, comment on them, and take quizzes. Teachers can manage courses and lectures, and admins manage users.

## Stack

Frontend: React with Vite
Backend: Express (Node.js)
Database: MongoDB

## Running it locally

### Backend

Go into the backend folder and run:

```
npm install
npm run dev
```

You need a .env file in backend with these variables:

```
MONGO_URI=
JWT_SECRET=
FRONTEND_URL=
RECAPTCHA_SECRET_KEY=
SENDER_EMAIL_ADDRESS=
SENDER_EMAIL_PASSWORD=
BASE_URL_FOR_EMAIL=
BLOB_READ_WRITE_TOKEN=
```

### Frontend

Go into the frontend folder and run:

```
npm install
npm run dev
```

You need a .env file in frontend with:

```
VITE_API_BASE_URL=
```

This should point to wherever the backend is running, for example http://localhost:3000 for local development.

## Test accounts

Teacher login: username teacher, password teacher

Admin login: username admin, password admin

Student accounts you can just make yourself on the register page, with your own email or a fake one.

## Deployment

The frontend is hosted on Vercel and the backend on Render. The database runs on MongoDB Atlas.
