# WisRight HRMS - Frontend

Modern, responsive React-based frontend for the WisRight HRMS POC application.

## 🚀 Tech Stack

- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Material-UI (MUI)** - Component library
- **React Router v6** - Routing
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **React Hook Form** - Form management

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/     # Common components (Header, Sidebar, etc.)
│   │   ├── admin/      # Admin-specific components
│   │   └── user/       # User-specific components
│   ├── pages/          # Page components
│   │   ├── auth/       # Authentication pages (Login)
│   │   ├── admin/      # Admin portal pages
│   │   └── user/       # User portal pages
│   ├── services/       # API services
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── layouts/        # Layout components
│   ├── theme/          # MUI theme configuration
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── .env.example        # Environment variables example
├── .env                # Environment variables (local)
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (included with Node.js)
- Backend server running on `http://localhost:3000`

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` if your backend runs on a different port:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:5173`

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## 🎨 Features Implemented

### Authentication
- ✅ Login page with JWT authentication
- ✅ Protected routes with role-based access control
- ✅ Auto-redirect based on user role (Admin vs User)
- ✅ Persistent authentication state

### Admin Portal
- ✅ Admin Dashboard
  - Total employees stat
  - Active employees stat
  - Pending approvals count
  - Leave requests overview
  - Department distribution chart
- ✅ Employee Management
  - Employee list with DataGrid
  - Search and filter
  - View employee details
  - Edit employee (navigation ready)

### User Portal
- ✅ User Dashboard
  - Leave balance overview
  - Pending approvals count
  - Upcoming leaves
  - Recent leave requests

### Common Components
- ✅ Responsive layout with header and sidebar
- ✅ Navigation menu
- ✅ Loading states
- ✅ Error handling
- ✅ Protected route wrapper

## 🔑 Demo Credentials

Use these credentials to log in:

### Admin
- **Email:** `admin@acme.com`
- **Password:** `Demo@123`

### Manager
- **Email:** `manager1@acme.com`
- **Password:** `Demo@123`

### Employee
- **Email:** `emp1@acme.com`
- **Password:** `Demo@123`

## 🚧 Features To Be Implemented

The following features are planned but not yet implemented:

### Admin Portal
- Master Data Management (Departments, Designations, Locations)
- Flow Definitions management
- Form Schema editor
- Policy configuration
- Leave Type management
- Leave Request approval interface

### User Portal
- Leave application form
- Leave history
- Approval workflow interface
- Personal profile management

### General
- Notifications
- Real-time updates
- File uploads
- Advanced search and filters
- Export functionality
- Mobile responsive optimizations

## 🌐 API Integration

The frontend communicates with the backend REST API at:
```
http://localhost:3000/api/v1
```

### Key API Services

Located in `src/services/`:

- **`api.ts`** - Base Axios configuration with interceptors
- **`dashboard.service.ts`** - Dashboard statistics
- **`employee.service.ts`** - Employee CRUD operations
- **`masterData.service.ts`** - Master data operations

All API calls include:
- Automatic JWT token attachment
- Error handling
- 401 auto-redirect to login

## 🎨 Styling & Theming

- **Material-UI Theme:** Located in `src/theme/index.ts`
- **Primary Color:** Blue (#1976d2)
- **Secondary Color:** Pink (#dc004e)
- **Design System:** 8px base unit for spacing

## 🔧 Development Tips

### Hot Module Replacement (HMR)
Vite provides instant hot reload. Changes to components will reflect immediately without page refresh.

### Type Safety
TypeScript types are defined in `src/types/index.ts`. Always use proper typing for:
- API responses
- Component props
- State management

### Component Development
1. Create reusable components in `src/components/common/`
2. Page-specific components go in `src/components/admin/` or `src/components/user/`
3. Full pages go in `src/pages/`

### Adding New Routes
1. Create page component in `src/pages/`
2. Add route to `src/App.tsx`
3. Add navigation link to `src/components/common/Sidebar.tsx`

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is occupied:
```bash
# Kill process using port 5173
lsof -i :5173
kill -9 <PID>

# Or run on different port
npm run dev -- --port 3001
```

### Backend Connection Failed
- Verify backend is running on `http://localhost:3000`
- Check `.env` file has correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## 📦 Production Build

To build for production:

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy

The `dist/` folder can be deployed to any static hosting service:
- **Vercel:** `vercel deploy`
- **Netlify:** Drag and drop `dist/` folder
- **AWS S3:** Upload `dist/` contents to S3 bucket
- **GitHub Pages:** Use `gh-pages` branch

## 🔒 Security Considerations

- JWT tokens stored in localStorage
- Automatic token refresh on API calls
- Protected routes prevent unauthorized access
- CSRF protection via JWT
- Input validation on all forms

## 📄 License

This is a POC (Proof of Concept) project.

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

**Built with ❤️ using React, TypeScript, and Material-UI**
