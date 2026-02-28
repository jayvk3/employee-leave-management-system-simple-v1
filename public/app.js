// app.js - Frontend JavaScript for Employee Leave Management System

const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let authToken = null;

// ---------------------------------------------------------------------
// API Helpers
// ---------------------------------------------------------------------

async function apiCall(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (authToken) {
        headers['Authorization'] = authToken;
    }

    const options = {
        method,
        headers
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API error');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ---------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await apiCall('login', 'POST', { username, password });
        authToken = response.token;
        currentUser = response.user;

        document.getElementById('login-page').style.display = 'none';
        document.getElementById('dashboard-page').style.display = 'block';
        document.getElementById('user-name').textContent = currentUser.name;

        if (currentUser.role === 'manager') {
            loadManagerDashboard();
        } else {
            loadEmployeeDashboard();
        }
    } catch (error) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
});

function logout() {
    authToken = null;
    currentUser = null;
    document.getElementById('dashboard-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('login-form').reset();
}

// ---------------------------------------------------------------------
// Employee Dashboard
// ---------------------------------------------------------------------

async function loadEmployeeDashboard() {
    document.getElementById('employee-dashboard').style.display = 'block';
    document.getElementById('manager-dashboard').style.display = 'none';

    // Update balances
    document.getElementById('vacation-balance').textContent = currentUser.balances.vacation;
    document.getElementById('sick-balance').textContent = currentUser.balances.sick;
    document.getElementById('casual-balance').textContent = currentUser.balances.casual;

    // Load leaves
    await loadEmployeeLeaves();
}

document.getElementById('leave-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const leaveData = {
        type: document.getElementById('leave-type').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        reason: document.getElementById('leave-reason').value
    };

    try {
        const response = await apiCall('leaves', 'POST', leaveData);
        alert(response.message);
        document.getElementById('leave-form').reset();

        // Update balances
        currentUser.balances = response.remainingBalance;
        document.getElementById('vacation-balance').textContent = currentUser.balances.vacation;
        document.getElementById('sick-balance').textContent = currentUser.balances.sick;
        document.getElementById('casual-balance').textContent = currentUser.balances.casual;

        // Reload leaves
        await loadEmployeeLeaves();
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

async function loadEmployeeLeaves() {
    try {
        const leaves = await apiCall('leaves');
        const tableBody = document.getElementById('employee-leaves-table');

        if (leaves.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No leave requests found</td></tr>';
            return;
        }

        tableBody.innerHTML = leaves.map(leave => `
            <tr>
                <td>${leave.type}</td>
                <td>${new Date(leave.startDate).toLocaleDateString()}</td>
                <td>${new Date(leave.endDate).toLocaleDateString()}</td>
                <td>${leave.days}</td>
                <td>${leave.reason}</td>
                <td><span class="badge badge-${leave.status} status-badge">${leave.status}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading leaves:', error);
    }
}

// ---------------------------------------------------------------------
// Manager Dashboard
// ---------------------------------------------------------------------

async function loadManagerDashboard() {
    document.getElementById('manager-dashboard').style.display = 'block';
    document.getElementById('employee-dashboard').style.display = 'none';

    await loadEmployeeBalances();
    await loadPendingLeaves();
}

async function loadEmployeeBalances() {
    try {
        const employees = await apiCall('employees');
        const tableBody = document.getElementById('employees-table');

        tableBody.innerHTML = employees.map(emp => {
            const total = emp.balances.vacation + emp.balances.sick + emp.balances.casual;
            return `
                <tr>
                    <td>${emp.name}</td>
                    <td>${emp.balances.vacation}</td>
                    <td>${emp.balances.sick}</td>
                    <td>${emp.balances.casual}</td>
                    <td><strong>${total}</strong></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

async function loadPendingLeaves() {
    try {
        const leaves = await apiCall('leaves');
        const tableBody = document.getElementById('manager-leaves-table');

        if (leaves.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No leave requests found</td></tr>';
            return;
        }

        tableBody.innerHTML = leaves.map(leave => `
            <tr>
                <td>${leave.employeeName}</td>
                <td>${leave.type}</td>
                <td>${new Date(leave.startDate).toLocaleDateString()}</td>
                <td>${new Date(leave.endDate).toLocaleDateString()}</td>
                <td>${leave.days}</td>
                <td>${leave.reason}</td>
                <td><span class="badge badge-${leave.status} status-badge">${leave.status}</span></td>
                <td>
                    ${leave.status === 'pending' ? `
                        <button class="btn btn-success btn-sm me-1" onclick="approveLeave(${leave.id})">Approve</button>
                        <button class="btn btn-danger btn-sm" onclick="rejectLeave(${leave.id})">Reject</button>
                    ` : '-'}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading leaves:', error);
    }
}

async function approveLeave(leaveId) {
    if (!confirm('Are you sure you want to approve this leave?')) return;

    try {
        await apiCall(`leaves/${leaveId}`, 'PATCH', { status: 'approved' });
        alert('Leave approved successfully');
        await loadPendingLeaves();
        await loadEmployeeBalances();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function rejectLeave(leaveId) {
    if (!confirm('Are you sure you want to reject this leave?')) return;

    try {
        await apiCall(`leaves/${leaveId}`, 'PATCH', { status: 'rejected' });
        alert('Leave rejected successfully');
        await loadPendingLeaves();
        await loadEmployeeBalances();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}