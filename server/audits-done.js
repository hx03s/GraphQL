async function getAuditStatus() {
    const query = `
    query {
        user {
            audits: audits_aggregate(
                where: {
                    grade: {_is_null: false},
                    auditorId: {_is_null: false}
                },
                order_by: {createdAt: desc}
            ) {
                nodes {
                    id
                    grade
                    createdAt
                    auditorId
                    group {
                        captainLogin
                        object {
                            name
                        }
                    }
                }
            }
            todoAudits: audits_aggregate(
                where: {
                    grade: {_is_null: true}
                },
                order_by: {createdAt: desc}
            ) {
                nodes {
                    id
                    createdAt
                    group {
                        captainLogin
                        object {
                            name
                        }
                    }
                }
            }
        }
    }
    `;

    try {
        const data = await fetchGraphQL(query);
        console.log('=== Raw Audit Data ===');
        console.log(JSON.stringify(data, null, 2));
        
        if (data?.data?.user && data.data.user.length > 0) {
            const user = data.data.user[0];
            const completedAudits = user.audits?.nodes || [];
            const todoAudits = user.todoAudits?.nodes || [];
            
            console.log('\n=== Completed Audits ===');
            completedAudits.forEach(audit => {
                console.log(`Project: ${audit.group?.object?.name}—${audit.group?.captainLogin}`);
                console.log(`Grade: ${audit.grade}`);
                console.log(`Created: ${audit.createdAt}`);
                console.log('---');
            });

            console.log('\n=== Todo Audits ===');
            todoAudits.forEach(audit => {
                console.log(`Project: ${audit.group?.object?.name}—${audit.group?.captainLogin}`);
                console.log(`Created: ${audit.createdAt}`);
                console.log('---');
            });

            // Create the audits container
            const auditsContainer = document.getElementById('audits-status');
            if (auditsContainer) {
                auditsContainer.innerHTML = `
                    <h3>Your Audits</h3>
                    <p>Here you can find back all your audits : the ones you have to make and the ones you've already made for other students projects.</p>
                    <div class="audit-status-container">
                        <div class="audit-status-section">
                            <h4>Passed Audits</h4>
                            <div id="passed-audits" class="audit-list"></div>
                        </div>
                        <div class="audit-status-section">
                            <h4>Failed Audits</h4>
                            <div id="failed-audits" class="audit-list"></div>
                        </div>
                        <div class="audit-status-section">
                            <h4>Expired Audits</h4>
                            <div id="expired-audits" class="audit-list"></div>
                        </div>
                        <div class="audit-status-section">
                            <h4>To Do Audits</h4>
                            <div id="todo-audits" class="audit-list"></div>
                        </div>
                    </div>
                `;

                // Organize audits by status
                const auditStatus = {
                    passed: [],
                    failed: [],
                    expired: [],
                    todo: []
                };

                // Process completed audits
                completedAudits.forEach(audit => {
                    if (audit.group?.object?.name) {
                        const projectName = `${audit.group.object.name}—${audit.group.captainLogin}`;
                        console.log(`Grade for ${projectName}: ${audit.grade}`);
                
                        if (audit.grade >= 1) {
                            auditStatus.passed.push(projectName);
                        } else if (audit.grade < 1) {
                            auditStatus.failed.push(projectName);
                        }
                    }
                });

                // Process todo audits
                todoAudits.forEach(audit => {
                    if (audit.group?.object?.name) {
                        const projectName = `${audit.group.object.name}—${audit.group.captainLogin}`;
                        const now = new Date();
                        const createdAt = new Date(audit.createdAt);
                        const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
                
                        console.log(`Processing: ${projectName}`);
                        console.log(`Created At: ${createdAt}`);
                        console.log(`Days since creation: ${daysSinceCreation}`);
                
                        if (daysSinceCreation > 7) {
                            console.log(`Adding to EXPIRED: ${projectName}`);
                            auditStatus.expired.push(projectName);
                        } else {
                            console.log(`Adding to TODO: ${projectName}`);
                            auditStatus.todo.push(projectName);
                        }
                    }
                });

                console.log('\n=== Final Audit Status ===');
                console.log('Passed:', auditStatus.passed);
                console.log('Failed:', auditStatus.failed);
                console.log('Expired:', auditStatus.expired);
                console.log('Todo:', auditStatus.todo);

                // Update each list
                updateAuditList('passed-audits', auditStatus.passed, 'pass');
                updateAuditList('failed-audits', auditStatus.failed, 'fail');
                updateAuditList('expired-audits', auditStatus.expired, 'expired');
                updateAuditList('todo-audits', auditStatus.todo, 'todo');
            }
        } else {
            console.error('No user data found in response');
        }
    } catch (error) {
        console.error('Error fetching audit status:', error);
    }
}

function updateAuditList(elementId, projects, status) {
    const list = document.getElementById(elementId);
    if (!list) return;

    if (!projects || projects.length === 0) {
        list.innerHTML = '<div class="audit-item">No audits in this category</div>';
        return;
    }

    list.innerHTML = projects.map(projectName => `
        <div class="audit-item">
            <p><strong>${projectName}</strong></p>
            <p class="${status}">${status.toUpperCase()}</p>
        </div>
    `).join('');
}

// Make the function available globally with the correct name
window.initGetAuditStatus = getAuditStatus;