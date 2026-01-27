# CodeNode - CS Learning Hub

A comprehensive, gamified learning platform designed to help students build project-based programming skills through structured modules, progress tracking, and community collaboration.

## Overview

CodeNode is a full-stack educational platform that bridges the gap between theoretical computer science knowledge and practical project experience. Built for high school and college students, it provides an interactive environment where learners can tackle programming challenges across multiple domains while earning experience points and maintaining learning streaks.

The platform emphasizes hands-on learning through project-based modules, peer collaboration via study sessions, and progress visualization through metrics and achievement tracking.

## Features

- **Project-Based Learning**: Create and manage programming projects across multiple domains (Web Development, Cybersecurity, Databases, etc.)
- **Modular Curriculum**: Break projects into manageable modules with progress tracking
- **Gamification System**: Earn XP for completed modules and maintain daily learning streaks
- **User Onboarding**: Personalized experience based on skill level (Beginner, Intermediate, Advanced) and learning goals
- **Study Sessions**: Schedule and host collaborative learning sessions with peer feedback
- **Resource Library**: Curated collection of learning materials for each topic
- **Progress Metrics**: Visualize learning progress with completion percentages and statistics
- **Real-Time Notifications**: Streak notifications and XP reward toasts for engagement
- **File Uploads**: Support for project submissions and resource attachments via cloud storage
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Tech Stack

**Frontend**

- React 18 with TypeScript
- Next.js 14 (App Router)
- Tailwind CSS for styling
- Radix UI component library
- Framer Motion for animations
- React Hook Form with Zod validation
- Zustand for state management

**Backend**

- Next.js API routes (serverless functions)
- RESTful API architecture

**Database & Storage**

- MongoDB for user profiles, projects, sessions, and activity logs
- Supabase for authentication and file storage
- Connection pooling with MongoDB native driver

**Authentication & Authorization**

- Supabase Auth (session-based with secure cookies)

**DevOps & Monitoring**

- Vercel Analytics integration
- pnpm package manager

## Database / Data Design

```
USERS
┌──────────────────────────────────┐
│ PK user_id (Supabase UUID)       │
│ email                            │
│ name                             │
│ firstName, lastName              │
│ interests[]                      │
│ experienceLevel (enum)           │
│ learningGoals[]                  │
│ streak                           │
│ xp                               │
│ lastLoginDate                    │
│ createdAt                        │
└──────────────────────────────────┘
        ↑ FK (user_id)
        │
        ├─────────────┬──────────────┬─────────────┐
        │             │              │             │
┌───────────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────────────┐
│ PROJECTS      │ │ SESSIONS     │ │ ACTIVITIES │ │ ACTIVITY_LOGS   │
├───────────────┤ ├──────────────┤ ├────────────┤ ├─────────────────┤
│ PK id         │ │ PK _id       │ │ PK _id     │ │ PK _id          │
│ user_id (FK)  │ │ user_id (FK) │ │ user_id(FK)│ │ user_id (FK)    │
│ title         │ │ subject      │ │ type       │ │ type            │
│ description   │ │ description  │ │ projectId  │ │ projectId       │
│ modules[]     │ │ host_user_id │ │ timestamp  │ │ timestamp       │
│ createdAt     │ │ date         │ │            │ │ createdAt       │
│ updatedAt     │ │ createdAt    │ │            │ │                 │
└───────────────┘ │              │ │            │ │                 │
                  │              │ │            │ │                 │
                  └──────────────┘ └────────────┘ └─────────────────┘

PROJECTS.modules (nested array)
┌──────────────────────┐
│ _id (ObjectId)       │
│ title                │
│ completed (boolean)  │
│ notes (optional)     │
└──────────────────────┘
```

**Data Flow**:

1. Users authenticate via Supabase
2. User profile created in MongoDB with initial XP (0) and streak (0)
3. Projects and modules created per user
4. Activities logged when modules are completed
5. XP and streak updated based on activity records
6. Sessions facilitate peer collaboration with host_user_id tracking

