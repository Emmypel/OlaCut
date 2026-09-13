// ===== ADMIN DASHBOARD =====

// Check if admin is logged in
function checkAdminAccess() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check login
    if (!checkAdminAccess()) return;

    // Set admin username
    const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
    document.getElementById('adminUsername').textContent = adminUsername;

    // Load and display bookings
    loadBookings();

    // Setup search
    document.getElementById('searchInput').addEventListener('keyup', filterBookings);

    // Setup filter
    document.getElementById('filterStatus').addEventListener('change', filterBookings);

    // Close modals on background click
    document.getElementById('detailModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    document.getElementById('confirmModal').addEventListener('click', function(e) {
        if (e.target === this) closeConfirmModal();
    });
});

// Load all bookings
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    displayBookings(bookings);
    updateStatistics(bookings);
}

// Display bookings in table
function displayBookings(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('bookingsTable');

    tbody.innerHTML = '';

    if (bookings.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    // Sort by date (newest first)
    bookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

    bookings.forEach((booking, index) => {
        const row = document.createElement('tr');
        const date = new Date(booking.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });

        row.innerHTML = `
            <td><strong>${booking.reference}</strong></td>
            <td>${booking.name}</td>
            <td>${booking.phone}</td>
            <td>${booking.serviceName}</td>
            <td>${formattedDate}</td>
            <td>${booking.time}</td>
            <td>${booking.locationName}</td>
            <td>₦${parseInt(booking.price).toLocaleString()}</td>
            <td>
                <span class="status-badge status-${booking.status.toLowerCase()}">
                    ${booking.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-view" onclick="viewDetails('${booking.reference}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-small btn-complete" onclick="changeStatus('${booking.reference}', 'Confirmed')" 
                            ${booking.status !== 'Pending' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Confirm
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteBooking('${booking.reference}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter bookings based on search and status
function filterBookings() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];

    const filtered = allBookings.filter(booking => {
        const matchesSearch = booking.name.toLowerCase().includes(searchTerm) || 
                             booking.phone.includes(searchTerm);
        const matchesStatus = statusFilter === '' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    displayBookings(filtered);
}

// View booking details
function viewDetails(reference) {
    const bookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    const booking = bookings.find(b => b.reference === reference);

    if (!booking) return;

    const date = new Date(booking.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const html = `
        <div class="detail-row">
            <strong>Booking Reference:</strong>
            <span>${booking.reference}</span>
        </div>
        <div class="detail-row">
            <strong>Customer Name:</strong>
            <span>${booking.name}</span>
        </div>
        <div class="detail-row">
            <strong>Phone Number:</strong>
            <span>${booking.phone}</span>
        </div>
        <div class="detail-row">
            <strong>Email:</strong>
            <span>${booking.email || 'Not provided'}</span>
        </div>
        <div class="detail-row">
            <strong>Service:</strong>
            <span>${booking.serviceName}</span>
        </div>
        <div class="detail-row">
            <strong>Duration:</strong>
            <span>${booking.duration} minutes</span>
        </div>
        <div class="detail-row">
            <strong>Price:</strong>
            <span>₦${parseInt(booking.price).toLocaleString()}</span>
        </div>
        <div class="detail-row">
            <strong>Date:</strong>
            <span>${formattedDate}</span>
        </div>
        <div class="detail-row">
            <strong>Time:</strong>
            <span>${booking.time}</span>
        </div>
        <div class="detail-row">
            <strong>Location:</strong>
            <span>${booking.locationName}</span>
        </div>
        <div class="detail-row">
            <strong>Address:</strong>
            <span>${booking.address}</span>
        </div>
        ${booking.notes ? `
        <div class="detail-row">
            <strong>Special Requests:</strong>
            <span>${booking.notes}</span>
        </div>
        ` : ''}
        <div class="detail-row">
            <strong>Status:</strong>
            <span class="status-badge status-${booking.status.toLowerCase()}">
                ${booking.status}
            </span>
        </div>
        <div class="detail-row">
            <strong>Booked On:</strong>
            <span>${new Date(booking.bookedAt).toLocaleString()}</span>
        </div>
    `;

    document.getElementById('modalDetails').innerHTML = html;
    document.getElementById('detailModal').classList.add('active');
}

// Change booking status
function changeStatus(reference, newStatus) {
    openConfirmModal(
        `Are you sure you want to mark this booking as ${newStatus}?`,
        () => {
            const bookings = JSON.parse(localStorage.getItem('allBookings')) || [];
            const index = bookings.findIndex(b => b.reference === reference);
            
            if (index !== -1) {
                bookings[index].status = newStatus;
                localStorage.setItem('allBookings', JSON.stringify(bookings));
                loadBookings();
                closeModal();
                closeConfirmModal();
                showSuccess(`Booking marked as ${newStatus}`);
            }
        }
    );
}

// Delete booking
function deleteBooking(reference) {
    openConfirmModal(
        'Are you sure you want to delete this booking? This action cannot be undone.',
        () => {
            const bookings = JSON.parse(localStorage.getItem('allBookings')) || [];
            const filtered = bookings.filter(b => b.reference !== reference);
            localStorage.setItem('allBookings', JSON.stringify(filtered));
            loadBookings();
            closeConfirmModal();
            showSuccess('Booking deleted successfully');
        }
    );
}

// Update statistics
function updateStatistics(bookings) {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const completed = bookings.filter(b => b.status === 'Completed').length;
    const revenue = bookings.reduce((sum, b) => sum + parseInt(b.price), 0);

    document.getElementById('totalBookings').textContent = total;
    document.getElementById('pendingBookings').textContent = pending;
    document.getElementById('completedBookings').textContent = completed;
    document.getElementById('totalRevenue').textContent = `₦${revenue.toLocaleString()}`;
}

// Export to CSV
function exportBookingsToCSV() {
    const bookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    
    if (bookings.length === 0) {
        alert('No bookings to export');
        return;
    }

    let csv = 'Reference,Name,Phone,Email,Service,Date,Time,Location,Price,Status,Notes,Booked On\n';
    
    bookings.forEach(booking => {
        const date = new Date(booking.date).toLocaleDateString();
        const bookedDate = new Date(booking.bookedAt).toLocaleString();
        const notes = (booking.notes || '').replace(/,/g, ';'); // Replace commas in notes
        
        csv += `"${booking.reference}","${booking.name}","${booking.phone}","${booking.email || ''}","${booking.serviceName}","${date}","${booking.time}","${booking.locationName}",${booking.price},"${booking.status}","${notes}","${bookedDate}"\n`;
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `olas-cutz-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Modal functions
let pendingAction = null;

function openConfirmModal(message, action) {
    document.getElementById('confirmMessage').textContent = message;
    pendingAction = action;
    document.getElementById('confirmModal').classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    pendingAction = null;
}

function executeAction() {
    if (pendingAction) {
        pendingAction();
    }
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Show success message (optional: implement toast notification)
function showSuccess(message) {
    alert(message); // Replace with better notification system
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('loginTime');
        window.location.href = 'admin-login.html';
    }
}