async function getAuditData() {
    const query = `
        query {
            user {
                auditRatio
                totalUp
                totalDown
            }
        }
    `;

    try {
        const data = await fetchGraphQL(query);
        if (data?.data?.user && data.data.user.length > 0) {
            displayAuditRatio(data.data.user[0]);
        }
    } catch (error) {
        console.error('Error fetching audit data:', error);
    }
}

function formatBytes(bytes) {
    if (bytes >= 1000000) { // MB
        return `${(bytes / 1000000).toFixed(2)} MB`;
    } else { // KB
        return `${Math.round(bytes / 1000)} KB`;
    }
}

function displayAuditRatio(userData) {
    const auditRatio = Math.round((parseFloat(userData.auditRatio) || 0) * 10) / 10;
    const totalUpBytes = parseFloat(userData.totalUp);
    const totalDownBytes = parseFloat(userData.totalDown);

    // Format the values
    const totalUp = formatBytes(totalUpBytes);
    const totalDown = formatBytes(totalDownBytes);

    // Update text values
    const doneElement = document.getElementById('audits-done');
    const receivedElement = document.getElementById('audits-received');
    const ratioElement = document.getElementById('audit-ratio-value');

    if (doneElement) doneElement.textContent = totalUp;
    if (receivedElement) receivedElement.textContent = totalDown;
    if (ratioElement) ratioElement.textContent = `${auditRatio.toFixed(1)}`;

    // Calculate and update progress bars
    const maxValue = Math.max(totalUpBytes, totalDownBytes);
    const doneWidth = (totalUpBytes / maxValue) * 100;
    const receivedWidth = (totalDownBytes / maxValue) * 100;

    const doneBar = document.querySelector('#audits-done-bar');
    const receivedBar = document.querySelector('#audits-received-bar');

    if (doneBar) doneBar.style.width = `${doneWidth}%`;
    if (receivedBar) receivedBar.style.width = `${receivedWidth}%`;
}

// Make the initialization function available globally
window.initAuditStats = getAuditData;