# Employee Leave Management System

A simple, fully functional web-based employee leave management system with separate dashboards for employees and managers. Built with Node.js, Express, and vanilla JavaScript with a hardcoded database for demo purposes.

## Features

### Employee Functionality
- View real-time leave balances (Vacation: 15, Sick: 10, Casual: 5 - Total: 30 days)
- Apply for leave with start/end dates, leave type, and reason
- View leave request history with status
- Automatic balance deduction on leave submission
- Automatic balance restoration on rejection

### Manager Functionality
- View all employees leave balances in a consolidated view
- Approve or reject pending leave requests
- View all leave requests across all employees
- Track leave request status changes

## Technology Stack

- Backend: Node.js (v14+), Express.js (v4.18.2), body-parser (v1.20.2)
- Frontend: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript (ES6)
- Data: In-memory hardcoded database

## Prerequisites

### For Local Deployment
- Node.js: version 14.0.0 or higher (Download from https://nodejs.org/)
- npm: version 6.0.0 or higher
- Git: optional, for cloning the repository

### For Docker Deployment
- Docker: version 20.10.0 or higher
- Docker Compose: optional, but recommended

## Project Structure

```
employee-leave-management-system-simple-v1/
|-- package.json              # Node.js project manifest
|-- app.js                     # Express server and backend API
|-- public/                   # Frontend static files
    |-- index.html             # Main HTML interface
    |-- app.js                 # Client-side JavaScript
|-- README.md                  # Project documentation
```

## Deployment Instructions

### Method 1: Local Deployment

This is the simplest method to get the application running on your local machine.

#### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/jayvk3/employee-leave-management-system-simple-v1.git

# Navigate to the project directory
cd employee-leave-management-system-simple-v1
```

Alternatively, download the ZIP file from GitHub and extract it.

#### Step 2: Install Dependencies

```bash
# Install all required Node.js packages
npm install
```

This will install express and body-parser packages.

Expected Output:
```
added 57 packages, and audited 58 packages in 2s
found 0 vulnerabilities
```

#### Step 3: Verify Project Files

Ensure the following files exist:

```bash
ls -l app.js          # Should exist
ls -l package.json   # Should exist
ls -l public/        # Should contain index.html and app.js
```

#### Step 4: Start the Application

```bash
# Start the server
npm start
```

Expected Output:
```
Employee Leave Management System running on http://localhost:3000

Default Login Credentials:
  Manager - Username: alice, Password: manager123
  Employee - Username: bob, Password: emp123
```

The application is now running! Important Notes:
- The server runs on port 3000 by default
- Do not close the terminal window
- To stop the server, press Ctrl + C or Cmd + C

#### Step 5: Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
# OR
http://127.0.0.1:3000

# From another device on the same network:
http://<YOUR_LOCAL_IP>:3000
# Example: http://192.168.1.10:3000

# To find your local IP:
# Windows: ipconfig
# macOS/Linux: ifconfig or ip addr
```

---

### Method 2: Docker Deployment

For a more isolated and portable deployment.

#### Step 1: Clone the Repository

```bash
git clone https://github.com/jayvk3/employee-leave-management-system-simple-v1.git
cd employee-leave-management-system-simple-v1
```

#### Step 2: Create Dockerfile

Create a file named Dockerfile in the project root:

```dockerfile
# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY pGckage*.json ./

# Install dependencies
RUN npm install --production

# Copy all source files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
```

#### Step 3: Build Docker Image

```bash
# Build the Docker image
docker build -t employee-leave-app .
```

#### Step 4: Run Docker Container

```bash
# Run the container
docker run -d -p 3000:3000 --name leave-management employee-leave-app
```

Command Explanation:
- -d: Run in detached mode (background)
- -p 3000:3000: Map port 3000 on host to port 3000 in container
- --name leave-management: Assign a name to the container

#### Step 5: Verify Deployment

```bash
# Check container status
docker ps

# View container logs
docker logs leave-management
```

#### Step 6: Access the Application

Open your browser and go to: http://localhost:3000

#### Managing the Container

```bash
# Stop the container
docker stop leave-management

# Start the container again
docker start leave-management

# Restart the container
docker restart leave-management

# Remove the container (stop first)
docker stop leave-management
docker rm leave-management
```

---

## Usage Guide

### Employee Workflow

1. Login: Use credentials from Default Credentials
2. View Balances: See remaining leave days for each type
3. Apply Leave:
   - Select leave type (Vacation/Sick/Casual)
   - Choose start and end dates
   - Enter reason
   - Click Submit Leave
4. View History: See all submitted leave requests with statuses

Notes:
- Balances are deducted immediately upon submission
- If manager rejects, balance is restored automatically
- Leave cannot be cancelled after submission

### Manager Workflow

1. Login: Use manager credentials (alice / manager123)
2. View Employee Balances: See all employees remaining leave days
3. Manage Leave Requests:
   - View pending leave requests
   - Click Approve to accept request
   - Click Reject to decline
4. View All Leaves: See all leave requests from all employees

Notes:
- Only pending requests can be approved/rejected
- Manager cannot modify or revert approved/rejected requests

---

## API Endpoints

### Authentication
- POST /api/login - Login with credentials
- POST /api/logout - Logout current user
- GET /api/user - Get current user info

### Leave Management
- GET /api/leaves - Get leaves (filtered by role)
- POST /api/leaves - Apply for new leave (employee only)
- PATCH /api/leaves/:id - Approve/reject leave (manager only)

### Employee Management
- GET /api/employees - Get all employees and their balances (manager only)

### Utility
- GET /api/health - Check API health status

---

## Troubleshooting

### Issue: Port 3000 already in use

Solution 1: Find and kill the process

```bash
# Windows:
netstat -ano | findstr ":3000"
taskkill /PID <pid_number> /F

# macOS/Linux:
lsof -i :3000
kill -9 <pid>
```

Solution 2: Change the port

```bash
# Set custom port
export PORT=8080  # macOS/Linux
set PORT=8080    # Windows

# Then run
npm start
```

### Issue: npm install fails

Solution 1: Clear npm cache

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

Solution 2: Use Yarn instead

```bash
npm install -g yarn
yarn install
yarn start
```

---

## Default Credentials

### Manager Account

- Username: alice
- Password: manager123
- Name: Alice Johnson
- Role: Manager

### Employee Accounts

1. Username: bob, Password: emp123, Name: Bob Smith (Leave Balance: 30 days)
2. Username: carol, Password: emp123, Name: Carol Davis (Leave Balance: 30 days)
3. Username: david, Password: emp123, Name: David Miller (Leave Balance: 30 days)
4. Username: eva, Password: emp123, Name: Eva Wilson (Leave Balance: 30 days)

All employees have:
- Vacation: 15 days
- Sick: 10 days
- Casual: 5 days
- Total: 30 days

---

## Limitations

1. No Database: Data is stored in memory (lost on server restart)
2. Simple Authentication: No password hashing, no session expiration
3. No Email Notifications: No automated alerts to employees/managers
4. Date Validation: Does not validate weekends or holidays
5. No Multi-Language Support: Only English UI
6. No File Uploads: Cannot attach medical certificates or documents

## Future Enhancements

- Integrate persistent database (MongoDB/PostgreSQL)
- Add JWT authentication with token expiration
- Implement password hashing (bcrypt)
- Add email notifications (Nodemailer/SendGrid)
- Implement calendar view with holidays/weekends
- Add export to Excel/PDF for leave reports
- Multi-level approval workflow
- Leave request comments/notes feature
- Search and filter leave requests
- Responsive mobile app (React Native)
- Unit and integration tests (Jest/Mocha)

---

## Project Information

- Project Name: Employee Leave Management System - Simple v1
- Version: 1.0.0
- Repository: https://github.com/jayvk3/employee-leave-management-system-simple-v1
- License: MIT
- Developed For: CapStone Project
- Last Updated: February 2026

---

## Security Disclaimer

IMPORTANT: This application is a demonstration only and should NOT be used in production without significant security enhancements:

- Passwords are stored in plain text
- No HTTPS/SSL encryption
- No rate limiting or DdoS protection
- No input sanitization/XSS protection
- No CSRF tokens
- Simple token-based auth without expiration

---

## Support

For questions or issues:

1. Check the Troubleshooting section
2. Open an issue on GitHub: https://github.com/jayvk3/employee-leave-management-system-simple-v1/issues
3. Reach out to the project maintainer

---

## License

MIT License - Feel free to use this code for learning and demonstration purposes.

Happy Leave Management!