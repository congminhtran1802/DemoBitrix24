let highlightedId = null;

function highlightRow(element) {
    if (element.classList.contains('highlight')) {
        element.classList.remove('highlight');
        highlightedId = null;
    } else {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => row.classList.remove('highlight'));
        element.classList.add('highlight');
        highlightedId = element.getAttribute('user-id');
    }
}

function getHighlightedId() {
    console.log('highlightedId:', highlightedId);
    return highlightedId;
}
