var now = new Date().getTime();
var hour = 60 * 60 * 1000;

var backend = {
    staff: {
        firstName: "Daniel",
        fullName: "Daniel .E",
        initials: "DE",
        role: "Staff",
        email: "staff@eventify.com",
        password: "password123"
    },

    otpCode: "123456",

    events: [
        {
            id: 1,
            name: "Tech & Creators Summit 2026",
            image:"assets/event1.png",
            location: "Eko Conventional Centre, Victoria Island, Lagos",
            shortLocation: "Eko Conventional Center, V.I, Lagos",
            gate: "Gate A",
            guests: 500,
            startsAt: now - 1 * hour,
            endsAt: now + 5 * hour,
            status: "accepted"
        },
        {
            id: 2,
            name: "Design Challenge Sprint, 2026",
            image: "assets/event2.png",
            location: "Eko Conventional Centre, Victoria Island, Lagos",
            shortLocation: "Eko Conventional Center, V.I, Lagos",
            gate: "Gate C",
            guests: 5000,
            startsAt: now + 30 * hour,
            endsAt: now + 38 * hour,
            status: "accepted"
        },
        {
            id: 3,
            name: "Product Design Summit 2026",
            image: "assets/event3.png",
            location: "Eko Conventional Centre, Victoria Island, Lagos",
            shortLocation: "Eko Conventional Center, V.I, Lagos",
            gate: "Gate B",
            guests: 800,
            startsAt: now + 52 * hour,
            endsAt: now + 60 * hour,
            status: "invited"
        },
        {
            id: 4,
            name: "Hackathon Conference",
            image: "assets/event1.png",
            location: "Yaba Tech Hub, Lagos",
            shortLocation: "Yaba Tech Hub, Lagos",
            gate: "Gate D",
            guests: 400,
            startsAt: now + 100 * hour,
            endsAt: now + 108 * hour,
            status: "invited"
        }
    ],

    tickets: {
        "EVT-4582": { name: "John Eze", type: "VIP", eventId: 1 },
        "EVT-4583": { name: "Adeola Johnson", type: "VIP", eventId: 1 },
        "EVT-4584": { name: "Christabel Johnson", type: "Regular", eventId: 1 },
        "EVT-4585": { name: "Patrick Ugwu", type: "VVIP", eventId: 1 },
        "EVT-4586": { name: "Stephen Ade", type: "Regular", eventId: 1 },
        "EVT-4587": { name: "Omotola Jade", type: "Regular", eventId: 1 },
        "EVT-4590": { name: "Grace Bello", type: "Regular", eventId: 2 }
    },

    checkIns: [
        { eventId: 1, time: "11:48AM", name: "Eze John", code: "EVT-4567", type: "Regular", status: "Confirmed", gate: "Gate 1" },
        { eventId: 1, time: "11:38AM", name: "Amara Junior", code: "EVT-4566", type: "Regular", status: "Confirmed", gate: "Gate 1" },
        { eventId: 1, time: "11:30AM", name: "Ezra Johnson", code: "EVT-4565", type: "VIP", status: "Confirmed", gate: "Gate 1" },
        { eventId: 1, time: "11:18AM", name: "Ola Pelumi", code: "EVT-4561", type: "Regular", status: "Duplicate", gate: "Gate 1" },
        { eventId: 1, time: "11:08AM", name: "Micheal Friday", code: "EVT-4563", type: "VIP", status: "Confirmed", gate: "Gate 1" },
        { eventId: 1, time: "10:58AM", name: "Eniola Thomas", code: "EVT-4562", type: "Regular", status: "Confirmed", gate: "Gate 1" },
        { eventId: 1, time: "10:48AM", name: "David Idowu", code: "AVT-3301", type: "Regular", status: "Declined", gate: "Gate 1" },
        { eventId: 1, time: "10:30AM", name: "Ola Pelumi", code: "EVT-4561", type: "Regular", status: "Confirmed", gate: "Gate 1" },
        { eventId: 1, time: "10:18AM", name: "Nancy Clifford", code: "EVT-4559", type: "VVIP", status: "Confirmed", gate: "Gate 1" }
    ]
};


var API_ORIGIN = "https://qr-attendance-backend-zn67.onrender.com";
var API_PREFIX = "/api";

function apiUrl(path) {
    var endpoint = String(path || "").replace(/^\/+/, "");
    return API_ORIGIN + API_PREFIX + "/" + endpoint;
}

async function apiRequest(path, options) {
    options = options || {};
    var headers = new Headers(options.headers || {});
    var token = options.token || localStorage.getItem("authToken");
    if (token) headers.set("Authorization", "Bearer " + token);
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    var response;
    try {
        response = await fetch(apiUrl(path), {
            method: options.method || "GET",
            headers: headers,
            body: options.body instanceof FormData ? options.body :
                (options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body)
        });
    } catch (error) {
        throw new Error("Could not connect to the backend. If it has been inactive, wait 30–60 seconds and try again.");
    }
    var data = {};
    try { data = await response.json(); } catch (error) {}
    if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed (" + response.status + ").");
    }
    return data;
}

function saveAuthSession(result) {
    if (result && result.token) localStorage.setItem("authToken", result.token);
    if (result && result.user) {
        localStorage.setItem("authUser", JSON.stringify(result.user));
        if (result.user.id) localStorage.setItem("authUserId", result.user.id);
        if (result.user.role) localStorage.setItem("authRole", result.user.role);
        if (result.user.name) localStorage.setItem("authName", result.user.name);
    }
}

function clearAuthSession() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authUserId");
    localStorage.removeItem("authRole");
    localStorage.removeItem("authName");
    localStorage.removeItem("organizerLoggedIn");
    localStorage.removeItem("staffLoggedIn");
}


function mapApiStaffEvent(ev) {
    var userId = localStorage.getItem("authUserId");
    var assigned = Array.isArray(ev.staff) && ev.staff.some(function (id) {
        return String(id && (id._id || id.id) || id) === String(userId);
    });
    var dateObj = new Date(ev.date || "");
    var start = dateObj.getTime();
    var timeMatch = String(ev.startAt || "").match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!Number.isNaN(start) && timeMatch) {
        var hours = Number(timeMatch[1]) % 12;
        if ((timeMatch[3] || "").toUpperCase() === "PM") hours += 12;
        dateObj.setHours(hours, Number(timeMatch[2] || 0), 0, 0);
        start = dateObj.getTime();
    }
    if (Number.isNaN(start)) start = Date.now();
    return {
        id: ev._id || ev.id,
        name: ev.name || "Untitled event",
        image: ev.image || "",
        shortLocation: ev.venue || "",
        location: ev.venue || "",
        date: ev.date || "",
        startsAt: start,
        endsAt: start + 12 * 60 * 60 * 1000,
        guests: 0,
        status: assigned ? "accepted" : "invited",
        gate: "Main Gate",
        staffAssigned: assigned
    };
}
async function fetchStaffEvents() {
    var result = await apiRequest("/events");
    var items = Array.isArray(result) ? result : (result.event || result.events || result.data || []);
    backend.events = items.map(mapApiStaffEvent).filter(function (event) { return event.staffAssigned; });
    return backend.events;
}
