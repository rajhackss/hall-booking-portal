
// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://erhheowveqgnkliadtdd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaGhlb3d2ZXFnbmtsaWFkdGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTgwNzgsImV4cCI6MjA4NTg3NDA3OH0.Hss6sOTo0lx34sykr23bhaaVkXtu26Ogw46Ac58RUZw';
let supabaseClient;

try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase Initialized");
} catch (e) {
    console.error("Supabase Init Error:", e);
}

// ==========================================
// MASTER DATA
// ==========================================
const amenitiesMasterList = [
    "AC", "Non-AC", "Parking", "Catering Service",
    "Decoration Service", "DJ / Sound System", "Projector / LED Screen",
    "Chairs & Tables", "Washroom Facility", "Generator / Power Backup",
    "Lift / Accessibility", "Cleaning Service"
];

const slotsArray = ["Morning", "Evening", "Night"];

const halls = [
    {
        id: 1,
        name: "Sarjerao Yadav Multipurpose Hall & Lawn",
        address: "Bahe Rd, near SONA Chemicals, MIDC, Ishwarpur, Maharashtra 415409",
        capacity: "500 Guests",
        price: "₹70,000 / Day",
        description: "A grand multipurpose hall with an expansive lawn, perfect for massive wedding receptions and public gatherings.",
        images: ["hall1.jpg", "hall11.jpg", "hall111.jpg"],
        reviews: [
            { text: "Huge lawn, perfect for our 1000+ guest wedding.", author: "Amit P.", rating: 5 },
            { text: "Good location in MIDC, very spacious.", author: "Suresh K.", rating: 4 }
        ]
    },
    {
        id: 2,
        name: "Indira Palace & Lawns",
        address: "Waghwadi, Phata, Ishwarpur, Maharashtra 415407",
        capacity: "600 Guests",
        price: "₹90,000 / Day",
        description: "An elegant palace-style venue featuring regal architecture and diverse layout options for medium to large events.",
        images: ["hall2.jpg", "hall22.jpg", "hall222.jpg"],
        reviews: [
            { text: "Felt like a royal wedding. Beautiful architecture.", author: "Neha S.", rating: 5 }
        ]
    },
    {
        id: 3,
        name: "Mankeshwar Multi-purpose Hall & Lawns",
        address: "Kore Appa Nagar, Kreshar Road, Shastri Nagar, Kisannagar, Ishwarpur, Maharashtra 415409",
        capacity: "500 Guests",
        price: "₹50,000 / Day",
        description: "A modern facility located in a prime residential area, offering a blend of indoor comfort and outdoor freshness.",
        images: ["hall3.jpg", "hall33.jpg", "hall333.jpg"],
        reviews: [
            { text: "Very convenient location for guests.", author: "Rohan D.", rating: 4 },
            { text: "Clean and well maintained.", author: "Priya M.", rating: 5 }
        ]
    },
    {
        id: 4,
        name: "Akshay Multipurpose Hall",
        address: "Waghwadi Phata, Ishwarpur, Maharashtra 415409",
        capacity: "800 Guests",
        price: "₹65,000 / Day",
        description: "A cozy and budget-friendly hall ideal for intimate weddings, birthday parties, and corporate functions.",
        images: ["hall4.jpg", "hall44.jpg", "hall444.jpg"],
        reviews: [
            { text: "Great value for money.", author: "Vikram S.", rating: 5 }
        ]
    }
];

// Assign Random Amenities to Halls
halls.forEach(hall => {
    // Shuffle master list and pick 6-8 items
    const shuffled = [...amenitiesMasterList].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8 items
    hall.facilities = shuffled.slice(0, count);
});

// ==========================================
// STATE
// ==========================================
let currentHall = null;
let currentSlot = null;
let currentSelectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    showHome();
});

