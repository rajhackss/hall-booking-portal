
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

let halls = [];

function getImagePath(img) {
    if (!img) return "pics/hall1.jpg";
    if (img.startsWith("http") || img.startsWith("pics/")) return img;
    return "pics/" + img;
}

// ==========================================
// DATA FETCHING
// ==========================================
async function fetchHalls() {
    if (!supabaseClient) {
        console.error("Supabase client not initialized");
        return;
    }

    const { data, error } = await supabaseClient
        .from('halls')
        .select('*');

    if (error) {
        console.error("Error fetching halls:", error);
        // Fallback to empty or notify user
        showNotification("Failed to load halls from database.", "error");
        return;
    }

    if (data && data.length > 0) {
        halls = data;
        // Assign Random Amenities if they don't exist in DB
        halls.forEach(hall => {
            if (!hall.facilities || hall.facilities.length === 0) {
                const shuffled = [...amenitiesMasterList].sort(() => 0.5 - Math.random());
                const count = Math.floor(Math.random() * 3) + 6;
                hall.facilities = shuffled.slice(0, count);
            }
        });
    } else {
        console.log("No halls found in database. Seeding initial data...");
        // Seed initial data if database is completely empty
        const initialHalls = [
            { name: "Sarjerao Yadav Multipurpose Hall & Lawn", address: "Bahe Rd, near SONA Chemicals, MIDC, Ishwarpur, Maharashtra 415409", capacity: "500 Guests", price: "₹70,000 / Day", description: "A grand multipurpose hall with an expansive lawn, perfect for massive wedding receptions and public gatherings.", images: ["pics/hall1.jpg", "pics/hall11.jpg", "pics/hall111.jpg"], facilities: ["AC", "Parking", "Generator / Power Backup", "Cleaning Service", "Lift / Accessibility"] },
            { name: "Indira Palace & Lawns", address: "Waghwadi, Phata, Ishwarpur, Maharashtra 415407", capacity: "600 Guests", price: "₹90,000 / Day", description: "An elegant palace-style venue featuring regal architecture and diverse layout options for medium to large events.", images: ["pics/hall2.jpg", "pics/hall22.jpg", "pics/hall222.jpg"], facilities: ["Decoration Service", "DJ / Sound System", "Chairs & Tables", "Washroom Facility", "Parking"] },
            { name: "Mankeshwar Multi-purpose Hall & Lawns", address: "Kore Appa Nagar, Kreshar Road, Shastri Nagar, Kisannagar, Ishwarpur, Maharashtra 415409", capacity: "500 Guests", price: "₹50,000 / Day", description: "A modern facility located in a prime residential area, offering a blend of indoor comfort and outdoor freshness.", images: ["pics/hall3.jpg", "pics/hall33.jpg", "pics/hall333.jpg"], facilities: ["AC", "Catering Service", "Projector / LED Screen", "Cleaning Service", "Washroom Facility"] },
            { name: "Akshay Multipurpose Hall", address: "Waghwadi Phata, Ishwarpur, Maharashtra 415409", capacity: "800 Guests", price: "₹65,000 / Day", description: "A cozy and budget-friendly hall ideal for intimate weddings, birthday parties, and corporate functions.", images: ["pics/hall4.jpg", "pics/hall44.jpg", "pics/hall444.jpg"], facilities: ["Non-AC", "Parking", "Washroom Facility", "Catering Service", "DJ / Sound System"] }
        ];
        
        const { error: seedError } = await supabaseClient.from('halls').insert(initialHalls);
        
        if (!seedError) {
            console.log("Seeded successfully, fetching newly created halls...");
            // Re-fetch to populate halls array
            const { data: newData } = await supabaseClient.from('halls').select('*');
            if (newData) halls = newData;
        } else {
            console.error("Error seeding database:", seedError);
        }
    }
}


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
document.addEventListener('DOMContentLoaded', async () => {
    initNav();
    await fetchHalls(); // Fetch halls before showing home
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
        <header id="home" class="hero-section" style="background-image: url('pics/hall1.jpg');">
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
                <div class="card-image" style="background-image: url('${getImagePath(hall.images[0])}');"></div>
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
        <div class="gallery-item" style="background-image: url('${getImagePath(img)}');" onclick="window.open('${img}', '_blank')"></div>
    `).join('');

    app.innerHTML = `
        <header class="hero-section" style="background-image: url('${getImagePath(hall.images[0])}'); height: 60vh;">
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

        <section id="booking" class="section-container booking-section" style="background-image: url('${getImagePath(hall.images[1] || hall.images[0])}');">
            
            <div class="booking-wrapper glass-panel">
                <div class="section-title" style="margin-bottom: 0;">
                    <h2 style="margin-top: 1rem;">Check Availability & Book</h2>
                    <div class="underline"></div>
                </div>

                <div id="initialBookNowSection" style="text-align: center; padding: 3rem 1rem;">
                    <button class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2.5rem;" onclick="document.getElementById('initialBookNowSection').classList.add('hidden'); document.getElementById('calendarContainerSection').classList.remove('hidden');">Book Now</button>
                </div>

                <!-- CALENDAR SECTION -->
                <div id="calendarContainerSection" class="calendar-container hidden">
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
                <div id="slotSection" class="availability-check hidden" style="margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem;">
                     <h3>Available Slots for <span id="selectedDateDisplay" style="color: var(--primary)"></span></h3>
                     <div id="slotSelection" class="slots-grid"></div>
                </div>

                <!-- FORM SECTION (Usually Hidden) -->
                <div id="bookingFormContainer" class="booking-form-container hidden">
                    <h3>Confirm Booking</h3>
                    <div class="selected-slot-info" style="margin-bottom: 1rem; color: var(--primary); font-weight: bold;"></div>
                    <form id="bookingForm">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="fullName" required placeholder="Your Name">
                        </div>
                        <div class="form-group">
                            <label>Contact Number</label>
                            <input type="tel" id="contact" required placeholder="10-digit Mobile Number">
                        </div>
                        <div class="form-group">
                            <label>Number of Days</label>
                            <input type="number" id="bookingDuration" value="1" min="1" max="30" required>
                            <small id="pricePreview" style="color: var(--primary); display: block; margin-top: 0.5rem;"></small>
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
        <div class="cal-day-header">Su</div>
        <div class="cal-day-header">Mo</div>
        <div class="cal-day-header">Tu</div>
        <div class="cal-day-header">We</div>
        <div class="cal-day-header">Th</div>
        <div class="cal-day-header">Fr</div>
        <div class="cal-day-header">Sa</div>
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
    
    // trigger price calculation
    const durationInput = document.getElementById('bookingDuration');
    if (durationInput) durationInput.dispatchEvent(new Event('input'));
}

function initBookingForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    // Input Validation
    const nameInput = document.getElementById('fullName');
    const contactInput = document.getElementById('contact');
    const durationInput = document.getElementById('bookingDuration');
    const pricePreview = document.getElementById('pricePreview');

    if (durationInput && currentHall) {
        durationInput.addEventListener('input', (e) => {
            let days = parseInt(e.target.value) || 1;
            if (days < 1) days = 1;
            // Parse base price
            let basePrice = 0;
            if (currentHall.price) {
                const numericString = currentHall.price.replace(/[^0-9]/g, '');
                basePrice = parseInt(numericString) || 0;
            }
            if (basePrice > 0) {
                pricePreview.textContent = "Total Amount: ₹" + (basePrice * days).toLocaleString() + " (" + days + " days)";
            }
        });
        // trigger initial
        durationInput.dispatchEvent(new Event('input'));
    }

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

        let duration = parseInt(document.getElementById('bookingDuration').value) || 1;
        if (duration < 1) duration = 1;

        // Generate dates array
        let datesArray = [];
        let startDate = new Date(currentSelectedDate);
        for(let i=0; i<duration; i++) {
            let nextDate = new Date(startDate);
            nextDate.setDate(startDate.getDate() + i);
            let dStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth()+1).padStart(2,'0')}-${String(nextDate.getDate()).padStart(2,'0')}`;
            datesArray.push(dStr);
        }

        // Check availability in Supabase for all dates
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('bookings')
                .select('booking_date')
                .eq('hall_id', currentHall.id)
                .eq('slot', currentSlot)
                .in('booking_date', datesArray);
            
            if (data && data.length > 0) {
                const bookedDates = data.map(d => d.booking_date).join(', ');
                showNotification("Unavailable! Already booked on: " + bookedDates, "error");
                btn.textContent = "Pay Now";
                btn.disabled = false;
                return;
            }
        }

        // 1. Save array to Session Storage
        const bookingsArray = datesArray.map(date => ({
            hall_id: currentHall.id,
            booking_date: date,
            slot: currentSlot,
            customer_name: name,
            contact_number: contact,
            status: 'Confirmed'
        }));
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingsArray));

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
            const hallImg = hall ? getImagePath(hall.images[0]) : "pics/hall1.jpg";

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

// ==========================================
// ADMIN FUNCTIONALITY
// ==========================================
let isAdminAuthenticated = false;

window.showAdminLogin = function() {
    if (isAdminAuthenticated) {
        showAdminDashboard();
        return;
    }

    const app = document.getElementById('app-content');
    window.scrollTo(0, 0);

    app.innerHTML = `
        <div class="modal-overlay">
            <div class="admin-modal glass-panel">
                <h2>Admin Login</h2>
                <form id="adminLoginForm">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="adminUser" required placeholder="admin">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="adminPass" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn btn-primary full-width">Login</button>
                    <button type="button" class="btn btn-outline full-width" style="margin-top: 1rem;" onclick="showHome()">Cancel</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('adminUser').value;
        const pass = document.getElementById('adminPass').value;

        // Simple hardcoded login for demonstration (Can be moved to Supabase later)
        if (user === 'admin' && pass === 'admin123') {
            isAdminAuthenticated = true;
            showNotification("Welcome, Admin!");
            showAdminDashboard();
        } else {
            showNotification("Invalid credentials", "error");
        }
    });
};

