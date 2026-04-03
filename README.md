# Wing Training Management System Frontend By SO BUNLENG

A specialized internal training platform built with Next.js, React, and TypeScript. Unlike general education platforms, WTMS is a tailored solution designed specifically to support and enhance Wing’s internal employee training program. It centralizes learning activities to improve efficiency, accountability, and professional development within the organization.
---

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (v16)
- **Language:** TypeScript, React 19
- **Styling:** Tailwind CSS, PostCSS
- **UI Components:** shadcn/ui, Radix UI, lucide-react
- **State/Data:** @tanstack/react-query
- **Utilities:** date-fns, clsx, xlsx, sweetalert2
- **Linting/Formatting:** ESLint, Prettier
- **Package Manager:** npm 

---

## 🏗️ Project Structure

```
frontend/
├── app/              # Next.js App Router (pages, layouts, templates)
├── components/       # Shared UI components (shadcn/ui, buttons, cards)
├── hooks/            # Custom React hooks for logic and state
├── lib/              # Configuration (Prisma, data formatting, constants)
├── service/          # API service logic and external integrations
├── styles/           # Global CSS and Tailwind directives
├── utils/            # Helper functions and utility logic
├── public/           # Static assets (images, fonts, icons)
├── package.json      # Project metadata and scripts
└── tailwind.config.js # Tailwind CSS configuration
---
```

## 🌐 Hosting Architecture

- **Frontend:** Hosted on [Vercel](https://vercel.com/)
- **Backend:** Spring Boot API hosted on a VPS (e.g., DigitalOcean, AWS EC2)
- **Database:** (e.g., PostgreSQL/MySQL) hosted on the same VPS as backend
- **Image Storage:** [Cloudinary](https://cloudinary.com/) (for user-uploaded images)

---

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api-url
```

### 4. Run the development server

```bash
npm dev
```

Visit [http://localhost:8888](http://localhost:8888) to view the app.

### 5. Build for production

```bash
npm build
npm start
```

---

## 🛠️ Available Scripts

- `npm dev` — Start development server
- `npm build` — Build for production
- `npm start` — Start production server
- `npm lint` — Run ESLint
- `npm lint:fix` — Fix lint errors
- `npm format:check` — Check formatting
- `npm format:fix` — Format code
- `npm clean:deps` — Prune and dedupe dependencies

---

## 📚 Features

- Role-Based Access Control (RBAC): Secure login with specific permissions for Admin, Trainer, and Employee roles .
- Training Session Management: Tools to create programs, schedule sessions, and assign teams .     
- Material Repository: Centralized storage and organization for PDF, slide, and video training documents .
- Assignment & Evaluation: Online portal for task submission, automated grading, and trainer feedback .
- Progress Tracking: Real-time monitoring of individual employee learning paths and completion status .
- Attendance Monitoring: Digital tracking of session participation and attendance reporting .
- Automated Notifications: System alerts for new materials and reminders for upcoming deadlines .
- Analytics & Reporting: Generation of performance reports for HR and management review .
- Interactive Dashboard: A modern summary view of ongoing sessions and recent announcements .
- Responsive, modern UI

---

## 📦 API Integration

All data is fetched from the backend API defined by `NEXT_PUBLIC_API_BASE_URL`.

---
 
## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Vercel](https://vercel.com/)

---