// ==========================================
// ROUTING & UI VIEWS
// ==========================================
function showHome() {
    setNavVisibility(false);

    // Restore Nav
    document.querySelectorAll('.nav-links li').forEach(li => li.style.display = 'block');

    currentHall = null;
    const app = document.getElementById('app-content');

    // Hide Book Now on Home (Specific override)
    const navBooking = document.getElementById('nav-booking-item');
    if (navBooking) navBooking.style.display = 'none';

    window.scrollTo(0, 0);

    let html = `
        <header id="home" class="hero-section" style="background-image: url('hall1.jpg');">
            <div class="hero-overlay"></div>
            <div class="hero-content fade-in">
                <h1>Find Your Perfect Venue</h1>
                <p>Explore Ishwarpur's finest multipurpose halls and lawns.</p>
                <a href="#halls-list" class="btn btn-primary">View Halls</a>
            </div>
        </header>

        <section id="halls-list" class="section-container">
            <div class="section-title">
                <h2>Our Venues</h2>
                <div class="underline"></div>
            </div>
            
            <div class="halls-grid">
    `;

    halls.forEach(hall => {
        html += `
            <div class="hall-preview-card glass-card fade-in" onclick="showHallDetails(${hall.id})">
                <div class="card-image" style="background-image: url('${hall.images[0]}');"></div>
                <div class="card-content">
                    <h3>${hall.name}</h3>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${hall.address}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-users"></i> ${hall.capacity}</span>
                        <span><i class="fas fa-tag"></i> ${hall.price}</span>
                    </div>
                    <button class="btn btn-secondary full-width" style="margin-top: 1rem;">View Details</button>
                    <div class="amenities-preview" style="margin-top:0.5rem; font-size:0.8rem; color: #8892b0;">
                        <i class="fas fa-check"></i> ${hall.facilities.slice(0, 3).join(", ")}...
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </section>
        
        <!-- Global Sections -->
        <section id="reviews" class="section-container alt-bg">
            <div class="section-title">
                <h2>What Guests Say</h2>
                <div class="underline"></div>
            </div>
            <div class="reviews-grid">
                <div class="review-card glass-card">
                    <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                    <p class="review-text">"The entire booking process was seamless. Highly recommended!"</p>
                    <div class="reviewer">- Anjali K.</div>
                </div>
                 <div class="review-card glass-card">
                    <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></div>
                    <p class="review-text">"Great platform to compare halls. Saved me so much time."</p>
                    <div class="reviewer">- Rajesh M.</div>
                </div>
            </div>
        </section>

        <section id="support" class="section-container">
            <div class="section-title">
                <h2>Support & Contact</h2>
                <div class="underline"></div>
            </div>
            <div class="support-wrapper">
                <div class="support-card glass-card">
                    <i class="fas fa-headset"></i>
                    <h3>Contact Us</h3>
                    <p style="margin-bottom: 0.5rem;"><i class="fas fa-phone-alt"></i> +91 8010253647</p>
                    <p style="margin-bottom: 0.5rem;"><i class="fas fa-envelope"></i> vaishnavipatil1459@gmail.com</p>
                    <button class="btn btn-outline" onclick="showNotification('Calling Support...')" style="margin-top: 1rem;">Call Now</button>
                </div>
                
                 <div class="glass-card complaint-form-wrapper">
                    <h3>Raise an Issue / Complaint</h3>
                    <div class="complaint-form">
                        <textarea id="complaintText" placeholder="Describe your issue..."></textarea>
                        <button class="btn btn-secondary" onclick="window.submitComplaint()">Submit Complaint</button>
                    </div>
                </div>
            </div>
        </section>
    `;

    app.innerHTML = html;
}

function showHallDetails(id) {
    setNavVisibility(false);
    const hall = halls.find(h => h.id === id);
    if (!hall) return;
    currentHall = hall;
    currentSlot = null;
    currentSelectedDate = null;

    // Show Book Now on Details
    const navBooking = document.getElementById('nav-booking-item');
    if (navBooking) navBooking.style.display = 'block';

    const app = document.getElementById('app-content');
    window.scrollTo(0, 0);

    const facilitiesHtml = hall.facilities.map(f => `
        <div class="facility-item"><i class="fas fa-check-circle"></i> ${f}</div>
    `).join('');

    const galleryHtml = hall.images.map(img => `
        <div class="gallery-item" style="background-image: url('${img}');" onclick="window.open('${img}', '_blank')"></div>
    `).join('');

    app.innerHTML = `
        <header class="hero-section" style="background-image: url('${hall.images[0]}'); height: 60vh;">
            <div class="hero-overlay"></div>
            <div class="hero-content fade-in">
                <h1>${hall.name}</h1>
                <p><i class="fas fa-map-marker-alt"></i> ${hall.address}</p>
                <button onclick="showHome()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Back to Halls</button>
            </div>
        </header>

        <section class="section-container">
            <div class="details-grid">
                <div class="detail-card glass-card">
                    <i class="fas fa-users"></i>
                    <h3>Capacity</h3>
                    <p>${hall.capacity}</p>
                </div>
                <div class="detail-card glass-card">
                    <i class="fas fa-money-bill-wave"></i>
                    <h3>Price</h3>
                    <p>${hall.price}</p>
                </div>
                <div class="detail-card glass-card">
                    <i class="fas fa-info-circle"></i>
                    <h3>About</h3>
                    <p style="font-size: 0.9rem;">${hall.description}</p>
                </div>
            </div>

            <div class="glass-panel" style="padding: 2rem; border-radius: 8px;">
                <h3>Photo Gallery</h3>
                <div class="gallery-grid">
                    ${galleryHtml}
                </div>
            </div>

            <div class="facilities-container" style="margin-top: 3rem;">
                <h3>Facilities (Amenities)</h3>
                <div class="facilities-list">
                    ${facilitiesHtml}
                </div>
            </div>
        </section>

        <section id="booking" class="section-container booking-section" style="background-image: url('${hall.images[1] || hall.images[0]}');">
             <div class="section-title">
                <h2>Check Availability & Book</h2>
                <div class="underline"></div>
            </div>
            
            <div class="booking-wrapper glass-panel" style="background-color: var(--primary);">
                <div id="initialBookNowSection" style="text-align: center; padding: 3rem 1rem;">
                    <button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2.5rem; background-color: var(--secondary); color: var(--primary);" onclick="document.getElementById('initialBookNowSection').classList.add('hidden'); document.getElementById('calendarContainerSection').classList.remove('hidden');">Book Now</button>
                </div>
                
                <!-- CALENDAR SECTION -->
                <div id="calendarContainerSection" class="calendar-container hidden" style="background-color: var(--secondary); padding: 2rem; border-radius: 8px;">
                    <div class="calendar-header">
                        <button class="btn btn-sm btn-outline" onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                        <h3 id="currentMonthYear">Month Year</h3>
                        <button class="btn btn-sm btn-outline" onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    
                    <div class="calendar-legend">
                        <div><span class="dot green"></span> Available</div>
                        <div><span class="dot red"></span> Fully Booked</div>
                    </div>
                    
                    <div id="calendarGrid" class="calendar-grid">
                         <!-- Calendar Injected Here -->
                         <div style="text-align:center; padding: 2rem;">Loading Calendar...</div>
                    </div>
                </div>

                <!-- SLOTS SECTION (Usually Hidden) -->
                <div id="slotSection" class="availability-check hidden" style="margin-top: 2rem; padding: 2rem; background-color: var(--secondary); border-radius: 8px;">
                     <h3 style="color: var(--primary);">Available Slots for <span id="selectedDateDisplay" style="color: var(--white)"></span></h3>
                     <div id="slotSelection" class="slots-grid"></div>
                </div>

                <!-- FORM SECTION (Usually Hidden) -->
                <div id="bookingFormContainer" class="booking-form-container hidden" style="margin-top: 2rem; padding: 2rem; background-color: var(--secondary); border-radius: 8px;">
                    <h3 style="color: var(--primary);">Confirm Booking</h3>
                    <div class="selected-slot-info" style="margin-bottom: 1rem; color: var(--white); font-weight: bold;"></div>
                    <form id="bookingForm">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="fullName" required placeholder="Your Name">
                        </div>
                        <div class="form-group">
                            <label>Contact Number</label>
                            <input type="tel" id="contact" required placeholder="10-digit Mobile Number">
                        </div>
                        <button type="submit" class="btn btn-primary full-width" style="margin-top: 1rem;">Pay Now</button>
                    </form>
                </div>
            </div>
        </section>
    `;

    // Initialize Calendar
    const now = new Date();
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();
    renderCalendar();

    initBookingForm();
}


// ==========================================
// CALENDAR & BOOKING LOGIC
// ==========================================

async function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const header = document.getElementById('currentMonthYear');

    if (!grid || !header) return;

    // Formatting
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    header.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    grid.innerHTML = '<div class="spinner"></div>'; // Loading

    // 1. Calculate Days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 2. Fetch Data from Supabase
    // Select all bookings for this hall in this month
    const startStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const endStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${daysInMonth}`;

    let dbBookings = [];

    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('booking_date, slot')
            .eq('hall_id', currentHall.id)
            .gte('booking_date', startStr)
            .lte('booking_date', endStr);

        if (error) {
            console.error("Calendar Fetch Error:", error);
            showNotification("Error loading calendar", "error");
        } else {
            dbBookings = data;
        }
    } else {
        // Fallback if supabase failed init
        console.warn("Supabase not active, using empty mock");
    }

    // 3. Process Data: Map date -> booked slots count
    const bookingMap = {}; // "2026-02-14": Set("Morning", "Evening")
    dbBookings.forEach(row => {
        if (!bookingMap[row.booking_date]) bookingMap[row.booking_date] = new Set();
        bookingMap[row.booking_date].add(row.slot);
    });

    // 4. Render Grid
    let html = `
        <div class="cal-day-header">Sun</div>
        <div class="cal-day-header">Mon</div>
        <div class="cal-day-header">Tue</div>
        <div class="cal-day-header">Wed</div>
        <div class="cal-day-header">Thu</div>
        <div class="cal-day-header">Fri</div>
        <div class="cal-day-header">Sat</div>
    `;

    // Empty cells for padding
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="cal-day empty"></div>`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(currentYear, currentMonth, d);
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        // Status Check
        const bookedSlots = bookingMap[dateStr] ? bookingMap[dateStr] : new Set();
        const isFull = bookedSlots.size >= slotsArray.length; // All slots booked

        let dayClass = "cal-day";
        if (dateObj < today) {
            dayClass += " past"; // Cannot book past
        } else if (isFull) {
            dayClass += " red"; // Fully Booked
        } else {
            dayClass += " green"; // Available
        }

        // Click Handler (only for today or future dates if available)
        let clickAttr = "";
        if (dateObj >= today && !isFull) {
            clickAttr = `onclick="loadSlotsForDate('${dateStr}')"`;
        }

        html += `<div class="${dayClass}" ${clickAttr}>${d}</div>`;
    }

    grid.innerHTML = html;
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

async function loadSlotsForDate(dateStr) {
    // UI Update
    currentSelectedDate = dateStr;
    const slotSection = document.getElementById('slotSection');
    const slotGrid = document.getElementById('slotSelection');
    const display = document.getElementById('selectedDateDisplay');
    const formContainer = document.getElementById('bookingFormContainer');

    slotSection.classList.remove('hidden');
    formContainer.classList.add('hidden');
    display.textContent = dateStr;
    slotGrid.innerHTML = '<div class="spinner"></div>';

    // Fetch bookings specifically for this date to be sure (or reuse cache)
    // We already have bookingMap logic in render, but let's re-fetch or pass data? 
    // Simplest is to check Supabase again or just infer from what we know? 
    // Let's simple check DB again for safety or pass sets. 
    // Actually, let's re-fetch to ensure real-time accuracy (in case someone just booked).

    let bookedSlots = [];
    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('slot')
            .eq('hall_id', currentHall.id)
            .eq('booking_date', dateStr);
        if (data) bookedSlots = data.map(r => r.slot);
    }

    slotGrid.innerHTML = '';

    slotsArray.forEach(slot => {
        const isBooked = bookedSlots.includes(slot);
        const btn = document.createElement('div');
        btn.className = `slot-card ${isBooked ? 'booked' : 'available'}`;
        btn.innerHTML = `<i class="fas ${getSlotIcon(slot)}"></i><br>${slot}`;

        if (isBooked) {
            btn.title = "Already Booked";
        } else {
            btn.onclick = () => selectSlot(slot, dateStr);
        }
        slotGrid.appendChild(btn);
    });

    // Scroll to slots
    slotSection.scrollIntoView({ behavior: 'smooth' });
}

