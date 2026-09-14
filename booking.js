// ===== BOOKING SYSTEM =====

// Booking data storage
const bookingData = {
    service: '',
    serviceName: '',
    duration: '',
    price: '',
    location: '',
    locationName: '',
    address: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
};

// Calendar variables
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Simulated booked time slots (in real app, this would come from backend)
const bookedSlots = {
    '2026-04-30': ['10:00 AM', '2:00 PM'],
    '2026-05-01': ['11:00 AM', '3:00 PM'],
    '2026-05-02': ['9:00 AM', '1:00 PM']
};

// ===== STEP NAVIGATION =====
function nextStep(stepNumber) {
    // Validate current step before proceeding
    const currentStep = document.querySelector('.form-step.active');
    const currentStepNum = parseInt(currentStep.dataset.step);
    
    if (!validateStep(currentStepNum)) {
        return;
    }
    
    // Update progress bar
    updateProgressBar(stepNumber);
    
    // Show next step
    currentStep.classList.remove('active');
    document.querySelector(`[data-step="${stepNumber}"].form-step`).classList.add('active');
    
    // Update summary if moving to final step
    if (stepNumber === 6) {
        updateSummary();
    }
    
    // Scroll to top of booking section
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function prevStep(stepNumber) {
    updateProgressBar(stepNumber);
    
    const currentStep = document.querySelector('.form-step.active');
    currentStep.classList.remove('active');
    document.querySelector(`[data-step="${stepNumber}"].form-step`).classList.add('active');
    
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateProgressBar(stepNumber) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum < stepNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// ===== STEP VALIDATION =====
function validateStep(stepNumber) {
    switch(stepNumber) {
        case 1:
            // Validate service selection
            const selectedService = document.querySelector('input[name="service"]:checked');
            if (!selectedService) {
                alert('Please select a service');
                return false;
            }
            const [serviceName, duration, price] = selectedService.value.split('|');
            bookingData.service = selectedService.value;
            bookingData.serviceName = serviceName;
            bookingData.duration = duration;
            bookingData.price = price;
            return true;
            
        case 2:
            // Validate location selection
            const selectedLocation = document.querySelector('input[name="location"]:checked');
            if (!selectedLocation) {
                alert('Please select a location');
                return false;
            }
            const [locationName, address] = selectedLocation.value.split('|');
            bookingData.location = selectedLocation.value;
            bookingData.locationName = locationName;
            bookingData.address = address;
            return true;
            
        case 3:
            // Validate date selection
            const selectedDate = document.getElementById('selectedDate').value;
            if (!selectedDate) {
                alert('Please select a date');
                return false;
            }
            bookingData.date = selectedDate;
            
            // Generate time slots for selected date
            generateTimeSlots(selectedDate);
            
            // Update display
            document.getElementById('selectedDateDisplay').textContent = formatDate(selectedDate);
            return true;
            
        case 4:
            // Validate time selection
            const selectedTime = document.getElementById('selectedTime').value;
            if (!selectedTime) {
                alert('Please select a time slot');
                return false;
            }
            bookingData.time = selectedTime;
            return true;
            
        case 5:
            // Validate customer details
            const name = document.getElementById('customerName').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            
            if (!name) {
                alert('Please enter your name');
                document.getElementById('customerName').focus();
                return false;
            }
            
            if (!phone) {
                alert('Please enter your phone number');
                document.getElementById('customerPhone').focus();
                return false;
            }
            
            // Flexible phone validation - accepts various formats
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
            
            // Accept these formats:
            // 08012345678 (11 digits starting with 0)
            // 8012345678 (10 digits)
            // +2348012345678 (14 digits with +234)
            // 2348012345678 (13 digits with 234)
            // 070... 080... 081... 090... etc.
            
            const isValid = /^(\+?234|0)?[7-9][0-1]\d{8}$/.test(cleanPhone) || 
                           /^\d{10,11}$/.test(cleanPhone);
            
            if (!isValid) {
                alert('Please enter a valid phone number (e.g., 08012345678 or 07012345678)');
                document.getElementById('customerPhone').focus();
                return false;
            }
            
            bookingData.name = name;
            bookingData.phone = phone;
            bookingData.email = document.getElementById('customerEmail').value.trim();
            bookingData.notes = document.getElementById('customerNotes').value.trim();
            return true;
            
        default:
            return true;
    }
}

// ===== CALENDAR FUNCTIONS =====
function initCalendar() {
    renderCalendar();
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    const calendarDates = document.getElementById('calendarDates');
    calendarDates.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date other-month';
        dateDiv.textContent = daysInPrevMonth - i;
        calendarDates.appendChild(dateDiv);
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.textContent = day;
        
        const currentDate = new Date(currentYear, currentMonth, day);
        currentDate.setHours(0, 0, 0, 0);
        
        // Disable past dates
        if (currentDate < today) {
            dateDiv.classList.add('disabled');
        } else {
            // Mark today
            if (currentDate.getTime() === today.getTime()) {
                dateDiv.classList.add('today');
            }
            
            // Add click event
            dateDiv.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    // Remove previous selection
                    document.querySelectorAll('.calendar-date').forEach(d => {
                        d.classList.remove('selected');
                    });
                    
                    // Add selection
                    this.classList.add('selected');
                    
                    // Store date
                    const selectedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    document.getElementById('selectedDate').value = selectedDate;
                }
            });
        }
        
        calendarDates.appendChild(dateDiv);
    }
    
    // Next month's days to fill grid
    const totalCells = calendarDates.children.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let i = 1; i <= remainingCells; i++) {
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date other-month';
        dateDiv.textContent = i;
        calendarDates.appendChild(dateDiv);
    }
}

