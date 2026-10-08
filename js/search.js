let allData = null;
let cart = {};          // key: "type|labKey|testId" -> {labName, testName, price, type}
let selectedLab = null; // locks the booking to one lab/company across BOTH labs and radiology results

async function init() {

    allData = await loadLabData();

    bindSearchForm();
    bindAutocomplete();

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");

    if (q) {
        document.getElementById("searchInput").value = q;
        runSearch(q);
    }
}
function getAllTestNames() {

    const names = new Set();

    ["labs", "radiology"].forEach(type => {

        const group = allData[type] || {};

        Object.values(group).forEach(lab => {

            Object.values(lab.categories || {}).forEach(tests => {

                tests.forEach(test => {
                    names.add(test.name);
                });

            });

        });

    });

    return Array.from(names).sort();
}

function bindAutocomplete() {

    const input = document.getElementById("searchInput");
    const suggestionBox = document.getElementById("searchSuggestions");

    const allTestNames = getAllTestNames();

    input.addEventListener("input", function () {

        const originalQuery = this.value.trim();
        const query = originalQuery.toLowerCase();

        suggestionBox.innerHTML = "";

        if (!query) {
            suggestionBox.classList.remove("show");
            return;
        }

        // Find all test names containing the typed text anywhere
        const matches = allTestNames
            .filter(name =>
                name.toLowerCase().includes(query)
            )
            .sort((a, b) => {

                const aLower = a.toLowerCase();
                const bLower = b.toLowerCase();

                // Exact match first
                if (aLower === query) return -1;
                if (bLower === query) return 1;

                // Names starting with query second
                if (aLower.startsWith(query) && !bLower.startsWith(query)) {
                    return -1;
                }

                if (!aLower.startsWith(query) && bLower.startsWith(query)) {
                    return 1;
                }

                return a.localeCompare(b);
            })
            .slice(0, 8);


        // ---------------------------------
        // FIRST OPTION: what user typed
        // ---------------------------------

        const searchItem = document.createElement("div");

        searchItem.className = "suggestion-item typed-search-option";

        searchItem.innerHTML = `
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>Search for "<strong>${escapeHtml(originalQuery)}</strong>"</span>
        `;

        searchItem.addEventListener("click", function () {

            input.value = originalQuery;

            suggestionBox.classList.remove("show");

            runSearch(originalQuery);

            const url = new URL(window.location);
            url.searchParams.set("q", originalQuery);

            window.history.replaceState({}, "", url);
        });

        suggestionBox.appendChild(searchItem);


        // ---------------------------------
        // MATCHING TEST OPTIONS
        // ---------------------------------

        matches.forEach(name => {

            const item = document.createElement("div");

            item.className = "suggestion-item";

            item.innerHTML = `
                <i class="fa-solid fa-magnifying-glass"></i>
                <span>${highlightMatch(name, originalQuery)}</span>
            `;

            item.addEventListener("click", function () {

                input.value = name;

                suggestionBox.classList.remove("show");

                runSearch(name);

                const url = new URL(window.location);
                url.searchParams.set("q", name);

                window.history.replaceState({}, "", url);
            });

            suggestionBox.appendChild(item);

        });

        suggestionBox.classList.add("show");

    });


    document.addEventListener("click", function (e) {

        if (!e.target.closest(".search-autocomplete-wrapper")) {
            suggestionBox.classList.remove("show");
        }

    });

}
function highlightMatch(name, query) {

    const lowerName = name.toLowerCase();
    const lowerQuery = query.toLowerCase();

    const index = lowerName.indexOf(lowerQuery);

    if (index === -1) {
        return escapeHtml(name);
    }

    const before = name.substring(0, index);
    const matched = name.substring(index, index + query.length);
    const after = name.substring(index + query.length);

    return `
        ${escapeHtml(before)}
        <strong>${escapeHtml(matched)}</strong>
        ${escapeHtml(after)}
    `;
}
function bindSearchForm() {
    document.getElementById("searchForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const query = document.getElementById("searchInput").value.trim();
        runSearch(query);

        // keep the URL shareable/bookmarkable
        const url = new URL(window.location);
        url.searchParams.set("q", query);
        window.history.replaceState({}, "", url);
    });
}

/* Finds every test across every lab/radiology whose name or id contains the query,
   grouped by test id so the same test from different labs sits in ONE row. */
function collectMatches(type, query) {
    const q = query.toLowerCase();
    const group = allData[type] || {};
    const matches = {};

    Object.keys(group).forEach(labKey => {
        const lab = group[labKey];
        Object.keys(lab.categories || {}).forEach(category => {
            (lab.categories[category] || []).forEach(test => {
                if (test.name.toLowerCase().includes(q) || test.id.toLowerCase().includes(q)) {
                    const rowKey = test.id;
                    if (!matches[rowKey]) {
                        matches[rowKey] = { id: test.id, name: test.name, category, prices: {} };
                    }
                    matches[rowKey].prices[labKey] = test.price;
                }
            });
        });
    });

    return Object.values(matches);
}