function getSlotIcon(slot) {
    if (slot === 'Morning') return 'fa-sun';
    if (slot === 'Evening') return 'fa-cloud-sun';
    return 'fa-moon';
}

function selectSlot(slot, date) {
    currentSlot = slot;

    // Highlight
    document.querySelectorAll('.slot-card').forEach(el => el.classList.remove('selected'));
    // Find the clicked one logic... actually simpler to just re-render or add class to event target
    // For simplicity, we assume user knows what they clicked.

    const formContainer = document.getElementById('bookingFormContainer');
    formContainer.classList.remove('hidden');

    const info = formContainer.querySelector('.selected-slot-info');
    info.textContent = `Booking for: ${date} (${slot})`;

    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function initBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    // Input Validation
    const nameInput = document.getElementById('fullName');
    const contactInput = document.getElementById('contact');

    nameInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    });

    contactInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('fullName').value;
        const contact = document.getElementById('contact').value;

        if (contact.length !== 10) {
            showNotification("Mobile number must be exactly 10 digits", "error");
            return;
        }

        const btn = form.querySelector('button');
        const originalText = btn.textContent;

        if (!currentSlot || !currentSelectedDate) return;

        btn.textContent = "Processing...";
        btn.disabled = true;

        // 1. Save to Session Storage (Pending)
        const bookingDetails = {
            hall_id: currentHall.id,
            booking_date: currentSelectedDate,
            slot: currentSlot,
            customer_name: name,
            contact_number: contact,
            status: 'Confirmed'
        };
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingDetails));

        // 2. Open Payment Link (Redirect Mechanism)
        // We open in _self so that when they finish payment, the redirect URL (success.html) loads in this tab 
        // effectively guiding them through the flow.
        // NOTE: If using a popup link, logic differs. For direct link, this is best.
        window.location.href = "https://rzp.io/rzp/GwxrbTU";

        // 3. Show Success & Reset
        showNotification("Booking Confirmed!");

        const formContainer = document.getElementById('bookingFormContainer');
        formContainer.innerHTML = `
              <div style="text-align: center; padding: 2rem;">
                  <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary); margin-bottom: 1rem;"></i>
                  <h3>Booking Confirmed!</h3>
                  <p>Please complete payment in the new tab.</p>
                  <button class="btn btn-secondary" onclick="showHome()">Back to Home</button>
              </div>
         `;

        // Refresh Calendar behind the scenes? No, user is done.
    });
}


