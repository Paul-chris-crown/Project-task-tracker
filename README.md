# Task Tracker - Project Management App

A production-ready project tracking application built with Next.js 14, featuring project management, task tracking, and team collaboration.

## 🚀 Features

### Core Functionality
- **Project Management**: Create, edit, delete, and track projects with progress bars
- **Task Management**: Add tasks to projects, assign team members, and track completion status
- **Role-based Access**: Owner, Admin, and Member roles with appropriate permissions
- **Dashboard Analytics**: Visual progress charts and project statistics

### User Experience
- **Modern UI**: Built with TailwindCSS and shadcn/ui components
- **Responsive Design**: Mobile-first approach with beautiful, intuitive interface
- **Authentication**: Simple admin password authentication
- **Notifications**: Toast notifications for all user actions

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** for component library
- **Lucide React** for icons

### Backend
- **Prisma** ORM with PostgreSQL
- **Simple Password Authentication** with secure HTTP-only cookies

### Development
- **ESLint** and **Prettier** for code quality
- **Strict TypeScript** configuration
- **Clean folder structure** following Next.js best practices

## 📁 Project Structure

```
Task-tracker/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── projects/         # Project management components
│   ├── tasks/            # Task management components
│   └── admin/            # Admin dashboard components
├── lib/                  # Utility libraries
├── prisma/               # Database schema
└── hooks/                # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/tasktracker"
   
   # Admin Authentication
   ADMIN_PASSWORD="your-secure-admin-password-here"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database with initial admin user**
   ```bash
   npx prisma db seed
   ```
   Note: You'll need to manually add the first admin user to the `AllowedUser` table in your database.

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### User Model
- `id`: Unique identifier
- `name`: User's full name
- `email`: Unique email address
- `role`: User role (OWNER, ADMIN, MEMBER)
- `createdAt`: Account creation timestamp

### Project Model
- `id`: Unique identifier
- `name`: Project name
- `description`: Project description
- `status`: Project status (ACTIVE, COMPLETED, ON_HOLD, CANCELLED)
- `startDate`: Project start date
- `dueDate`: Project deadline
- `ownerId`: Reference to project owner

### Task Model
- `id`: Unique identifier
- `projectId`: Reference to parent project
- `title`: Task title
- `description`: Task description
- `status`: Task status (TODO, IN_PROGRESS, COMPLETED, OVERDUE)
- `dueDate`: Task deadline
- `assigneeId`: Reference to assigned team member

## 🔐 Authentication

The app uses a simple and secure admin password authentication system:

1. **Single Admin Password**: Configured via `ADMIN_PASSWORD` environment variable
2. **Secure Cookies**: HTTP-only, secure cookies for session management
3. **Route Protection**: All app routes are protected except `/login` and static files
4. **Automatic Redirects**: Unauthenticated users are redirected to login

## 🎯 Usage

### Accessing the App
1. Navigate to the app URL
2. Enter the admin password on the login page
3. Access the dashboard and all features

### Creating Projects
1. Navigate to the Projects page
2. Click "Create Project"
3. Fill in project details (name, description, dates, status)
4. Save the project

### Managing Tasks
1. Open a project
2. Click "Add Task"
3. Set task details and assign team members
4. Track progress with status updates

### Dashboard Overview
- View project progress charts
- Monitor task completion rates
- Track overdue items
- See team performance metrics

### Logging Out
- Click the "Logout" button in the sidebar
- You'll be redirected to the login page

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard (including `ADMIN_PASSWORD`)
4. Deploy automatically

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Prisma Studio

## 📝 License

This project is licensed under the MIT License.
