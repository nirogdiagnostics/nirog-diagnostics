document
    .getElementById("contactForm")
    .addEventListener("submit", function (e) {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        if (name === "" || mobile === "") {
            alert("Please enter your Name and Mobile Number.");
            return;
        }

        const whatsappMessage =
`*📋 New Contact Enquiry - NIROG Diagnostics*

👤 Name: ${name}

📱 Mobile: ${mobile}

📧 Email: ${email}

📌 Subject: ${subject}

💬 Message:
${message}`;

        const url =
            "https://wa.me/919114124211?text=" +
            encodeURIComponent(whatsappMessage);

        window.open(url, "_blank");

        this.reset();
    });