# Assignment Management System

A comprehensive MERN stack application for managing student assignments and weekly reports with role-based access control for Admin and Faculty users.

## Features

### 🔐 Authentication & Authorization
- **Role-based access control** (Admin/Faculty)
- **JWT-based authentication** with secure sessions
- **Password reset functionality** via email
- **Protected routes** based on user roles

### 👨‍💼 Admin Features
- **Student Management**: View, edit, and delete student records
- **Faculty Management**: Manage faculty members and their assignments
- **Weekly Reports**: View and manage student weekly reports
- **Google Sheets Integration**: Export and sync data with Google Sheets
- **Dashboard**: Overview of system statistics and recent activities

### 👨‍🏫 Faculty Features
- **Add Students**: Register new students with validation
- **Create Groups**: Form student groups (exactly 2 students per group)
- **Groups Management**: View, edit, and delete student groups
- **Weekly Reports**: Add, edit, and view student progress reports
- **Google Form Integration**: Pre-configured form links for data collection

### 📊 Google Sheets Integration
- **API Integration**: Real-time data sync with Google Sheets
- **Embedded View**: Optional iframe embedding for read-only access
- **Configurable**: Easy setup with service account credentials

### 📱 Responsive Design
- **Mobile-friendly**: Works seamlessly on desktop and mobile devices
- **Material-UI**: Modern, accessible interface components
- **Responsive Navigation**: Collapsible sidebar for mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Nodemailer** for email functionality
- **Google Sheets API** for data integration
- **Express Validator** for input validation

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management
- **Axios** for API communication

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd assignment-management-system
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assignment-management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google Sheets API Configuration
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials/google-service-account.json
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_RANGE=Sheet1!A1:D10

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 5. Google Sheets Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account and download the JSON key file
5. Place the JSON file in the `credentials` folder
6. Share your Google Sheet with the service account email
7. Update the environment variables with your spreadsheet ID

### 6. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the necessary collections.

### 7. Start the Application

#### Development Mode (with hot reload)
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the server
npm start
```

## Usage

### 1. Access the Application
Open your browser and navigate to `http://localhost:3000`

### 2. Register/Login
- **First-time users**: Register with either Admin or Faculty role
- **Existing users**: Login with email and password
- **Password reset**: Use the "Forgot password?" link

### 3. Admin Dashboard
- **Students List**: View all students with search and filter options
- **Faculty Management**: Manage faculty members and their assignments
- **Weekly Reports**: View and manage student progress reports
- **Google Sheets**: Export data to Google Sheets

### 4. Faculty Dashboard
- **Add Students**: Register new students for your courses
- **Create Groups**: Form student groups (exactly 2 students)
- **Groups List**: Manage existing groups and access Google Forms
- **Student Reports**: Add and view weekly progress reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password

### Admin Routes
- `GET /api/admin/students` - Get all students
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student
- `GET /api/admin/faculty` - Get all faculty
- `PUT /api/admin/faculty/:id` - Update faculty
- `DELETE /api/admin/faculty/:id` - Delete faculty

### Faculty Routes
- `POST /api/faculty/students` - Add student
- `GET /api/faculty/students` - Get faculty's students
- `POST /api/faculty/groups` - Create group
- `GET /api/faculty/groups` - Get faculty's groups
- `PUT /api/faculty/groups/:id` - Update group
- `DELETE /api/faculty/groups/:id` - Delete group

### Reports Routes
- `GET /api/reports/student/:id` - Get student reports
- `POST /api/reports/student/:id` - Add report
- `PUT /api/reports/student/:id/week/:week` - Update report
- `DELETE /api/reports/student/:id/week/:week` - Delete report
- `GET /api/reports/google-sheets` - Get Google Sheets data

## Project Structure

```
assignment-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   └── faculty/    # Faculty pages
│   │   ├── services/       # API services
│   │   └── App.tsx
│   └── package.json
├── models/                 # MongoDB models
├── routes/                 # Express routes
├── middleware/             # Custom middleware
├── credentials/            # Google Sheets credentials
├── server.js              # Express server
└── package.json
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Role-based Access**: Strict permission system

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team.

## Future Enhancements

- [ ] Real-time notifications
- [ ] File upload for reports
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with learning management systems
- [ ] Automated email reminders
- [ ] Bulk operations for data management