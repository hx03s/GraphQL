// Check if user is authenticated
const token = localStorage.getItem('jwt-token');
console.log('Initial token check:', token);

if (!token) {
    console.log('No token found, redirecting to login');
    window.location.href = './index.html';
}

async function fetchGraphQL(query) {
    const token = localStorage.getItem('jwt-token');

    const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            query: query
        })
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
    }

    return response.json();
}

// Fetch user data
async function getUserData() {
    const query = `
        query {
            user {
                id
                login
                firstName
                lastName
            }
        }
    `;

    try {
        const data = await fetchGraphQL(query);
        console.log('Raw user data:', data);
            
        if (data?.data?.user && data.data.user.length > 0) {
            const user = data.data.user[0];
            const fullName = `${user.firstName} ${user.lastName}`.trim();
            displayUserInfo({ ...user, name: fullName });
        } else {
            console.error('Invalid data structure:', data);
            throw new Error('Invalid data structure received');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function displayUserInfo(user) {
    const userInfo = document.getElementById('user-info');
    userInfo.innerHTML = `
        <h2>Welcome, ${user.firstName} ${user.lastName}</h2>
    `;
}

function logout() {
    localStorage.removeItem('jwt-token');
    window.location.href = './index.html';
}

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, initializing...');
    getUserData();
    window.initAuditStats();
    window.initSkillsData();
    window.initGetAuditStatus();
    window.initLevelData();
});

document.getElementById('logout-btn').addEventListener('click', logout);