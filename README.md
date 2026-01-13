# Modern Portfolio Template

A professional developer portfolio website with **admin panel** and stunning **claymorphism** and **glassmorphism** designs. Built with Next.js 16, TypeScript, and modern web technologies.

![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Vercel-336791)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5.0-orange)

## ✨ Features

### 🎨 Design System
- **Claymorphism** - soft clay-like shadows and textures for resume sections
- **Glassmorphism** - translucent glass effects for project showcases
- **Neomorphic buttons** - modern tactile interface elements
- Smooth animations and micro-interactions
- Fully responsive design across all devices
- Professional color schemes with subtle gradients

### 📱 Pages & Interface
- **Home (Resume)** - elegant CV display with claymorphism styling
- **Projects** - portfolio gallery with glassmorphism effects
- **Admin Panel** - comprehensive content management system
- **Authentication** - secure login/register with email verification
- **Print/PDF Export** - professional resume output

### 🛠 Core Functionality
- **Complete Admin System** - manage CV and projects with live preview
- **Secure Authentication** - NextAuth.js with role-based access control
- **User Registration** - email verification and account management
- **Database Management** - PostgreSQL with automatic setup and migrations
- **Image Handling** - upload, organize, and optimize images
- **Email System** - automated notifications and confirmations

### 🛠 Tech Stack
- **Framework**: Next.js 16 with Turbopack, React 19, TypeScript
- **Styling**: Tailwind CSS 4.0, Custom CSS animations
- **Code Quality**: ESLint 9, Prettier 3.7 with Tailwind plugin
- **Database**: PostgreSQL with SSL (Vercel/Supabase compatible)
- **Authentication**: NextAuth.js 5.0 with JWT sessions
- **Email**: Nodemailer with SMTP/Gmail App Password support
- **Security**: bcryptjs hashing, CSRF protection, SQL injection prevention, server-only module protection
- **Icons**: Lucide React icon library
- **Image Processing**: Base64 encoding with size optimization
- **PDF Generation**: pdf-lib for professional resume export

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/your-username/portfolio-template.git
cd portfolio-template
npm install
```

### 2. Environment Setup
Create `.env.local` in the project root:

```env
# Database
POSTGRES_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Authentication (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-random-secret-key-here"

# Email (for registration)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
```

⚠️ **Generate secure secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Options

**Vercel Postgres (Recommended)**
1. Create project on [Vercel](https://vercel.com)
2. Add Postgres database in Storage tab
3. Copy connection string to `.env.local`

**Supabase Alternative**
1. Create project on [Supabase](https://supabase.com)
2. Get connection URL from Settings → Database
3. Add as `POSTGRES_URL` in `.env.local`

### 4. Email Configuration

**Gmail Setup (Recommended)**
1. Enable 2FA in Google Account
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use App Password in `EMAIL_PASS` field

### 5. Launch Application
```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Check code quality with ESLint
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
# Open http://localhost:3000
```

### 6. Initial Setup
1. Visit `http://localhost:3000/admin/login`
2. Complete **System Initialization** form:
   - AdCode Quality Tools
```bash
# Format entire codebase
npm run format

# Check formatting without changes
npm run format:check

# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint -- --fix
```

### 8. min username and password
   - Email for account recovery
3. System creates database tables automatically
4. Access admin panel to manage content

### 7. Production Deployment
```bash
npm run build
npm start
```

**Vercel Deployment:**
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

## 📁 Project Architecture

```
app/
├── admin/                     # 🔐 Admin Panel
│   ├── components/
│   │   ├── AdminDashboard.tsx    # Main admin interface
│   │   ├── CVEditor.tsx          # Resume editor with live preview
│   │   ├── ProjectsEditor.tsx    # Portfolio management
│   │   └── AdminSettings.tsx     # System configuration
│   └── login/page.tsx           # Admin authentication
│
├── api/                       # API Routes
│   ├── auth/[...nextauth]/      # NextAuth.js handlers
│   ├── admin/                   # Protected admin endpoints
│   │   ├── cv/                  # Resume CRUD operations
│   │   ├── projects/            # Portfolio CRUD operations
│   │   ├── images/              # Image upload/management
│   │   └── setup/               # Initial system setup
│   └── cv-data/                 # Public CV data endpoint
│
├── components/                # React Components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx           # Neomorphic button variants
│   │   ├── Card.tsx             # Clay/glass card components
│   │   ├── Navigation.tsx       # Site navigation
│   │   └── MultipleImageUpload.tsx # Image management
│   ├── ProjectCard.tsx          # Individual project display
│   └── LazyAvatar.tsx          # Optimized avatar component
│
├── lib/                       # Core Logic
│   ├── auth-config.ts           # NextAuth configuration
│   ├── cv-service.ts            # Resume data management
│   ├── db.ts                    # Database operations
│   ├── image-service.ts         # Image processing
│   └── email-service.ts         # Email notifications
│
├── projects/                  # Portfolio Pages
├── middleware.ts             # Route protection
├── globals.css              # Global styles & animations
└── layout.tsx              # Root layout with metadata
```

## 🎨 Design System

### Claymorphism (Resume)
- **Soft tactile shadows** - inner and outer shadow combinations
- **Warm color palette** - subtle grays, beiges, and blues
- **Clay-like textures** - creates physical, touchable feel
- **Gentle gradients** - adds depth without overwhelming

### Glassmorphism (Projects)
- **Translucent surfaces** - backdrop blur with transparency
- **Vibrant backgrounds** - dynamic gradients and colors
- **Glass-like effects** - crisp borders and subtle reflections
- **Modern aesthetics** - clean, futuristic appearance

### Interactive Elements
- **Neomorphic buttons** - multiple variants (clay, glass, primary)
- **Hover animations** - smooth scaling and glow effects
- **Loading states** - skeleton screens and progress indicators
- **Micro-interactions** - subtle feedback on user actions

## 🗃 Database Schema

PostgreSQL database with **automatic initialization** - no manual setup required!

### Core Tables
- **`users`** - System administrators and registered users
- **`cv_data`** - Resume information with JSON fields for flexibility
- **`projects`** - Portfolio projects with metadata and images
- **`images`** - Centralized image storage with entity relationships
- **`cv_experience`** - Work experience entries with ordering
- **`cv_education`** - Education history with institutions
- **`cv_languages`** - Language skills with proficiency levels

### Smart Initialization
✅ **Zero configuration required** - tables created automatically
✅ **Safe setup process** - validates existing data before creation
✅ **Migration support** - handles schema updates seamlessly
✅ **Data integrity** - foreign key relationships and constraints

### Development Tools
```bash
# Check database status
curl http://localhost:3000/api/admin/setup

# View table structure after initialization
npm run db:status
```

## 📱 Responsive Design

**Mobile-first approach** with perfect scaling across devices:
- **Mobile** (320px+) - Touch-optimized interface
- **Tablet** (768px+) - Balanced layout with sidebars
- **Desktop** (1024px+) - Full-featured experience
- **Wide screens** (1440px+) - Spacious, professional layout

## 🖨 Print & Export Features

**Professional resume output:**
- **Print-optimized CSS** - clean, readable formatting
- **PDF export** - via browser print dialog
- **Smart hiding** - removes navigation and interactive elements
- **Consistent styling** - maintains visual hierarchy

- **Server-only modules** - prevents accidental client-side imports of sensitive code
- **Session-based authorization** - userId from server session, never from client arguments
## 🔒 Security Features

### Enterprise-Grade Authentication
- **NextAuth.js 5.0** - industry-standard authentication
- **bcryptjs hashing** - secure password storage with salt
- **JWT sessions** - stateless, scalable authentication
- **Role-based access** - admin/user permission system
- **CSRF protection** - built-in request validation

### Data Protection
- **SQL injection prevention** - parameterized queries only
- **XSS protection** - automatic output escaping
- **Secure cookies** - httpOnly, secure flags in production
- **Input validation** - comprehensive data sanitization
- **File upload security** - MIME type validation and size limits

### Production Security
```env
# Security checklist for deployment
NEXTAUTH_SECRET="32+-character-random-string"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 🚀 Deployment Guide

### Vercel (Recommended)
1. **Fork repository** and connect to Vercel
2. **Configure environment variables** in dashboard
3. **Deploy automatically** - Vercel handles SSL and CDN
4. **Complete admin setup** on first visit

### Code Quality & Maintainability
- **Prettier** - consistent code formatting across the entire codebase
- **Tailwind CSS plugin** - automatic class sorting for better readability
- **ESLint** - catch bugs and enforce best practices
- **TypeScript strict mode** - compile-time type safety
- **Modular architecture** - clean separation of concerns

### Production Checklist
- ✅ Environment variables configured
- ✅ Strong `NEXTAUTH_SECRET` generated
- ✅ Database connection tested
- ✅ Email service configured
- ✅ SSL certificate active
- ✅ Admin account created

## 🚀 Performance

### Optimization Features
- **Next.js 16 with Turbopack** - ultra-fast development and builds
- **Image optimization** - automatic WebP conversion and lazy loading
- **Static generation** - pre-rendered pages for lightning speed
- **Caching strategies** - smart cache invalidation for dynamic content
- **Bundle optimization** - code splitting and tree shaking

### SEO & Analytics Ready
- **Meta tags** - dynamic SEO metadata for all pages
- **Open Graph** - social media preview optimization
- **Structured data** - JSON-LD schema for better search indexing
- **Prettier config** - customize code style in `prettier.config.mjs`

### Content Management
- **Rich text editor** - WYSIWYG editing for descriptions
- **Drag & drop** - reorder projects and experience entries
- **Image galleries** - multiple image support with carousels
- **Live preview** - see changes instantly while editing
- **PDF export** - generate professional resume PDFs with pdf-lib

## 🛠 Development Best Practices

### Code Quality Workflow
1. **Write code** with proper TypeScript types
2. **Format automatically** with Prettier on save (VS Code)
3. **Run lint** before committing: `npm run lint`
4. **Format entire project** when needed: `npm run format`
5. **Check build** before deploying: `npm run build`

### Pre-commit Checklist
```bash
npm run lint          # ✓ No ESLint errors
npm run format:check  # ✓ Code properly formatted
npm run build         # ✓ Production build succeeds
```rol
- **Tailwind config** - extend design system easily
- **Component variants** - multiple button and card styles
- **Animation library** - pre-built smooth transitions

### Content Management
- **Rich text editor** - WYSIWYG editing for descriptions
- **Drag & drop** - reorder projects and experience entries
- **Image galleries** - multiple image support with carousels
- **Live preview** - see changes instantly while editing

## 📄 License

MIT License - free for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

---

**Built with modern web technologies for the next generation of developer portfolios** ⚡
