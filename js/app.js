console.log("NIROG Diagnostics Website Loaded");
window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    if (window.scrollY > 40) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
// Simple search redirect — sends the query to your tests page
const bookingSearchForm = document.querySelector(".booking-search");
if (bookingSearchForm) {
    bookingSearchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const query = document.getElementById("testSearch").value.trim();
        if (query) {
            window.location.href = "tests.html?search=" + encodeURIComponent(query);
        }
    });
}

const contactNumber = "919114124211";
const whatsappNumber = "919114124211";
const displayNumber = "+91 91141 24211";

// Call links
document.querySelectorAll(".footer-call-link").forEach(link => {
    link.href = `tel:+${contactNumber}`;
});

// WhatsApp links
document.querySelectorAll(".footer-whatsapp-link").forEach(link => {
    link.href = `https://wa.me/${contactNumber}`;
});

// Display phone number
document.querySelectorAll(".phone-display").forEach(element => {
    element.textContent = displayNumber;
});

// Display WhatsApp number
document.querySelectorAll(".whatsapp-display").forEach(element => {
    element.textContent = displayNumber;
});

function downloadReportWhatsApp(event) {
    event.preventDefault();

    const message =
`Hi NIROG Diagnostics,

I want to get my diagnostic report.

Please help me with my report.

Thank you.`;

    window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
}

function uploadPrescriptionWhatsApp(event) {
    event.preventDefault();

    const message =
`Hi NIROG Diagnostics,

I want to book tests based on my prescription.

I will attach my prescription here. Please check it and share the test details and pricing.

Thank you.`;

    window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
}
const banners = [
    "images/banner/ban1.png",
    "images/banner/ban2.png" ,
    "images/banner/ban3.png",
    "images/banner/ban4.png"
];

const bannerWrapper = document.getElementById("bannerWrapper");

if (bannerWrapper) {
    banners.forEach((banner, index) => {
        bannerWrapper.insertAdjacentHTML("beforeend", `
            <div class="swiper-slide">
                <img
                    src="${banner}"
                    class="banner-image"
                    alt="Nirog Plus Diagnostics Banner ${index + 1}"
                >
            </div>
        `);
    });

    new Swiper(".heroSwiper", {
        loop: banners.length > 1,
        speed: 800,
        autoplay: banners.length > 1 ? {
            delay: 3500,
            disableOnInteraction: false
        } : false,
        pagination: {
            el: ".heroSwiper .swiper-pagination",
            clickable: true
        }
    });
}

function initNavbar() {
    const toggler = document.querySelector(".navbar-toggler");
    const menu = document.querySelector("#mainMenu");
    const backdrop = document.querySelector(".menu-backdrop");

    if (!toggler || !menu || !backdrop) {
        return false;
    }

    if (toggler.dataset.initialized) return true;
    toggler.dataset.initialized = "true";

    toggler.addEventListener("click", function () {
        this.classList.toggle("active");
        menu.classList.toggle("show");
        backdrop.classList.toggle("active");
    });

    backdrop.addEventListener("click", function () {
        toggler.classList.remove("active");
        menu.classList.remove("show");
        backdrop.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            toggler.classList.remove("active");
            menu.classList.remove("show");
            backdrop.classList.remove("active");
        });
    });

    console.log("Navbar initialized ✅");
    return true;
}

// Initialize navbar immediately if elements exist, otherwise listen for the custom event
if (!initNavbar()) {
    document.addEventListener("headerLoaded", initNavbar);
}

// Dynamic scroll-triggered statistics counter animation
function initCounters() {
    const counters = document.querySelectorAll(".counter-value");
    if (counters.length === 0) return;

    const runCounter = (el) => {
        const target = parseFloat(el.getAttribute("data-target"));
        const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        const duration = 2000; // Animation duration in ms
        const startTime = performance.now();

        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // EaseOutQuad easing function
            const easeProgress = progress * (2 - progress);
            const currentValue = easeProgress * target;

            el.textContent = currentValue.toFixed(decimals);

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = target.toFixed(decimals);
            }
        };

        requestAnimationFrame(updateCount);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (!el.classList.contains("animated")) {
                    el.classList.add("animated");
                    runCounter(el);
                }
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(counter => observer.observe(counter));
}

// Start counters on load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCounters);
} else {
    initCounters();
}


const journeySwiper = new Swiper(".journeySwiper", {
    loop: true,
    speed: 700,
    spaceBetween: 20,

    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },

    pagination: {
        el: ".journey-pagination",
        clickable: true
    },

    breakpoints: {
        0: {
            slidesPerView: 1.2,
            spaceBetween: 12
        },

        577: {
            slidesPerView: 2,
            spaceBetween: 18
        },

        992: {
            slidesPerView: 3,
            spaceBetween: 22
        },

        1200: {
            slidesPerView: 4,
            spaceBetween: 24
        }
    }
});