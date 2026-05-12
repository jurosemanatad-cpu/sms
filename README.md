# School Management System

A simple, modern school management system built with React, Node.js, Express, and Prisma.

## Features

- **Student Management**: Add, edit, delete, and search students
- **Class Management**: Create and manage classes with student assignments
- **Authentication**: Secure admin/teacher login system
- **Real-time Search**: Filter students and classes instantly
- **Responsive Design**: Works on desktop and mobile devices
- **Data Validation**: Input validation and error handling

## How Teachers/Admins Use This App

### 1. Getting Started

1. **Login to the System**
   - Open the application in your browser
   - Use the default admin credentials:
     - Email: `admin@school.com`
     - Password: `admin123`
   - Click "Login" to access the dashboard

2. **Navigation**
   - Use the navigation bar at the top to switch between:
     - **Students**: Manage student records
     - **Classes**: Manage class information
   - Your current user info and logout button are on the right

### 2. Managing Students

#### Adding a New Student
1. Click on "Students" in the navigation
2. Fill in the student information:
   - **Name**: Full name of the student (required)
   - **Email**: Student's email address (must be valid format, unique)
   - **Grade Level**: Grade from 1-12 (required)
3. Click "Save" to add the student

#### Editing Student Information
1. Find the student in the list or use the search box
2. Click the "Edit" button next to the student's name
3. Update the desired fields
4. Click "Update" to save changes

#### Deleting a Student
1. Find the student in the list
2. Click the "Delete" button
3. Confirm the deletion in the popup dialog

#### Searching Students
- Use the search box above the student list
- Search by name, email, or grade level
- Results update automatically as you type

### 3. Managing Classes

#### Creating a New Class
1. Click on "Classes" in the navigation
2. Fill in the class information:
   - **Class Name**: e.g., "Math 101", "English 9A" (required)
   - **Grade Level**: Grade level for this class (1-12)
   - **Academic Year**: e.g., "2024-2025" (required)
3. Click "Save" to create the class

#### Viewing Class Information
- Each class shows:
  - Class name and grade level
  - Academic year
  - Number of enrolled students
  - List of all enrolled students

#### Editing Class Details
1. Find the class in the list
2. Click the "Edit" button
3. Update the desired fields
4. Click "Update" to save changes

#### Deleting a Class
1. Find the class in the list
2. Click the "Delete" button
3. Confirm deletion (this will remove all students from the class)

### 4. Important Features

#### Data Validation
- **Email Validation**: Ensures proper email format
- **Grade Level**: Restricted to grades 1-12
- **Required Fields**: All required fields must be filled
- **Duplicate Prevention**: Email addresses must be unique

#### Error Handling
- Clear error messages for invalid inputs
- Confirmation dialogs for destructive actions
- Loading states during operations

#### Audit Trail
- All records include creation and update timestamps
- Track when students and classes were last modified

## Technical Setup

### Prerequisites
- Node.js 20.x
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # In api/.env
   DATABASE_URL="postgresql://username:password@localhost:5432/school_db"
   JWT_SECRET="your-secret-key-here"
   CORS_ORIGINS="http://localhost:5173"
   ```

4. **Set up the database**
   ```bash
   cd api
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Create default admin user**
   ```bash
   # Use the registration endpoint or add directly to database
   ```

6. **Run the application**
   ```bash
   # Start API (in api directory)
   npm run dev
   
   # Start Web App (in web directory)
   npm run dev
   ```

### Deployment

The application is configured for deployment on Render.com with:
- Automatic database migrations
- Environment-based configuration
- Node.js version pinning
- CORS configuration for production

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Protected Routes**: All create/update/delete operations require authentication
- **CORS Protection**: Configured for allowed origins
- **Input Validation**: Server-side validation for all inputs

## Support

For technical issues or questions:
1. Check the browser console for error messages
2. Verify database connection
3. Ensure all environment variables are set correctly
4. Confirm Node.js version compatibility

---

**Note**: This is a simplified school management system designed for demonstration purposes. For production use, consider adding additional features like attendance tracking, grade management, and more detailed user roles.