function runSearch(query) {
    const status = document.getElementById("searchStatus");
    const labBox = document.getElementById("labResultsBox");
    const radBox = document.getElementById("radiologyResultsBox");
    const noResults = document.getElementById("noResults");

    labBox.innerHTML = "";
    radBox.innerHTML = "";
    noResults.style.display = "none";
    status.innerHTML = "";

    if (!query) {
        status.innerHTML = `<p class="text-muted">Start typing a test name above to compare prices across all labs.</p>`;
        return;
    }

    const labMatches = collectMatches("labs", query);
    const radMatches = collectMatches("radiology", query);

    if (labMatches.length === 0 && radMatches.length === 0) {
        document.getElementById("noResultsQuery").textContent = query;

        const waMessage = `Hi NIROG Diagnostics, I searched for "${query}" on your website but couldn't find it. Could you please confirm if this test is available and share the price?`;
        document.getElementById("whatsappFallback").href =
            `https://wa.me/919114124211?text=${encodeURIComponent(waMessage)}`;

        noResults.style.display = "block";
        return;
    }

    status.innerHTML = `<p class="text-muted">Showing results for "<strong>${escapeHtml(query)}</strong>"</p>`;

    if (labMatches.length > 0) {
        labBox.innerHTML = `<h4 class="results-heading"><i class="fa-solid fa-flask"></i> Lab Tests</h4>`;
        labBox.appendChild(buildTable("labs", labMatches));
    }

    if (radMatches.length > 0) {
        radBox.innerHTML = `<h4 class="results-heading"><i class="fa-solid fa-x-ray"></i> Radiology / Scans</h4>`;
        radBox.appendChild(buildTable("radiology", radMatches));
    }

    bindAllCheckboxes();
}

function buildTable(type, matches) {
    const group = allData[type] || {};
    const labKeys = Object.keys(group);

    const wrapper = document.createElement("div");
    wrapper.className = "table-responsive search-table-wrapper";

    let html = `<table class="table table-bordered compare-table"><thead><tr><th>Test</th>`;
    labKeys.forEach(labKey => {
        html += `<th>${group[labKey].name}</th>`;
    });
    html += `</tr></thead><tbody>`;

    matches.forEach(row => {
        html += `<tr><td>${row.name}</td>`;
        labKeys.forEach(labKey => {
            const price = row.prices[labKey];
            if (price === undefined) {
                html += `<td class="text-muted">—</td>`;
            } else {
                const cartKey = `${type}|${labKey}|${row.id}`;
                const checked = cart[cartKey] ? "checked" : "";
                const locked = isLocked(labKey);
                html += `<td class="${locked ? 'locked-cell' : ''}">
                    ₹${price}
                    <br>
                    <input type="checkbox"
                           class="searchCheck"
                           data-key="${cartKey}"
                           data-type="${type}"
                           data-lab="${labKey}"
                           data-name="${row.name}"
                           data-price="${price}"
                           ${checked}
                           ${locked ? "disabled" : ""}>
                </td>`;
            }
        });
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    wrapper.innerHTML = html;
    return wrapper;
}

function isLocked(labKey) {
    return selectedLab !== null && selectedLab !== labKey;
}

function bindAllCheckboxes() {
    document.querySelectorAll(".searchCheck").forEach(check => {
        check.addEventListener("change", function () {
            handleCheckToggle(this);
        });
    });
}

function handleCheckToggle(checkboxEl) {
    const key = checkboxEl.dataset.key;
    const type = checkboxEl.dataset.type;
    const labKey = checkboxEl.dataset.lab;
    const labName = allData[type][labKey].name;

    if (checkboxEl.checked) {

        if (selectedLab !== null && selectedLab !== labKey) {
            checkboxEl.checked = false;

            // Find the human-readable name of whichever lab is currently locked in
            const lockedItems = Object.values(cart);
            const lockedLabName = lockedItems.length ? lockedItems[0].labName : selectedLab;

            alert(
                `You can only book from one lab/center at a time.\n\n` +
                `You already have items selected from "${lockedLabName}". ` +
                `Please clear your cart first if you want to switch to "${labName}".`
            );
            return;
        }

        selectedLab = labKey;
        cart[key] = {
            labName: labName,
            testName: checkboxEl.dataset.name,
            price: Number(checkboxEl.dataset.price),
            type: type
        };

    } else {
        delete cart[key];
        if (Object.keys(cart).length === 0) {
            selectedLab = null;
        }
    }

    updateTotal();
    // re-render current results so the lock/disabled state stays accurate
    const query = document.getElementById("searchInput").value.trim();
    if (query) runSearch(query);
}

function updateTotal() {
    const total = Object.values(cart).reduce((sum, item) => sum + item.price, 0);
    document.getElementById("totalPrice").innerHTML = "₹" + total;

    const lockNote = document.getElementById("lockNote");
    if (lockNote) {
        const items = Object.values(cart);
        lockNote.innerHTML = items.length
            ? `Booking with: <strong>${items[0].labName}</strong> — clear cart to switch labs.`
            : "";
    }
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

document.getElementById("bookNowBtn").addEventListener("click", function () {
    const items = Object.values(cart);

    if (items.length === 0) {
        alert("Please select at least one test.");
        return;
    }

    const total = items.reduce((sum, item) => sum + item.price, 0);
    const labName = items[0].labName;

    let message = `🩺 *NIROG Diagnostics Booking*\n\n🏥 *Lab/Center:* ${labName}\n\n📋 *Selected:*\n\n`;

    items.forEach((item, index) => {
        message += `${index + 1}. ${item.testName} - ₹${item.price}\n`;
    });

    message += `\n💰 *Total Amount:* ₹${total}\n\nKindly confirm availability and next steps.\n\nThank you.`;

    const whatsappNumber = "919114124211";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
});

init();