# Authentication & Admin Setup

## Overview

The admin dashboard is now protected with authentication. Only users with `admin: true` in the database can access the admin panel.

## User Model

Users are stored in MongoDB with the following schema:
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `name` - Optional name
- `admin` - Boolean flag (true for admin users)

## Creating Admin Users

### Method 1: Using the Script (Recommended)

```bash
npm run create-admin
```

This will create a default admin user:
- Email: `admin@ycsyh.com`
- Password: `admin123`

### Method 2: Custom Email/Password

```bash
node scripts/create-admin.js your-email@example.com yourpassword "Your Name"
```

### Method 3: Direct MongoDB

You can also create users directly in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  email: "admin@ycsyh.com",
  password: "$2a$12$...", // Use bcrypt to hash password
  name: "Admin User",
  admin: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Authentication Flow

1. User visits `/login` page
2. Enters email and password
3. Server validates credentials
4. JWT token is created and stored in HTTP-only cookie
5. User is redirected to `/admin`
6. Admin page checks authentication on load
7. All admin API routes verify the JWT token and admin status

## Protected Routes

- `/admin` - Admin dashboard (requires admin authentication)
- `/api/beats` (POST, PUT, DELETE) - Beat management (requires admin)
- `/api/upload` - File uploads (requires admin)

## Logout

Users can logout from the admin dashboard, which clears the auth cookie and redirects to login.

## Security Notes

- Passwords are hashed using bcrypt (12 rounds)
- JWT tokens expire after 7 days
- Tokens are stored in HTTP-only cookies (not accessible via JavaScript)
- Admin status is verified on every request
- All admin routes check both authentication and admin status

## Environment Variables

Make sure to set `JWT_SECRET` in your `.env.local` file:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Generate a strong random string for production use.