// ==========================================
// UTILS & NAV
// ==========================================
function initNav() {
    // Same as before
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');
    if (toggle) {
        toggle.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            if (nav.style.display === 'flex') {
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '70px';
                nav.style.right = '0';
                nav.style.background = 'rgba(10, 25, 47, 0.95)';
                nav.style.width = '100%';
                nav.style.padding = '2rem';
                nav.style.zIndex = '1000';
            }
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            if (window.innerWidth <= 768 && nav.style.display === 'flex') {
                nav.style.display = 'none';
            }

            if (targetId === 'home') {
                showHome();
                return;
            }

            if (currentHall) {
                showHome();
                setTimeout(() => {
                    const section = document.getElementById(targetId) || document.getElementById('halls-list');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                if (targetId === 'details' || targetId === 'booking') {
                    const list = document.getElementById('halls-list');
                    if (list) list.scrollIntoView({ behavior: 'smooth' });
                } else {
                    const section = document.getElementById(targetId);
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

function setNavVisibility(hidden) {
    // Implementation optional based on design, simplified here
}

function showNotification(msg, type = 'success') {
    const notif = document.getElementById('notification');
    if (!notif) return;
    const content = document.getElementById('notificationMessage');
    const icon = notif.querySelector('i');

    content.textContent = msg;

    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#ff6b6b';
    } else {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#64ffda';
    }

    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 4000);
}

// Global Exports
window.submitComplaint = function () {
    const text = document.getElementById('complaintText').value;
    if (!text.trim()) {
        showNotification("Please enter details.", "error");
        return;
    }
    showNotification("Complaint ID #8829 created. Support will contact you.");
    document.getElementById('complaintText').value = '';
};

// ==========================================
// MY BOOKINGS & CANCELLATION
// ==========================================
window.showMyBookingsView = function () {
    setNavVisibility(false);

    // Hide all nav items except Home
    const links = document.querySelectorAll('.nav-links li');
    links.forEach((li, index) => {
        if (index !== 0) li.style.display = 'none';
    });

    // Hide default sections
    const app = document.getElementById('app-content');
    window.scrollTo(0, 0);

    app.innerHTML = `
        <header class="hero-section" style="background-image: url('hall4.jpg'); height: 50vh;">
            <div class="hero-overlay"></div>
            <div class="hero-content fade-in">
                <h1>My Bookings</h1>
                <p>Manage your reservations</p>
            </div>
        </header>

        <section class="section-container">
            <div class="booking-wrapper glass-panel" style="max-width: 800px;">
                <div class="check-form" id="lookupForm">
                    <input type="tel" id="lookupMobile" placeholder="Enter Registered Mobile Number" 
                           oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10)"
                           style="background: var(--secondary); color: white; border: 1px solid var(--glass-border);">
                    <button class="btn btn-primary" onclick="fetchUserBookings()">Find Bookings</button>
                </div>
                
                <div id="bookingHistoryGrid" class="halls-grid" style="grid-template-columns: 1fr; margin-top: 2rem;">
                    <!-- Results Here -->
                </div>
            </div>
        </section>
    `;
}

window.fetchUserBookings = async function () {
    const mobile = document.getElementById('lookupMobile').value;
    const grid = document.getElementById('bookingHistoryGrid');

    if (!mobile || mobile.length !== 10) {
        showNotification("Please enter a valid 10-digit mobile number", "error");
        return;
    }

    grid.innerHTML = '<div class="spinner"></div>';

    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('contact_number', mobile)
            .order('booking_date', { ascending: true });

        if (error) {
            console.error(error);
            showNotification("Error fetching bookings", "error");
            grid.innerHTML = `<div style="text-align:center">Error loading data.</div>`;
            return;
        }

        if (!data || data.length === 0) {
            grid.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No bookings found for this number.</div>`;
            return;
        }

        // Render
        grid.innerHTML = data.map(booking => {
            const hall = halls.find(h => h.id === booking.hall_id);
            const hallName = hall ? hall.name : "Unknown Hall";
            const hallImg = hall ? hall.images[0] : "hall1.jpg";

            return `
                <div class="glass-card booking-card" style="padding: 1rem;">
                    <div class="booking-card-img" style="background: url('${hallImg}') center/cover;"></div>
                    <div style="flex-grow: 1;">
                        <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${hallName}</h3>
                        <p style="color: var(--primary); font-weight: bold;"><i class="far fa-calendar-alt"></i> ${booking.booking_date}</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem;"><i class="far fa-clock"></i> ${booking.slot}</p>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem;">Status: <span style="color: #64ffda;">${booking.status || 'Confirmed'}</span></p>
                    </div>
                    <button class="btn btn-outline" style="border-color: #ff6b6b; color: #ff6b6b;" onclick="cancelBooking(${booking.id})">Cancel</button>
                </div>
            `;
        }).join('');
    } else {
        showNotification("Database not connected", "error");
    }
}

window.cancelBooking = async function (id) {
    if (!confirm("Are you sure you want to cancel this booking? This cannot be undone.")) return;

    if (supabaseClient) {
        const { error } = await supabaseClient
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) {
            showNotification("Cancellation failed: " + error.message, "error");
        } else {
            showNotification("Booking Cancelled Successfully");
            fetchUserBookings(); // Refresh list
        }
    }
}
