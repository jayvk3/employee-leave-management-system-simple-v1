// app.js - Node.js Express backend for Employee Leave Management System
// Simple hardcoded database with employee/manager roles

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ---------------------------------------------------------------------
// HARDCODED DATABASE
// ---------------------------------------------------------------------

// Users (1 Manager + 4 Employees)
let users = [
    { 
        id: 1, 
        username: 'alice', 
        password: 'manager123', 
        name: 'Alice Johnson', 
        role: 'manager', 
        balances: { vacation: 15, sick: 10, casual: 5 } 
    },
    { 
        id: 2, 
        username: 'bob', 
        password: 'emp123', 
        name: 'Bob Smith', 
        role: 'employee', 
        balances: { vacation: 15, sick: 10, casual: 5 } 
    },
    { 
        id: 3, 
        username: 'carol', 
        password: 'emp123', 
        name: 'Carol Davis', 
        role: 'employee', 
        balances: { vacation: 15, sick: 10, casual: 5 } 
    },
    { 
        id: 4, 
        username: 'david', 
        password: 'emp123', 
        name: 'David Miller', 
        role: 'employee', 
        balances: { vacation: 15, sick: 10, casual: 5 } 
    },
    { 
        id: 5, 
        username: 'eva', 
        password: 'emp123', 
        name: 'Eva Wilson', 
        role: 'employee', 
        balances: { vacation: 15, sick: 10, casual: 5 } 
    }
];

// Leave requests (initially empty)
let leaves = [];
let leaveIdCounter = 1;

// Leave types and limits
const LEAVE_TYPES = {
    vacation: { limit: 15, label: 'Vacation' },
    sick: { limit: 10, label: 'Sick' },
    casual: { limit: 5, label: 'Casual' }
};

// Sessions (simple token-based)
let sessions = {};

// ---------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------

function generateToken() {
    return 'TOKEN-' + Math.random().toString(36).substr(2, 9);
}

function authenticate(req, res, next) {
    const token = req.headers['authorization'];
    if (!token || !sessions[token]) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = sessions[token];
    next();
}

function authorizeManager(req, res, next) {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Forbidden: Manager only' });
    }
    next();
}

// ---------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken();
    sessions[token] = user;
    
    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
            balances: user.balances
        }
    });
});

// Logout
app.post('/api/logout', authenticate, (req, res) => {
    const token = req.headers['authorization'];
    delete sessions[token];
    res.json({ message: 'Logged out successfully' });
});

// Get current user info
app.get('/api/user', authenticate, (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        balances: req.user.balances
    });
});

// Get all leaves (employee sees only theirs, manager sees all)
app.get('/api/leaves', authenticate, (req, res) => {
    let filteredLeaves;
    
    if (req.user.role === 'manager') {
        filteredLeaves = leaves; // Manager sees all leaves
    } else {
        filteredLeaves = leaves.filter(l => l.employeeId === req.user.id);
    }
    
    // Enrich with employee names
    const enrichedLeaves = filteredLeaves.map(leave => {
        const employee = users.find(u => u.id === leave.employeeId);
        return {
            ...leave,
            employeeName: employee ? employee.name : 'Unknown'
        };
    });
    
    res.json(enrichedLeaves);
});

// Apply for leave (employee only)
app.post('/api/leaves', authenticate, (req, res) => {
    const { type, startDate, endDate, reason } = req.body;
    
    // Validation
    if (!type || !startDate || !endDate || !reason) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!LEAVE_TYPES[type]) {
        return res.status(400).json({ error: 'Invalid leave type' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
        return res.status(400).json({ error: 'Start date must be before end date' });
    }
    
    // Calculate days
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check balance
    if (req.user.balances[type] < days) {
        return res.status(400).json({ 
            error: `Insufficient leave balance. Available: ${req.user.balances[type]}, Requested: ${days}` 
        });
    }
    
    // Create leave request
    const leave = {
        id: leaveIdCounter++,
        employeeId: req.user.id,
        type,
        startDate,
        endDate,
        days,
        reason,
        status: 'pending',
        appliedAt: new Date().toISOString()
    };
    
    leaves.push(leave);
    
    // Deduct from balance
    req.user.balances[type] -= days;
    
    res.status(201).json({
        message: 'Leave applied successfully',
        leave,
        remainingBalance: req.user.balances
    });
});

// Update leave status (manager only)
app.patch('/api/leaves/:id', authenticate, authorizeManager, (req, res) => {
    const leaveId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    const leave = leaves.find(l => l.id === leaveId);
    
    if (!leave) {
        return res.status(404).json({ error: 'Leave not found' });
    }
    
    if (leave.status !== 'pending') {
        return res.status(400).json({ error: 'Leave already processed' });
    }
    
    // If rejected, restore balance
    if (status === 'rejected') {
        const employee = users.find(u => u.id === leave.employeeId);
        if (employee) {
            employee.balances[leave.type] += leave.days;
        }
    }
    
    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date().toISOString();
    
    res.json({
        message: `Leave ${status} successfully`,
        leave
    });
});

// Get all employees (manager only)
app.get('/api/employees', authenticate, authorizeManager, (req, res) => {
    const employees = users.filter(u => u.role === 'employee').map(u => ({
        id: u.id,
        name: u.name,
        balances: u.balances
    }));
    
    res.json(employees);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        usersCount: users.length,
        leavesCount: leaves.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Employee Leave Management System running on http://localhost:${PORT}`);
    console.log('\n✅ Default Login Credentials:');
    console.log('  Manager - Username: alice, Password: manager123');
    console.log('  Employee - Username: bob, Password: emp123');
    console.log('');
});