async function getSkillsData() {
    // First, let's query to see all skill types
    const skillTypesQuery = `
    query {
        user {
            transactions(where: {
                type: {
                    _like: "skill_%"
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
        const data = await fetchGraphQL(skillTypesQuery);
        console.log('All skill types found:', [...new Set(data?.data?.user[0]?.transactions?.map(t => t.type) || [])]);
        
        // Now query for specific skills including possible variations
        const query = `
        query {
            user {
                transactions(where: {
                    type: {
                        _in: [
                            "skill_prog", "skill_go", 
                            "skill_frontend", "skill_front", "skill_front-end",
                            "skill_js", "skill_javascript",
                            "skill_html", "skill_html5",
                            "skill_backend", "skill_back", "skill_back-end"
                        ]
                    }
                }) {
                    type
                    amount
                    createdAt
                }
            }
        }
        `;

        const skillData = await fetchGraphQL(query);
        console.log('Raw skills data:', skillData);
        
        if (skillData?.data?.user && skillData.data.user.length > 0) {
            const transactions = skillData.data.user[0].transactions;
            console.log('Found transactions:', transactions);
            displayTopSkills(transactions);
        } else {
            console.log('No user transactions found in response:', skillData);
        }
    } catch (error) {
        console.error('Error fetching skills data:', error);
    }
}

function displayTopSkills(transactions) {
    console.log('Processing transactions:', transactions);
    
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) return;
    
    skillsContainer.innerHTML = '<canvas id="skillsRadar"></canvas>';
    
    // Define skill categories with proper names and initial values
    const skillCategories = {
        skill_prog: { name: 'Programming', xp: 0 },
        skill_go: { name: 'Go', xp: 0 },
        skill_frontend: { name: 'Front-End', xp: 0, aliases: ['skill_front', 'skill_front-end'] },
        skill_js: { name: 'JavaScript', xp: 0, aliases: ['skill_javascript'] },
        skill_html: { name: 'HTML', xp: 0, aliases: ['skill_html5'] },
        skill_backend: { name: 'Back-End', xp: 0, aliases: ['skill_back', 'skill_back-end'] }
    };

    // Calculate total XP for each skill category
    transactions.forEach(transaction => {
        console.log('Processing transaction:', transaction.type, transaction.amount);
        
        // Check direct match
        if (skillCategories[transaction.type]) {
            skillCategories[transaction.type].xp += transaction.amount || 1;
            return;
        }
        
        // Check aliases
        for (const [mainType, data] of Object.entries(skillCategories)) {
            if (data.aliases && data.aliases.includes(transaction.type)) {
                data.xp += transaction.amount || 1;
                console.log(`Matched alias ${transaction.type} to ${mainType}`);
                break;
            }
        }
    });

    // Log the XP totals for each skill
    Object.entries(skillCategories).forEach(([type, data]) => {
        console.log(`${type}: ${data.xp} XP`);
    });

    // Find the maximum XP value for normalization
    const maxXP = Math.max(...Object.values(skillCategories).map(skill => skill.xp));
    console.log('Max XP found:', maxXP);

    // Normalize values to 0-100 scale
    Object.values(skillCategories).forEach(skill => {
        skill.normalizedValue = maxXP > 0 ? (skill.xp / maxXP) * 100 : 0;
    });

    const ctx = document.getElementById('skillsRadar').getContext('2d');
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.values(skillCategories).map(skill => skill.name),
            datasets: [{
                label: 'Skill Progress',
                data: Object.values(skillCategories).map(skill => skill.normalizedValue),
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