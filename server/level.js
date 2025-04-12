async function fetchLevelData() {
    const query = `
        query {
            transaction_aggregate(
                where: {
                    type: {_eq: "level"}
                }
            ) {
                aggregate {
                    max {
                        amount
                    }
                }
            }
        }
    `;

    try {
        const data = await window.fetchGraphQL(query);
        console.log('Raw level data:', data);
        
        if (data?.data?.transaction_aggregate?.aggregate?.max?.amount) {
            const level = Math.round(data.data.transaction_aggregate.aggregate.max.amount);
            console.log('Calculated level:', level);
            displayLevel(level);
        } else {
            console.error('No level data found');
            displayLevel(0);
        }
    } catch (error) {
        console.error('Error fetching level data:', error);
        displayLevel(0);
    }
}

function displayLevel(level) {
    const circle = document.querySelector('.level-progress');
    const levelText = document.querySelector('.level-text');
    
    // Calculate the circle's circumference
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    
    // Set the circle's stroke-dasharray and stroke-dashoffset
    circle.style.strokeDasharray = circumference;
    
    // Calculate progress (using max level of 50)
    const maxLevel = 50;
    const progress = (level / maxLevel) * circumference;
    circle.style.strokeDashoffset = circumference - progress;
    
    // Update the level text
    levelText.textContent = level;
    
    // Log for debugging
    console.log(`Current Level: ${level}, Max Level: ${maxLevel}, Progress: ${(level/maxLevel)*100}%`);
}

// Initialize level display
window.initLevelData = fetchLevelData;
