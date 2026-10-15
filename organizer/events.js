async function renderEventsFromBackend() {
    try {
        var events = await fetchApiEvents();
        var cards = "";
        var rows = "";
        for (var i = 0; i < events.length; i++) {
            cards += heroCardHtml(events[i]);
            rows += eventRowHtml(events[i]);
        }
        var mobile = document.getElementById("mEventList");
        var desktop = document.getElementById("dEventList");
        if (mobile) mobile.innerHTML = cards || '<p class="muted">No events have been created yet.</p>';
        if (desktop) desktop.innerHTML = rows || '<p class="muted">No events have been created yet.</p>';
    } catch (error) {
        var mobile = document.getElementById("mEventList");
        var desktop = document.getElementById("dEventList");
        if (mobile) mobile.textContent = error.message;
        if (desktop) desktop.textContent = error.message;
    }
}
renderEventsFromBackend();
