// Archive viewer functionality
let currentGrade = '7th-grade';
let allLessons = {};

// Load lessons from localStorage
function loadLessons() {
    try {
        const data = localStorage.getItem('lessonPlansDatabase');
        if (data) {
            allLessons = JSON.parse(data);
        } else {
            allLessons = { '7th-grade': [], '8th-grade': [], '9th-grade': [] };
        }
        renderLessons();
    } catch (error) {
        console.error('Error loading lessons:', error);
        document.getElementById('lessonsContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to Load Lessons</h3>
                <p>There was an error loading your saved lessons.</p>
                <button class="btn btn-primary" onclick="loadLessons()">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }
}

// Render lessons for current grade
function renderLessons() {
    const container = document.getElementById('lessonsContainer');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const lessons = allLessons[currentGrade] || [];

    // Filter lessons based on search
    const filteredLessons = lessons.filter(lesson => {
        if (!searchTerm) return true;
        return lesson.lessonTitle.toLowerCase().includes(searchTerm) ||
               lesson.teacherName.toLowerCase().includes(searchTerm) ||
               lesson.classes.some(cls => cls.toLowerCase().includes(searchTerm));
    });

    // Sort by date (newest first)
    filteredLessons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filteredLessons.length === 0) {
        if (searchTerm) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Results Found</h3>
                    <p>No lessons match your search criteria.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('searchInput').value=''; renderLessons();">
                        <i class="fas fa-times"></i> Clear Search
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No Lessons Yet</h3>
                    <p>Create and save your first lesson plan to see it here.</p>
                </div>
            `;
        }
        return;
    }

    const lessonsHtml = filteredLessons.map(lesson => `
        <div class="lesson-card">
            <div class="lesson-header">
                <div class="lesson-title">
                    <i class="fas fa-graduation-cap"></i>
                    ${lesson.lessonTitle}
                </div>
                <div class="lesson-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(lesson.date)}</span>
                    <span><i class="fas fa-user"></i> ${lesson.teacherName}</span>
                </div>
            </div>
            <div class="lesson-content">
                <div class="lesson-info">
                    <div class="lesson-info-item">
                        <span class="lesson-info-label">Classes:</span>
                        <span class="lesson-info-value">${lesson.classes.join(', ')}</span>
                    </div>
                    <div class="lesson-info-item">
                        <span class="lesson-info-label">Unit:</span>
                        <span class="lesson-info-value">${lesson.unit}</span>
                    </div>
                    <div class="lesson-info-item">
                        <span class="lesson-info-label">Duration:</span>
                        <span class="lesson-info-value">${lesson.duration}</span>
                    </div>
                    <div class="lesson-info-item">
                        <span class="lesson-info-label">Model:</span>
                        <span class="lesson-info-value">${lesson.model}</span>
                    </div>
                </div>
                <div class="lesson-actions">
                    <button class="btn btn-primary" onclick="viewLesson('${lesson.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-danger" onclick="deleteLesson('${lesson.id}', '${lesson.lessonTitle}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="lesson-grid">${lessonsHtml}</div>`;
}

// View lesson by opening stored HTML content
function viewLesson(lessonId) {
    try {
        const data = localStorage.getItem('lessonPlansDatabase');
        if (!data) {
            showNotification('No lessons database found', 'error');
            return;
        }

        const db = JSON.parse(data);

        // Find the lesson
        let lesson = null;
        for (const grade in db) {
            lesson = db[grade].find(l => l.id === lessonId);
            if (lesson) break;
        }

        if (lesson && lesson.htmlContent) {
            // Open in new window
            const newWin = window.open('', '_blank');
            if (newWin) {
                newWin.document.open();
                newWin.document.write(lesson.htmlContent);
                newWin.document.close();
            } else {
                showNotification('Popup blocked. Please allow popups for this site.', 'error');
            }
        } else {
            showNotification('Lesson content not found', 'error');
        }
    } catch (error) {
        console.error('Error viewing lesson:', error);
        showNotification('Failed to open lesson', 'error');
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Delete lesson
function deleteLesson(lessonId, lessonTitle) {
    if (!confirm(`Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`)) {
        return;
    }

    try {
        // Get current database
        const data = localStorage.getItem('lessonPlansDatabase');
        if (!data) {
            showNotification('No lessons database found', 'error');
            return;
        }

        const db = JSON.parse(data);

        // Find and remove the lesson
        let lessonFound = false;
        for (const grade in db) {
            const lessonIndex = db[grade].findIndex(l => l.id === lessonId);
            if (lessonIndex !== -1) {
                db[grade].splice(lessonIndex, 1);
                lessonFound = true;
                break;
            }
        }

        if (lessonFound) {
            // Save updated database
            localStorage.setItem('lessonPlansDatabase', JSON.stringify(db));
            // Reload lessons
            loadLessons();
            showNotification('Lesson deleted successfully', 'success');
        } else {
            showNotification('Lesson not found', 'error');
        }
    } catch (error) {
        console.error('Error deleting lesson:', error);
        showNotification('Failed to delete lesson', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        max-width: 300px;
    `;

    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    }

    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}" style="margin-right: 10px;"></i>
        ${message}
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification.fade-out {
            animation: fadeOut 0.3s ease-out forwards;
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100%); }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update current grade
            currentGrade = this.dataset.grade;

            // Load lessons for new grade
            loadLessons();
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        renderLessons();
    });

    // Load initial lessons
    loadLessons();
});

console.log('Archive viewer loaded successfully');