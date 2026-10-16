function render() {
    var container = document.getElementById("invites");
    if (container) {
        container.innerHTML = '<div class="empty-box" style="grid-column:1 / -1">Persistent staff invitations are not supported by the current backend. Events assigned to your account appear on My Events.</div>';
    }
}
render();