window.showAdminDashboard = async function() {
    if (!isAdminAuthenticated) {
        showAdminLogin();
        return;
    }

    const app = document.getElementById('app-content');
    window.scrollTo(0, 0);

    await fetchHalls(); // Refresh data

    let hallRows = halls.map(hall => `
        <div class="admin-hall-card">
            <div style="background: url('${getImagePath(hall.images[0])}') center/cover; height: 150px; border-radius: 8px; margin-bottom: 1rem;"></div>
            <h3>${hall.name}</h3>
            <p>${hall.price}</p>
            <div class="admin-hall-actions">
                <button class="btn btn-sm btn-outline" onclick="deleteHall(${hall.id})">Delete</button>
                <button class="btn btn-sm btn-secondary" onclick="manageHallImages(${hall.id})">Add Pics</button>
            </div>
        </div>
    `).join('');

    app.innerHTML = `
        <div class="admin-dashboard">
            <div class="admin-header">
                <h2>Admin Dashboard</h2>
                <div>
                    <button class="btn btn-primary" onclick="openAddHallModal()">Add New Hall</button>
                    <button class="logout-btn" onclick="isAdminAuthenticated=false; showHome();">Logout</button>
                </div>
            </div>
            
            <div class="admin-halls-grid">
                ${hallRows}
            </div>
        </div>
    `;
};

