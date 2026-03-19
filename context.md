# Microsoft Club GIKI – Website (Full-Stack Project Context)

## 🧠 Project Overview

Build a full-stack web platform for **Microsoft Club GIKI** that serves as a centralized hub for:

* Events management
* Member directory (current and alumni ECs)
* Project showcase
* Logikal podcast display
* Blog publishing system
* Admin dashboard for content management

This platform should function like a **custom CMS (Content Management System)** tailored for a university tech club.

---

## 🏗️ Tech Stack

### Frontend

* React.js (with Vite or Next.js preferred)
* Tailwind CSS for styling
* Axios for API calls
* React Router (if not using Next.js)

### Backend

* Node.js with Express.js

### Database

* MongoDB (with Mongoose)

### Authentication

* JWT-based authentication
* Role: Admin only (for now)

### Deployment (later stage)

* Frontend: Vercel
* Backend: Render / Railway
* Database: MongoDB Atlas
* Media: Cloudinary (for images)

---

## 📁 Core Features & Modules

### 1. Events Portal

* Display upcoming and past events
* Each event includes:

  * Title
  * Description
  * Date
  * Images
  * Speakers
  * Registration link (optional)

---

### 2. Member Directory

* Two sections:

  * Current Executive Committee (EC)
  * Alumni (Past ECs)

Each member includes:

* Name
* Role
* Tenure (e.g., 2024–2025)
* Profile image
* LinkedIn (optional)

---

### 3. Project Showcase

* Display projects built by club members

Each project includes:

* Title
* Description
* Tech stack
* GitHub link
* Demo link (optional)
* Contributors

---

### 4. Logikal Podcast Page

* Showcase podcast episodes

Each episode includes:

* Title
* Description
* YouTube embed link
* Guest name
* Date

---

### 5. Blog System

* Public blog listing page
* Individual blog pages

Each blog includes:

* Title
* Content (rich text)
* Author
* Tags
* Created date

---

### 6. Admin Dashboard (Protected)

* Admin login required
* Admin can:

  * Create, edit, delete:

    * Events
    * Members
    * Projects
    * Podcasts
    * Blogs

---

## 🗄️ Database Schema Design (Mongoose Models)

### Event Model

* title: String
* description: String
* date: Date
* type: "upcoming" | "past"
* images: [String]
* speakers: [String]
* registrationLink: String

---

### Member Model

* name: String
* role: String
* tenure: String
* image: String
* linkedin: String
* isCurrent: Boolean

---

### Project Model

* title: String
* description: String
* techStack: [String]
* githubLink: String
* demoLink: String
* contributors: [String]

---

### Podcast Model

* title: String
* description: String
* youtubeLink: String
* guest: String
* date: Date

---

### Blog Model

* title: String
* content: String
* author: String
* tags: [String]
* createdAt: Date

---

### Admin Model

* email: String
* password: String (hashed using bcrypt)

---

## 🔐 Authentication & Authorization

* Use JWT tokens for authentication
* Admin login endpoint:

  * POST /api/auth/login
* Protect all admin routes using middleware
* Only authenticated admin can perform CRUD operations

---

## 🔌 API Structure (RESTful)

### Auth

* POST /api/auth/login

### Events

* GET /api/events
* POST /api/events
* PUT /api/events/:id
* DELETE /api/events/:id

### Members

* GET /api/members
* POST /api/members
* PUT /api/members/:id
* DELETE /api/members/:id

### Projects

* GET /api/projects
* POST /api/projects
* PUT /api/projects/:id
* DELETE /api/projects/:id

### Podcasts

* GET /api/podcasts
* POST /api/podcasts
* PUT /api/podcasts/:id
* DELETE /api/podcasts/:id

### Blogs

* GET /api/blogs
* GET /api/blogs/:id
* POST /api/blogs
* PUT /api/blogs/:id
* DELETE /api/blogs/:id

---

## 🎨 Frontend Pages

### Public Pages

* Home
* Events (Upcoming + Past)
* Members (Current + Alumni)
* Projects
* Podcasts
* Blogs
* Blog Details Page

### Admin Pages

* Login Page
* Dashboard
* CRUD Forms for all modules

---

## 💡 UI/UX Guidelines

* Clean, modern UI (inspired by Microsoft design)
* Responsive design (mobile + desktop)
* Card-based layouts for events/projects/blogs
* Use modals or forms for admin CRUD operations
* Use a rich text editor for blog creation

---

## 🚀 Advanced Features (Optional but Preferred)

* Search & filter (events/projects/blogs)
* Tag-based filtering for blogs
* Image upload via Cloudinary
* Analytics (views per blog/event)
* Role-based system (future expansion)

---

## 📦 Folder Structure (Recommended)

### Backend

* /models
* /routes
* /controllers
* /middleware
* /config

### Frontend

* /components
* /pages
* /services (API calls)
* /context (auth state)
* /utils

---

## 🧪 Development Approach

1. Build backend APIs first
2. Test APIs with Postman
3. Build frontend pages
4. Connect frontend with APIs
5. Implement authentication
6. Build admin dashboard
7. Deploy

---

## 🎯 Goal

The final product should be:

* Fully functional
* Scalable
* Easy for future club members to maintain
* Professional enough to be used as the official club website

---

## ⚠️ Important Notes

* Write clean, modular, reusable code
* Use environment variables for secrets
* Follow RESTful API conventions
* Ensure proper error handling
* Use async/await for all async operations

---

## 🧩 Expected Output

Cursor should:

* Generate backend (Express + MongoDB)
* Generate frontend (React + Tailwind)
* Implement authentication
* Build admin dashboard
* Connect everything end-to-end

---
