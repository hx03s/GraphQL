async function getSkillsData() {
    // First, let's query to see all skill types
    const query = `
    query {
        user {
            transactions(where: {
                type: {
                    _like: "skill%"
                }
            }) {
                type
                amount
                createdAt
            }
        }
    }
    `;

    try {
        const data = await fetchGraphQL(query);
        // Log all found skill types to debug
        const allTypes = [...new Set(data?.data?.user[0]?.transactions?.map(t => t.type) || [])];
        console.log('All available skill types:', allTypes);
        
        if (data?.data?.user && data.data.user.length > 0) {
            const transactions = data.data.user[0].transactions;
            console.log('Found transactions:', transactions);
            displayTopSkills(transactions);
        } else {
            console.log('No user transactions found in response:', data);
        }
    } catch (error) {
        console.error('Error fetching skills data:', error);
    }
}

function calculateSkillPercentage(xp) {
    // Define maximum XP threshold (100%)
    const MAX_XP = 1000;
    return Math.min((xp / MAX_XP) * 100, 100);
}

function displayTopSkills(transactions) {
    console.log('Processing transactions:', transactions);
    
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) return;
    
    skillsContainer.innerHTML = '<canvas id="skillsRadar"></canvas>';
    
    // Define skill categories with proper names and initial values
    const skillCategories = {
        prog: { name: 'Programming', xp: 0, types: ['skill_prog', 'skill_algo'] },
        go: { name: 'Go', xp: 0, types: ['skill_go'] },
        frontend: { name: 'Front-End', xp: 0, types: ['skill_frontend', 'skill_front', 'skill_front-end'] },
        js: { name: 'JavaScript', xp: 0, types: ['skill_js', 'skill_javascript'] },
        html: { name: 'HTML', xp: 0, types: ['skill_html', 'skill_html5'] },
        backend: { name: 'Back-End', xp: 0, types: ['skill_backend', 'skill_back', 'skill_back-end'] }
    };

    // Calculate total XP for each skill category
    transactions.forEach(transaction => {
        for (const [category, data] of Object.entries(skillCategories)) {
            if (data.types.includes(transaction.type)) {
                data.xp += transaction.amount || 1;
                break;
            }
        }
    });

    // Calculate skill percentages based on fixed thresholds
    Object.values(skillCategories).forEach(skill => {
        skill.percentage = calculateSkillPercentage(skill.xp);
    });

    const ctx = document.getElementById('skillsRadar').getContext('2d');
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.values(skillCategories).map(skill => skill.name),
            datasets: [{
                label: 'Skill Progress',
                data: Object.values(skillCategories).map(skill => skill.percentage),
                backgroundColor: 'rgba(14, 255, 255, 0.2)',
                borderColor: '#0ef',
                borderWidth: 2,
                pointBackgroundColor: '#0ef',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0ef'
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    stepSize: 20,
                    angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    pointLabels: { 
                        color: '#fff',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        color: '#fff',
                        backdropColor: 'transparent',
                        font: {
                            size: 10
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: { 
                        color: '#fff',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const skillData = Object.values(skillCategories)[context.dataIndex];
                            return `${context.label}: ${Math.round(context.raw)}% (XP: ${skillData.xp})`;
                        }
                    }
                }
            }
        }
    });
}

window.initSkillsData = getSkillsData;