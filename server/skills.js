async function getSkillsData() {
    // Query specifically for each skill category
    const query = `
    query {
        prog: transaction_aggregate(
            where: {type: {_eq: "skill_prog"}}
        ) {
            aggregate { max { amount } }
        }
        backend: transaction_aggregate(
            where: {type: {_eq: "skill_back-end"}}
        ) {
            aggregate { max { amount } }
        }
        frontend: transaction_aggregate(
            where: {type: {_eq: "skill_front-end"}}
        ) {
            aggregate { max { amount } }
        }
        go: transaction_aggregate(
            where: {type: {_eq: "skill_go"}}
        ) {
            aggregate { max { amount } }
        }
        js: transaction_aggregate(
            where: {type: {_eq: "skill_js"}}
        ) {
            aggregate { max { amount } }
        }
        html: transaction_aggregate(
            where: {type: {_eq: "skill_html"}}
        ) {
            aggregate { max { amount } }
        }
    }`;

    try {
        const data = await fetchGraphQL(query);
        console.log('Skills data:', data);
        
        if (data?.data) {
            displayTopSkills(data.data);
        } else {
            console.log('No skills data found in response');
        }
    } catch (error) {
        console.error('Error fetching skills data:', error);
    }
}

function calculateSkillPercentage(xp) {
    // More balanced calculation to match website percentages
    // Using a higher divisor to reduce sensitivity
    const percentage = (xp / 150) * 10;  // Reduced sensitivity
    
    // Lower base percentage
    const basePercentage = 5;
    const adjustedPercentage = basePercentage + percentage;
    
    // Cap at 100% and ensure we have at least 1 decimal place
    return Math.min(Math.round(adjustedPercentage * 10) / 10, 100);
}

function displayTopSkills(skillsData) {
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) return;
    
    // Create SVG element
    skillsContainer.innerHTML = `
        <svg id="skillsRadar" viewBox="0 0 400 400" width="100%" height="100%">
            <g transform="translate(200, 200)">
                <g class="grid-lines"></g>
                <g class="skills-plot"></g>
                <g class="labels"></g>
            </g>
        </svg>`;

    // Define skill categories with their display names
    const skillCategories = [
        { name: 'Programming', key: 'prog' },
        { name: 'Back-End', key: 'backend' },
        { name: 'Front-End', key: 'frontend' },
        { name: 'Go', key: 'go' },
        { name: 'JavaScript', key: 'js' },
        { name: 'HTML', key: 'html' }
    ];

    // Get percentages from the data
    skillCategories.forEach(skill => {
        const value = skillsData[skill.key]?.aggregate?.max?.amount || 0;
        skill.percentage = Math.max(Math.round(value), 5);
        console.log(`${skill.name}: ${skill.percentage}%`);
    });

    const svg = document.getElementById('skillsRadar');
    const gridGroup = svg.querySelector('.grid-lines');
    const skillsGroup = svg.querySelector('.skills-plot');
    const labelsGroup = svg.querySelector('.labels');
    
    // Draw background circles
    [20, 40, 60, 80, 100].forEach(value => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '0');
        circle.setAttribute('r', value * 1.5);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
        gridGroup.appendChild(circle);
    });

    // Draw skills polygon
    const points = skillCategories.map((skill, i) => {
        const angle = (i * 2 * Math.PI / skillCategories.length) - Math.PI/2;
        const radius = skill.percentage * 1.5;
        return `${radius * Math.cos(angle)},${radius * Math.sin(angle)}`;
    }).join(' ');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', 'rgba(14, 255, 255, 0.2)');
    polygon.setAttribute('stroke', '#0ef');
    polygon.setAttribute('stroke-width', '2');
    skillsGroup.appendChild(polygon);

    // Add labels
    skillCategories.forEach((skill, i) => {
        const angle = (i * 2 * Math.PI / skillCategories.length) - Math.PI/2;
        const radius = 170;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.textContent = `${skill.name} (${skill.percentage}%)`;
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-size', '12px');
        labelsGroup.appendChild(text);
    });

    // Add tooltips
    skillsGroup.addEventListener('mousemove', (event) => {
        const tooltip = document.getElementById('skills-tooltip') || createTooltip();
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
        
        // Find closest skill point
        const rect = svg.getBoundingClientRect();
        const mouseX = event.clientX - rect.left - 200;
        const mouseY = event.clientY - rect.top - 200;
        
        const closest = findClosestSkill(mouseX, mouseY, skillCategories);
        if (closest) {
            tooltip.textContent = `${closest.name}: ${closest.percentage}%`;
        }
    });

    skillsGroup.addEventListener('mouseleave', () => {
        const tooltip = document.getElementById('skills-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    });
}

function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'skills-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.pointerEvents = 'none';
    document.body.appendChild(tooltip);
    return tooltip;
}

function findClosestSkill(mouseX, mouseY, skills) {
    // Simple distance calculation to find closest skill point
    let closest = null;
    let minDistance = Infinity;
    
    skills.forEach((skill, i) => {
        const angle = (i * 2 * Math.PI / skills.length) - Math.PI/2;
        const radius = skill.percentage * 1.5;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            closest = skill;
        }
    });
    
    return closest;
}

window.initSkillsData = getSkillsData;