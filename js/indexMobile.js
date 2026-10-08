console.log("NIROG Mobile Website Loaded");


// =====================================================
// PHONE / WHATSAPP
// =====================================================

const whatsappNumber = "919114124211";


// =====================================================
// BANNER
// =====================================================

const mobileBanners = [
    "images/banner/banner1.webp",
    "images/banner/banner2.webp",
    "images/banner/banner4.jpeg"
];

const mobileBannerWrapper =
    document.getElementById("mobileBannerWrapper");

if (mobileBannerWrapper) {

    mobileBanners.forEach((banner, index) => {

        mobileBannerWrapper.insertAdjacentHTML(
            "beforeend",

            `
            <div class="swiper-slide">

                <img
                    src="${banner}"
                    alt="NIROG Diagnostics Banner ${index + 1}"
                >

            </div>
            `
        );

    });


    new Swiper(".mobileHeroSwiper", {

        loop: mobileBanners.length > 1,

        speed: 700,

        autoplay: mobileBanners.length > 1
            ? {
                delay: 3500,
                disableOnInteraction: false
            }
            : false,

        pagination: {
            el: ".mobileHeroSwiper .swiper-pagination",
            clickable: true
        }

    });

}


// =====================================================
// SEARCH
// =====================================================

const mobileBookingSearch =
    document.getElementById("mobileBookingSearch");

if (mobileBookingSearch) {

    mobileBookingSearch.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const input =
                document.getElementById("mobileTestSearch");

            const query =
                input.value.trim();

            if (!query) {
                return;
            }

            window.location.href =
                "tests.html?search=" +
                encodeURIComponent(query);

        }
    );

}


// =====================================================
// DOWNLOAD REPORT
// =====================================================

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


// =====================================================
// MOBILE MENU
// =====================================================

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

if (mobileMenuBtn) {

    mobileMenuBtn.addEventListener(
        "click",
        function () {

            console.log("Mobile menu clicked");

            // We will add the mobile drawer here
            // after the main homepage layout is completed.

        }
    );

}