window.openAddHallModal = function() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'addHallModal';
    const amenitiesHtml = amenitiesMasterList.map(a => `
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; margin-bottom: 0.5rem; cursor: pointer;">
            <input type="checkbox" name="hAmenity" value="${a}" style="width: auto; height: auto;"> ${a}
        </label>
    `).join('');

    modal.innerHTML = `
        <div class="admin-modal glass-panel" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <h2>Add New Hall</h2>
            <form id="addHallForm">
                <div class="form-group"><label>Hall Name</label><input type="text" id="hName" required></div>
                <div class="form-group"><label>Address</label><input type="text" id="hAddress" required></div>
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;"><label>Capacity</label><input type="text" id="hCapacity" required placeholder="e.g. 500 Guests"></div>
                    <div class="form-group" style="flex: 1;"><label>Price</label><input type="text" id="hPrice" required placeholder="e.g. ₹50,000 / Day"></div>
                </div>
                <div class="form-group"><label>Description</label><textarea id="hDesc" required></textarea></div>
                <div class="form-group">
                    <label>Amenities / Facilities</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; background: var(--secondary-light); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--glass-border);">
                        ${amenitiesHtml}
                    </div>
                    <input type="text" id="hOtherAmenities" placeholder="Other amenities (comma separated)" style="margin-top: 10px;">
                </div>
                <div class="form-group" style="padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                    <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: var(--primary);">Layout & Gallery Images</h3>
                    <div class="form-group">
                        <label>1. Hero Banner Image (Top)</label>
                        <input type="text" id="hHeroImg" required placeholder="hero.jpg">
                    </div>
                    <div class="form-group">
                        <label>2. Booking Section Background</label>
                        <input type="text" id="hBookingImg" required placeholder="booking-bg.jpg">
                    </div>
                    <div class="form-group">
                        <label>3. Photo Gallery Images (Comma Separated)</label>
                        <input type="text" id="hGalleryImgs" required placeholder="pic1.jpg, pic2.jpg, pic3.jpg">
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Save Hall</button>
                    <button type="button" class="btn btn-outline" style="flex: 1;" onclick="document.getElementById('addHallModal').remove()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('addHallForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const checkboxes = document.querySelectorAll('input[name="hAmenity"]:checked');
        let selectedAmenities = Array.from(checkboxes).map(cb => cb.value);
        
        const otherAmInput = document.getElementById('hOtherAmenities').value.trim();
        if (otherAmInput) {
            selectedAmenities = selectedAmenities.concat(otherAmInput.split(',').map(s => s.trim()).filter(s => s));
        }

        const heroImg = document.getElementById('hHeroImg').value.trim() || 'hall1.jpg';
        const bookingImg = document.getElementById('hBookingImg').value.trim() || heroImg;
        const galleryInput = document.getElementById('hGalleryImgs').value;
        const galleryImgs = galleryInput.split(',').map(s => s.trim()).filter(s => s);
        
        // Construct array: [0] is Hero, [1] is Booking Bg
        let finalImages = [heroImg, bookingImg];
        if (galleryImgs.length > 0) {
            finalImages = finalImages.concat(galleryImgs);
        }

        const newHall = {
            name: document.getElementById('hName').value,
            address: document.getElementById('hAddress').value,
            capacity: document.getElementById('hCapacity').value,
            price: document.getElementById('hPrice').value,
            description: document.getElementById('hDesc').value,
            images: finalImages,
            facilities: selectedAmenities.length > 0 ? selectedAmenities : amenitiesMasterList.slice(0, 4)
        };

        if (supabaseClient) {
            const { error } = await supabaseClient
                .from('halls')
                .insert([newHall]);
            if (error) {
                showNotification("Error adding hall: " + error.message, "error");
            } else {
                showNotification("Hall added successfully!");
                document.getElementById('addHallModal').remove();
                showAdminDashboard();
            }
        }
    });
};

window.deleteHall = async function(id) {
    if (!confirm("Are you sure you want to delete this hall?")) return;

    if (supabaseClient) {
        const { error } = await supabaseClient
            .from('halls')
            .delete()
            .eq('id', id);
        
        if (error) {
            showNotification("Delete failed: " + error.message, "error");
        } else {
            showNotification("Hall deleted");
            showAdminDashboard();
        }
    }
};

window.manageHallImages = function(hallId) {
    const hall = halls.find(h => h.id === hallId);
    if (!hall) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'manageImagesModal';
    modal.innerHTML = `
        <div class="admin-modal glass-panel">
            <h2>Manage Images for ${hall.name}</h2>
            <div class="image-preview-area" id="modalImageGrid">
                ${hall.images.map(img => `<img src="${getImagePath(img)}" class="preview-img">`).join('')}
            </div>
            <div class="form-group" style="margin-top: 1.5rem;">
                <label>Add New Image URL</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="newImgUrl" placeholder="https://example.com/image.jpg">
                    <button class="btn btn-secondary" onclick="addNewImageUrl(${hallId})">Add</button>
                </div>
            </div>
            <button class="btn btn-primary full-width" style="margin-top: 1rem;" onclick="document.getElementById('manageImagesModal').remove()">Done</button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.addNewImageUrl = async function(hallId) {
    const url = document.getElementById('newImgUrl').value;
    if (!url) return;

    const hall = halls.find(h => h.id === hallId);
    const updatedImages = [...hall.images, url];

    if (supabaseClient) {
        const { error } = await supabaseClient
            .from('halls')
            .update({ images: updatedImages })
            .eq('id', hallId);
        
        if (error) {
            showNotification("Update failed", "error");
        } else {
            showNotification("Image added!");
            hall.images = updatedImages; // Local update
            document.getElementById('modalImageGrid').innerHTML += `<img src="${url}" class="preview-img">`;
            document.getElementById('newImgUrl').value = '';
        }
    }
};