## System Architecture / How It Works

```
[Client Browser]
    ↓
[Next.js Frontend + UI Components]
    ↓ (HTTP requests)
[Next.js API Routes] (/api/*)
    ├─ Authentication (Supabase Session)
    ├─ Authorization (User ID validation)
    └─ Business Logic
    ↓
[MongoDB] ← Data Layer
    │
    └─→ Users, Projects, Sessions, Activities

[Supabase] ← Auth + File Storage
    ├─ Session Management
    └─ User Uploads
```

**Key Architectural Decisions**:

- Supabase for authentication ensures secure, scalable session management without managing passwords directly
- MongoDB provides flexible schema for evolving data models (projects, modules, activities)
- Next.js API routes eliminate need for separate backend server, reducing infrastructure complexity
- Zustand state management keeps client-side state minimal and performant
- Radix UI ensures accessible, production-ready component primitives

## Installation & Setup

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB Atlas or local MongoDB instance
- Supabase project with Auth and Storage enabled
- Environment variables configured

### Environment Variables

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Usage

### For Students

1. Sign up and complete onboarding (select skill level and learning goals)
2. Explore available projects or create new projects
3. Complete modules within projects to earn XP
4. Maintain learning streaks by logging in daily
5. Join or schedule study sessions with peers
6. Track progress through metrics dashboard

### For Educators

1. Create learning projects with structured modules
2. Host study sessions to guide students
3. Monitor student progress through the metrics system
4. Customize resources for specific learning paths

### Key Workflows

**Project Creation**:
User clicks "New Project" → Sets title/description → Adds modules → Publishes

**Module Completion**:
Student completes module → XP awarded → Streak maintained → Activity logged

**Study Sessions**:
Host creates session → Invites peers → Session recorded → Feedback shared

## Key Learnings

- **User Engagement Through Gamification**: Implementing streaks and XP systems significantly increased daily active users compared to traditional learning platforms. Streak preservation became a powerful motivator for consistent engagement.

- **Modular Data Design for Flexibility**: Using MongoDB's nested arrays for modules within projects allowed rapid iteration on curriculum structure without database migrations. However, this required careful indexing as user counts grew.

- **Session-Based Authentication at Scale**: Supabase's managed auth with secure HTTP-only cookies simplified security implementation while eliminating token management complexity. Session validation on every API call ensured protection against unauthorized access.

- **Component Composition Over Customization**: Investing heavily in Radix UI primitives reduced time-to-implementation but required careful attention to accessibility standards (ARIA labels, keyboard navigation).

- **State Management Scope**: Zustand proved lightweight for UI state (sidebar toggles, theme), but keeping business logic in server-side API calls reduced client complexity and ensured data consistency.

- **File Upload Architecture**: Using Supabase Storage alongside MongoDB for file metadata required explicit consistency handling between two data sources. Implementing soft-delete patterns prevented orphaned files.

## Future Improvements

- **AI-Powered Learning Paths**: Recommend projects based on user skill level and learning velocity using ML models
- **Code Execution Environment**: Integrate containerized sandbox (Docker/Firecracker) for in-browser code submission and automated testing
- **Advanced Analytics**: Build learning outcome predictions and identify at-risk students early
- **Social Features**: Implement peer code reviews, forums, and leaderboards for community engagement
- **Mobile App**: React Native companion app for session notifications and streaks on-the-go
- **Certification System**: Issue verified certificates upon completion of structured learning tracks
- **Offline Support**: Progressive Web App (PWA) capabilities for offline access to resources
- **Accessibility Improvements**: Enhanced screen reader support and multi-language internationalization
- **Performance Optimization**: Implement incremental static regeneration (ISR) for resource pages and caching strategies for frequently accessed data
- **API Rate Limiting**: Implement per-user rate limiting and DDoS protection as platform scales

---

**Built for the FBLA 2026 Competition**
