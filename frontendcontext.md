# 🎨 Frontend Context – Microsoft Club GIKI Website

## 🧠 Overview

Build a **modern React frontend** for Microsoft Club GIKI with a **retro Windows 98-inspired UI aesthetic**, combined with clean modern UX.

The UI should resemble:

* Old operating system windows
* Notification popups
* Pixel-style components
* Grid-based layouts (similar to Instagram feed)

The goal is to create a **visually unique, interactive, and branded experience**.

---

## ⚙️ Tech Stack

* React.js (Vite or Next.js preferred)
* Tailwind CSS
* Framer Motion (for animations)
* Axios (API calls)
* React Router (if not using Next.js)

---

## 🎨 Design System

### 🎯 Color Palette

* Primary Blue: #3B82F6
* Dark Blue: #1E3A8A
* Purple Accent: #7C3AED
* Light Background: #E5E7EB
* White: #FFFFFF
* Black: #000000

---

### 🔤 Typography

* Headings: "Press Start 2P" (retro pixel font)
* Body: "Inter" or "Poppins"

---

### 🧱 UI Principles

* Use **thick borders (2px–3px)**
* Use **hard shadows (offset style)**
* Use **window-style containers**
* Use **pixel-style buttons**
* Maintain **clean spacing and alignment**
* Keep UI responsive

---

## 🧩 Core Reusable Components

### 1. WindowCard (MOST IMPORTANT)

A reusable component styled like a Windows OS window.

#### Features:

* Title bar
* Control buttons (minimize, maximize, close)
* Content area

#### Structure:

* Top bar (blue background)
* Title on left
* Buttons on right
* Content inside bordered container

---

### 2. PixelButton

Retro-style button:

* Thick borders
* Slight shadow
* Press animation on click

Used for:

* Apply Now
* Read More
* View Project

---

### 3. NotificationBox

Styled like a system alert:

* Icon (⚠️ or ℹ️)
* Bold title
* Short description

---

### 4. GridLayout

Reusable layout system:

* Responsive grid
* Used on homepage and listing pages
* Cards arranged like Instagram feed

---

### 5. Navbar

* Sticky top navigation
* Minimal design
* Links:

  * Home
  * Events
  * Members
  * Projects
  * Podcasts
  * Blogs

---

### 6. Footer

* Simple and clean
* Club branding
* Social links

---

## 📄 Pages Structure

---

### 🏠 Home Page

#### Layout:

* Grid-based layout (bento style)
* Mix of:

  * Featured events
  * Announcements
  * Inductions
  * Highlights

#### Behavior:

* Cards clickable → navigate to respective pages
* Add subtle animations

---

### 📅 Events Page

#### Features:

* List of events
* Filter:

  * Upcoming
  * Past

#### UI:

* Each event displayed as a **WindowCard**
* Show:

  * Title
  * Date
  * Description
  * Button (Register / View Details)

---

### 👥 Members Page

#### Sections:

* Current Executive Committee
* Alumni

#### UI:

* Member cards styled like system profile windows
* Include:

  * Image
  * Name
  * Role
  * Tenure

---

### 🚀 Projects Page

#### UI:

* Each project = WindowCard

#### Show:

* Title
* Description
* Tech stack
* Buttons:

  * GitHub
  * Demo

---

### 🎙️ Podcasts Page

#### UI:

* Each podcast = media window

#### Features:

* YouTube embed
* Title
* Guest name
* Date

---

### ✍️ Blogs Page

#### Layout:

* List of blog cards

#### Blog Detail Page:

* Styled like a **Notepad window**
* Clean reading experience

---

### 🔐 Admin (Frontend Only)

#### Pages:

* Login Page
* Dashboard

#### Dashboard Features:

* Forms to:

  * Add / edit / delete content

#### UI:

* Clean and modern (NOT retro)
* Focus on usability

---

## 🎞️ Animations

Use Framer Motion for:

* Card hover → scale slightly
* Card entry → fade + slide
* Button click → press effect
* Page transitions → smooth fade

---

## 🔌 API Integration

* Use Axios for API calls
* Base URL from environment variables

Example:

* GET /api/events
* GET /api/projects
* GET /api/blogs

---

## 📁 Folder Structure

/src
/components
WindowCard.jsx
PixelButton.jsx
NotificationBox.jsx
Navbar.jsx
Footer.jsx
/pages
Home.jsx
Events.jsx
Members.jsx
Projects.jsx
Podcasts.jsx
Blogs.jsx
BlogDetail.jsx
AdminLogin.jsx
Dashboard.jsx
/services
api.js
/utils
/assets

---

## 📱 Responsiveness

* Mobile-first design
* Grid collapses to 1 column on small screens
* Maintain spacing and readability

---

## 🧪 Best Practices

* Use reusable components
* Keep components modular
* Avoid inline styles (use Tailwind)
* Use environment variables for API URLs
* Handle loading and error states

---

## 🎯 Final Goal

The frontend should:

* Match Microsoft Club GIKI branding
* Feel unique and interactive
* Be responsive and modern
* Be easy to maintain and extend

---

## ⚠️ Important Instructions

* Do NOT overuse retro elements
* Keep balance between modern UI and retro styling
* Prioritize usability over aesthetics
* Ensure clean and readable layouts

---

## 🧩 Expected Output

Cursor should:

* Generate all pages
* Create reusable components
* Apply consistent design system
* Integrate API calls
* Implement routing

---