// ===== TIME SLOTS =====
function generateTimeSlots(selectedDate) {
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';
    
    // Generate time slots from 9 AM to 7 PM
    const slots = [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
        '5:00 PM', '6:00 PM', '7:00 PM'
    ];
    
    // Get booked slots for selected date
    const bookedForDate = bookedSlots[selectedDate] || [];
    
    slots.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot';
        slotDiv.textContent = slot;
        
        // Check if slot is already booked
        if (bookedForDate.includes(slot)) {
            slotDiv.classList.add('booked');
        } else {
            slotDiv.addEventListener('click', function() {
                if (!this.classList.contains('booked')) {
                    // Remove previous selection
                    document.querySelectorAll('.time-slot').forEach(s => {
                        s.classList.remove('selected');
                    });
                    
                    // Add selection
                    this.classList.add('selected');
                    
                    // Store time
                    document.getElementById('selectedTime').value = slot;
                }
            });
        }
        
        timeSlotsContainer.appendChild(slotDiv);
    });
}

// ===== UPDATE SUMMARY =====
function updateSummary() {
    document.getElementById('summaryService').textContent = 
        `${bookingData.serviceName} (${bookingData.duration} min)`;
    document.getElementById('summaryLocation').textContent = bookingData.locationName;
    document.getElementById('summaryDate').textContent = formatDate(bookingData.date);
    document.getElementById('summaryTime').textContent = bookingData.time;
    document.getElementById('summaryName').textContent = bookingData.name;
    document.getElementById('summaryPhone').textContent = bookingData.phone;
    document.getElementById('summaryPrice').textContent = `₦${parseInt(bookingData.price).toLocaleString()}`;
}

// ===== CONFIRM BOOKING =====
function confirmBooking() {
    // Generate booking reference
    const bookingRef = 'OC' + Date.now().toString().slice(-8);
    
    // Get logged-in customer info
    const customerId = localStorage.getItem('currentCustomerId');
    const customerName = localStorage.getItem('currentCustomerName');
    
    // Check if customer is logged in
    if (!customerId || !customerName) {
        alert('You must be logged in to book an appointment!\nRedirecting to login...');
        window.location.href = 'customer-login.html';
        return;
    }
    
    // Create booking object (now includes customer info)
    const newBooking = {
        reference: bookingRef,
        customerId: customerId,           // Link to customer
        customerName: customerName,       // Customer's name
        ...bookingData,
        bookedAt: new Date().toISOString(),
        status: 'Pending' // Status: Pending, Confirmed, Completed, Cancelled
    };
    
    // Get existing bookings from localStorage
    let allBookings = JSON.parse(localStorage.getItem('allBookings')) || [];
    
    // Add new booking to array
    allBookings.push(newBooking);
    
    // Save all bookings back to localStorage
    localStorage.setItem('allBookings', JSON.stringify(allBookings));
    localStorage.setItem('lastBooking', JSON.stringify(newBooking));
    
    // Update confirmation modal
    document.getElementById('bookingRef').textContent = bookingRef;
    document.getElementById('confirmService').textContent = bookingData.serviceName;
    document.getElementById('confirmDate').textContent = formatDate(bookingData.date);
    document.getElementById('confirmTime').textContent = bookingData.time;
    document.getElementById('confirmLocation').textContent = bookingData.locationName;
    document.getElementById('confirmAddress').textContent = bookingData.address;
    document.getElementById('confirmPrice').textContent = `₦${parseInt(bookingData.price).toLocaleString()}`;
    
    // Show confirmation modal with admin link
    const confirmationModal = document.getElementById('confirmationModal');
    confirmationModal.classList.add('active');
    
    // Add admin link to modal (if not already there)
    if (!document.getElementById('adminLink')) {
        const adminLink = document.createElement('p');
        adminLink.id = 'adminLink';
        adminLink.style.cssText = 'text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;';
        adminLink.innerHTML = '<a href="admin-login.html" style="color: #D4AF37; text-decoration: none; font-weight: 600;">→ Owner: View All Bookings in Admin Panel</a>';
        confirmationModal.querySelector('.modal-body').appendChild(adminLink);
    }
    
    // Reset form after a delay
    setTimeout(() => {
        resetBookingForm();
    }, 1000);
}

// ===== BOOKING SAVED TO DATABASE =====
// Bookings are now automatically saved to browser localStorage
// Admin can view all bookings at: admin-login.html
// Admin Dashboard URL: admin-dashboard.html
// Admin credentials: admin / admin123 (change in admin-dashboard.html for production)

// ===== CLOSE MODAL =====
function closeModal() {
    document.getElementById('confirmationModal').classList.remove('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== RESET FORM =====
function resetBookingForm() {
    // Reset all radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Reset form inputs
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerNotes').value = '';
    document.getElementById('selectedDate').value = '';
    document.getElementById('selectedTime').value = '';
    
    // Reset calendar
    document.querySelectorAll('.calendar-date').forEach(d => {
        d.classList.remove('selected');
    });
    
    // Reset to first step
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="1"].form-step').classList.add('active');
    
    updateProgressBar(1);
    
    // Clear booking data
    Object.keys(bookingData).forEach(key => {
        bookingData[key] = '';
    });
}

// ===== HELPER FUNCTIONS =====
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
    
    // Close modal when clicking outside
    document.getElementById('confirmationModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
});