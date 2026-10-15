const API_ORIGIN = "https://qr-attendance-backend-zn67.onrender.com";
const API_PREFIX = "/api";

function attendeeApiUrl(path) {
    const endpoint = String(path || "").replace(/^\/+/, "");
    return API_ORIGIN + API_PREFIX + "/" + endpoint;
}

async function attendeeRequest(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
    let response;
    try {
        response = await fetch(attendeeApiUrl(path), {
            method: options.method || "GET",
            headers,
            body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
        });
    } catch (error) {
        throw new Error("Could not connect to the event service. Please try again in a moment.");
    }
    let result = {};
    try { result = await response.json(); } catch (error) {}
    if (!response.ok) throw new Error(result.message || result.error || "Request failed (" + response.status + ").");
    return result;
}

function mapEvent(event) {
    const dateValue = event.date || "";
    const parsed = new Date(dateValue);
    const validDate = !Number.isNaN(parsed.getTime());
    const day = validDate ? String(parsed.getDate()) : "";
    const month = validDate ? parsed.toLocaleString("en-US", { month: "short" }).toUpperCase() : "";
    const time = event.startAt || "";
    return {
        id: event._id || event.id,
        title: event.name || event.title || "Untitled event",
        date: dateValue,
        time: time,
        day: day,
        month: month,
        location: event.venue || event.location || "",
        address: event.venue || event.address || "",
        latitude: Number(event.latitude || 6.4315),
        longitude: Number(event.longitude || 3.4144),
        image: event.image || "assets/event-tech.jpg",
        description: event.description || ""
    };
}

const mockApi = {
    events: [],
    getEvents: async function () {
        const result = await attendeeRequest("/events");
        const items = Array.isArray(result) ? result : (result.event || result.events || result.data || []);
        this.events = items.map(mapEvent);
        return this.events;
    },
    getEvent: async function (id) {
        if (!this.events.length) await this.getEvents();
        return this.events.find(event => String(event.id) === String(id));
    },
    saveAttendee: async function (details) {
        if (!details.eventId || !/^[a-f\d]{24}$/i.test(String(details.eventId))) {
            throw new Error("This event is not connected to a backend event yet. Please choose an event loaded from the backend.");
        }
        const result = await attendeeRequest("/attendees/register", {
            method: "POST",
            body: {
                eventId: details.eventId,
                firstName: details.firstName,
                lastName: details.lastName,
                email: details.email,
                phone: details.phone,
                ticket_type: details.ticketType
            }
        });
        const data = result.data || {};
        const saved = {
            ...details,
            attendeeId: data.attendee && data.attendee.id,
            eventId: data.event && data.event.id || details.eventId,
            eventTitle: data.event && data.event.name || details.eventTitle,
            code: data.ticket && data.ticket.code || "",
            status: "Valid"
        };
        localStorage.setItem("attendeeDetails", JSON.stringify(saved));
        localStorage.setItem("pendingTicket", "true");
        return saved;
    },
    verifyTicket: async function (code) {
        const attendee = JSON.parse(localStorage.getItem("attendeeDetails") || "null");
        if (!attendee || !attendee.eventId) return { valid: false, message: "Register for an event first." };
        try {
            const result = await attendeeRequest("/tickets/verify-code", {
                method: "POST",
                body: { code: code.trim(), eventId: attendee.eventId }
            });
            localStorage.removeItem("pendingTicket");
            const data = result.data || {};
            const updated = {
                ...attendee,
                attendeeId: data.attendee && data.attendee.id || attendee.attendeeId,
                eventId: data.event && data.event.id || attendee.eventId,
                eventTitle: data.event && data.event.name || attendee.eventTitle,
                eventAddress: data.event && data.event.venue || attendee.eventAddress,
                ticketId: data.ticketId || attendee.ticketId,
                verified: true
            };
            localStorage.setItem("attendeeDetails", JSON.stringify(updated));
            return { valid: true, attendee: updated, message: result.message };
        } catch (error) {
            return { valid: false, message: error.message };
        }
    },
    resendCode: async function () {
        return { sent: false, message: "The backend does not provide an attendee ticket-code resend endpoint. Please check your email or register with support." };
    }
};
