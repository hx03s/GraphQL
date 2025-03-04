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

function displayAuditRatio(userData) {
    const auditRatio = Math.round((parseFloat(userData.auditRatio) || 0) * 10) / 10;
    const totalUp = Math.round((parseFloat(userData.totalUp) / 1000000) * 100) / 100;
    const totalDown = Math.round(parseFloat(userData.totalDown) / 1000);

    // Update text values
    const doneElement = document.getElementById('audits-done');
    const receivedElement = document.getElementById('audits-received');
    const ratioElement = document.getElementById('audit-ratio-value');

    if (doneElement) doneElement.textContent = `${totalUp.toFixed(2)}`;
    if (receivedElement) receivedElement.textContent = `${totalDown}`;
    if (ratioElement) ratioElement.textContent = `${auditRatio.toFixed(1)}`;

    // Calculate and update progress bars
    const maxValue = Math.max(totalUp * 1000000, totalDown * 1000);
    const doneWidth = (totalUp * 1000000 / maxValue) * 100;
    const receivedWidth = (totalDown * 1000 / maxValue) * 100;

    const doneBar = document.querySelector('#audits-done-bar');
    const receivedBar = document.querySelector('#audits-received-bar');

    if (doneBar) doneBar.style.width = `${doneWidth}%`;
    if (receivedBar) receivedBar.style.width = `${receivedWidth}%`;
}

window.initAuditStats = getAuditData;

// Make the initialization function available globally
window.initAuditStats = getAuditData;