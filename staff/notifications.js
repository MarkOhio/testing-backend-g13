function acceptInvite(id) {
    addToList("staffAccepted", id);
    showToast("Event accepted. It is now on your dashboard.");
    render();
}

function rejectInvite(id) {
    addToList("staffRemoved", id);
    showToast("Invitation rejected.");
    render();
}

function render() {
    var invites = getInvitations();
    var html = "";
    for (var i = 0; i < invites.length; i++) {
        var ev = invites[i];
        var buttons = '<button class="btn btn-green" type="button" onclick="acceptInvite(' + ev.id + ')">Accept</button>';
        buttons += '<button class="btn btn-red" type="button" onclick="rejectInvite(' + ev.id + ')">Reject</button>';
        html += heroCardHtml(ev, buttons);
    }
    if (html == "") {
        html = '<div class="empty-box" style="grid-column:1 / -1">No new invitations.</div>';
    }
    document.getElementById("invites").innerHTML = html;
}

render();
