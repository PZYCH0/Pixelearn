// Main application object to hold all functionality
const TeacherRecordBook = (function() {
    // DOM Elements
    let contentArea;
    let addClassBtn;
    let saveClassBtn;
    let addClassModal;
    let studentModal;
    let bulkImportModal;
    let navLinks;
    
    // Application state
    let state = {
        currentView: 'dashboard',
        classes: JSON.parse(localStorage.getItem('teacherClasses')) || [],
        students: JSON.parse(localStorage.getItem('teacherStudents')) || {},
        lessons: JSON.parse(localStorage.getItem('teacherLessons')) || {},
        grades: JSON.parse(localStorage.getItem('teacherGrades')) || {},
        assignments: JSON.parse(localStorage.getItem('teacherAssignments')) || {},
        attendance: JSON.parse(localStorage.getItem('teacherAttendance')) || {},
        currentClassId: null,
        currentStudentId: null
    };
    
    // Initialize the application
    function init() {
        // Wait for the DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
            return;
        }
        initApp();
        
        function initApp() {
            // Get DOM elements
            contentArea = document.getElementById('content-area');
            addClassBtn = document.getElementById('add-new');
            saveClassBtn = document.getElementById('saveClass');
            
            // Initialize modals
            const classModalElement = document.getElementById('addClassModal');
            const studentModalElement = document.getElementById('studentModal');
            const bulkImportModalElement = document.getElementById('bulkImportModal');
            
            if (classModalElement) {
                addClassModal = new bootstrap.Modal(classModalElement);
            }
            
            if (studentModalElement) {
                studentModal = new bootstrap.Modal(studentModalElement);
            }
            
            if (bulkImportModalElement) {
                bulkImportModal = new bootstrap.Modal(bulkImportModalElement);
            }
            
            // Initialize students array for each class if it doesn't exist
            state.classes = state.classes.map(cls => ({
                ...cls,
                students: cls.students || []
            }));
            saveState();
            
            // Get navigation links after DOM is loaded
            navLinks = document.querySelectorAll('.nav-link');
            console.log('Navigation links found:', navLinks.length);
            
            // Set up event listeners
            setupEventListeners();
            
            // Initialize the app with dashboard
            setActiveView('dashboard');
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Navigation tabs - using event delegation for better performance
        document.addEventListener('click', function(e) {
            // Check if the clicked element or its parent is a nav link
            const navLink = e.target.closest('.nav-link');
            if (navLink && navLink.id) {
                e.preventDefault();
                const view = navLink.id.replace('-tab', '');
                setActiveView(view);
            }
        });
        
        // Add class form submission
        const classForm = document.getElementById('addClassForm');
        if (classForm) {
            classForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveClass();
            });
        }
        
        // Save button click
        const saveClassBtn = document.getElementById('saveClass');
        if (saveClassBtn) {
            saveClassBtn.addEventListener('click', function(e) {
                e.preventDefault();
                saveClass();
            });
        }
        
        // Add student button
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'add-student') {
                e.preventDefault();
                openStudentModal();
            }
        });
        
        // Bulk import button
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'bulk-import') {
                e.preventDefault();
                openBulkImportModal();
            }
        });
        
        // Save student button
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'saveStudent') {
                e.preventDefault();
                saveStudent();
            }
        });
    }
    
    // Set the active view and render it
    function setActiveView(view) {
        console.log('Setting active view to:', view);
        const validViews = ['dashboard', 'classes', 'students', 'lessons', 'grades', 'reports'];
        if (!validViews.includes(view)) {
            console.error('Invalid view:', view);
            return;
        }
        
        try {
            state.currentView = view;
            
            // Update active nav link
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.id === `${view}-tab`) {
                    link.classList.add('active');
                }
            });
            
            // Render the appropriate view
            switch(view) {
                case 'dashboard': renderDashboard(); break;
                case 'classes': renderClasses(); break;
                case 'students': renderStudents(); break;
                case 'lessons': renderLessons(); break;
                case 'grades': renderGrades(); break;
                case 'reports': renderReports(); break;
            }
        } catch (error) {
            console.error('Error in setActiveView:', error);
            // Try to recover by showing the dashboard
            if (view !== 'dashboard') {
                console.log('Attempting to recover by showing dashboard');
                setActiveView('dashboard');
            }
        }
    }

    function saveNewClass() {
        const gradeLevel = document.getElementById('gradeLevel').value;
        const className = document.getElementById('className').value.trim();
        const classDescription = document.getElementById('classDescription').value.trim();

        if (!gradeLevel || !className) {
            alert('Please fill in all required fields');
            return;
        }

        const newClass = {
            id: Date.now().toString(),
            grade: gradeLevel,
            name: className,
            description: classDescription,
            createdAt: new Date().toISOString()
        };

        state.classes.push(newClass);
        saveState();
        addClassModal.hide();
        renderClasses();
        resetClassForm();
    }

    function resetClassForm() {
        document.getElementById('addClassForm').reset();
    }

    // Save the application state to localStorage
    function saveState() {
        localStorage.setItem('teacherClasses', JSON.stringify(state.classes));
        localStorage.setItem('teacherStudents', JSON.stringify(state.students));
        localStorage.setItem('teacherLessons', JSON.stringify(state.lessons));
        localStorage.setItem('teacherGrades', JSON.stringify(state.grades));
        localStorage.setItem('teacherAssignments', JSON.stringify(state.assignments));

        // Initialize the app with dashboard
        setActiveView('dashboard');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Navigation tabs - using event delegation for better performance
    document.addEventListener('click', function(e) {
        // Check if the clicked element or its parent is a nav link
        const navLink = e.target.closest('.nav-link');
        if (navLink && navLink.id) {
            e.preventDefault();
            const view = navLink.id.replace('-tab', '');
            setActiveView(view);
        }
    });
    
    // Add class form submission
    const classForm = document.getElementById('addClassForm');
    if (classForm) {
        classForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveNewClass();
        });
    }
    
    // Save button click
    const saveClassBtn = document.getElementById('saveClass');
    if (saveClassBtn) {
        saveClassBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveNewClass();
        });
    }
    
    // Add student button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'add-student') {
            e.preventDefault();
            openStudentModal();
        }
    });
    
    // Bulk import button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'bulk-import') {
            e.preventDefault();
            openBulkImportModal();
        }
    });
    
    // Save student button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'saveStudent') {
            e.preventDefault();
            saveStudent();
        }
    });
}

// Set the active view and render it
function setActiveView(view) {
    console.log('Setting active view to:', view);
    const validViews = ['dashboard', 'classes', 'students', 'lessons', 'grades', 'reports'];
    if (!validViews.includes(view)) {
        console.error('Invalid view:', view);
        return;
    }
    
    try {
        state.currentView = view;
        
        // Update active nav link
        if (navLinks && navLinks.length > 0) {
            navLinks.forEach(link => {
                if (link) {
                    link.classList.remove('active');
                    if (link.id === `${view}-tab`) {
                        link.classList.add('active');
                    }
                }
            });
        }
        
        // Render the appropriate view
        const viewMap = {
            'dashboard': renderDashboard,
            'classes': renderClasses,
            'students': renderStudents,
            'lessons': renderLessons,
            'grades': renderGrades,
            'reports': renderReports
        };
        
        const renderFunction = viewMap[view];
        if (renderFunction) {
            renderFunction();
        }
    } catch (error) {
        console.error('Error in setActiveView:', error);
        // Try to recover by showing the dashboard
        if (view !== 'dashboard') {
            console.log('Attempting to recover by showing dashboard');
            setActiveView('dashboard');
        }
    }
}

function saveNewClass() {
    const gradeLevel = document.getElementById('gradeLevel').value;
    const className = document.getElementById('className').value.trim();
    const classDescription = document.getElementById('classDescription').value.trim();

    if (!gradeLevel || !className) {
        alert('Please fill in all required fields');
        return;
    }

    const newClass = {
        id: Date.now().toString(),
        grade: gradeLevel,
        name: className,
        description: classDescription,
        createdAt: new Date().toISOString()
    };

    state.classes.push(newClass);
    saveState();
    addClassModal.hide();
    renderClasses();
    resetClassForm();
}

function resetClassForm() {
    document.getElementById('addClassForm').reset();
}

// Save the application state to localStorage
function saveState() {
    localStorage.setItem('teacherClasses', JSON.stringify(state.classes));
    localStorage.setItem('teacherStudents', JSON.stringify(state.students));
    localStorage.setItem('teacherLessons', JSON.stringify(state.lessons));
    localStorage.setItem('teacherGrades', JSON.stringify(state.grades));
    localStorage.setItem('teacherAssignments', JSON.stringify(state.assignments));
    localStorage.setItem('teacherAttendance', JSON.stringify(state.attendance));
    console.log('State saved');
}

// Render the dashboard view
function renderDashboard() {
    console.log('Rendering dashboard');

    // Count classes, students, and lessons
    const classCount = state.classes.length;
    let studentCount = 0;
    let lessonCount = 0;

    // Count students across all classes
    Object.values(state.students).forEach(students => {
        studentCount += students.length;
    });

    // Count lessons across all classes
    Object.values(state.lessons).forEach(lessons => {
        lessonCount += lessons.length;
    });

    // Render the dashboard
    contentArea.innerHTML = `
        <div class="container-fluid">
            <h1 class="mb-4">Teacher Dashboard</h1>

            <!-- Stats Cards -->
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title">Classes</h5>
                            <h2 class="display-4">${classCount}</h2>
                            <p class="card-text">Manage your classes and students</p>
                            <a href="#" class="btn btn-light" id="view-classes">View Classes</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title">Students</h5>
                            <h2 class="display-4">${studentCount}</h2>
                            <p class="card-text">View and manage students</p>
                            <a href="#" class="btn btn-light" id="view-students">View Students</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h5 class="card-title">Lessons</h5>
                            <h2 class="display-4">${lessonCount}</h2>
                            <p class="card-text">Plan and track lessons</p>
                            <a href="#" class="btn btn-light" id="view-lessons">View Lessons</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Recent Activity</h5>
                        </div>
                        <div class="card-body">
                            <p>Your recent activities will appear here.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        // Add event listeners to dashboard buttons
        const viewClassesBtn = document.getElementById('view-classes');
        const viewStudentsBtn = document.getElementById('view-students');
        const viewLessonsBtn = document.getElementById('view-lessons');

        if (viewClassesBtn) {
            viewClassesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveView('classes');
            });
        }
        
        if (viewStudentsBtn) {
            viewStudentsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveView('students');
            });
        }
        
        if (viewLessonsBtn) {
            viewLessonsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveView('lessons');
            });
        }
    }
            // Group classes by grade
            const classesByGrade = state.classes.reduce((acc, cls) => {
                if (!acc[cls.grade]) {
                    acc[cls.grade] = [];
                }
                acc[cls.grade].push(cls);
                return acc;
            }, {});

            // Sort grades and render classes
            Object.keys(classesByGrade).sort().forEach(grade => {
                classesHtml += `
                    <div class="col-12 mb-4">
                        <h4 class="mb-3">Grade ${grade}</h4>
                        <div class="row">
                `;

                classesByGrade[grade].forEach(cls => {
                    classesHtml += `
                        <div class="col-md-4 mb-3">
                            <div class="card h-100">
                                <div class="card-body">
                                    <h5 class="card-title">${cls.name}</h5>
                                    <p class="card-text text-muted">${cls.description || 'No description'}</p>
                                </div>
                                <div class="card-footer bg-transparent border-top-0">
                                    <button class="btn btn-sm btn-outline-primary view-class" data-id="${cls.id}">
                                        <i class="fas fa-eye me-1"></i> View
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary edit-class" data-id="${cls.id}">
                                        <i class="fas fa-edit me-1"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-class float-end" data-id="${cls.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                classesHtml += `
                        </div>
                    </div>
                `;
            });
        }

        classesHtml += `</div>`;
        contentArea.innerHTML = classesHtml;

        // Add event listeners
        document.getElementById('add-class-btn')?.addEventListener('click', () => {
            addClassModal.show();
        });

        // Add event delegation for dynamic buttons
        contentArea.addEventListener('click', (e) => {
            const target = e.target.closest('.view-class, .edit-class, .delete-class');
            if (!target) return;

            const classId = target.dataset.id;
            
            if (target.classList.contains('view-class')) {
                viewClass(classId);
            } else if (target.classList.contains('edit-class')) {
                editClass(classId);
            } else if (target.classList.contains('delete-class')) {
                deleteClass(classId);
            }
        });
    }

    function viewClass(classId) {
        const cls = state.classes.find(c => c.id === classId);
        if (!cls) return;

        const students = state.students[classId] || [];
        
        let studentsHtml = '';
        if (students.length > 0) {
            studentsHtml = students.map(student => `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.email || 'N/A'}</td>
                    <td>${student.phone || 'N/A'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary view-student" data-id="${student.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            studentsHtml = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <p class="text-muted">No students in this class yet.</p>
                        <button class="btn btn-primary" id="add-student-btn">
                            <i class="fas fa-user-plus me-1"></i> Add Students
                        </button>
                    </td>
                </tr>
            `;
        }

        const classHtml = `
            <div class="mb-4">
                <button class="btn btn-outline-secondary mb-3" id="back-to-classes">
                    <i class="fas fa-arrow-left me-1"></i> Back to Classes
                </button>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>${cls.name} - Grade ${cls.grade}</h2>
                    <div>
                        <button class="btn btn-outline-primary me-2" id="add-student-btn">
                            <i class="fas fa-user-plus me-1"></i> Add Student
                        </button>
                        <button class="btn btn-primary" id="take-attendance">
                            <i class="fas fa-clipboard-check me-1"></i> Take Attendance
                        </button>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Class Information</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Grade:</strong> ${cls.grade}</p>
                                <p><strong>Class Name:</strong> ${cls.name}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Students:</strong> ${students.length}</p>
                                <p><strong>Created:</strong> ${new Date(cls.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        ${cls.description ? `<p class="mt-3"><strong>Description:</strong> ${cls.description}</p>` : ''}
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Students</h5>
                        <div class="input-group" style="width: 300px;">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" class="form-control" id="student-search" placeholder="Search students...">
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="students-table-body">
                                ${studentsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        contentArea.innerHTML = classHtml;

        // Add event listeners
        document.getElementById('back-to-classes')?.addEventListener('click', () => {
            renderClasses();
        });

        document.getElementById('add-student-btn')?.addEventListener('click', () => {
            // TODO: Implement add student functionality
            alert('Add student functionality coming soon!');
        });

        document.getElementById('take-attendance')?.addEventListener('click', () => {
            // TODO: Implement take attendance functionality
            alert('Attendance functionality coming soon!');
        });

        // Add search functionality
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#students-table-body tr');
                
                rows.forEach(row => {
                    const name = row.cells[1].textContent.toLowerCase();
                    row.style.display = name.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }

    function editClass(classId) {
        // TODO: Implement edit class functionality
        alert('Edit class functionality coming soon!');
    }

    function deleteClass(classId) {
        if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            state.classes = state.classes.filter(c => c.id !== classId);
            saveState();
            renderClasses();
        }
    }

    function renderStudents() {
        // Get all students across all classes
        const allStudents = [];
        Object.entries(state.students).forEach(([classId, students]) => {
            const classInfo = state.classes.find(c => c.id === classId);
            students.forEach(student => {
                allStudents.push({
                    ...student,
                    className: classInfo?.name || 'Unknown Class',
                    grade: classInfo?.grade || 'N/A'
                });
            });
        });

        // Sort students by name
        allStudents.sort((a, b) => a.name.localeCompare(b.name));

        let studentsTableHtml = '';
        if (allStudents.length > 0) {
            studentsTableHtml = allStudents.map(student => `
                <tr>
                    <td>${student.id}</td>
                    <td>
                        <a href="#" class="text-decoration-none view-student" data-id="${student.id}" data-class="${student.classId}">
                            ${student.name}
                        </a>
                    </td>
                    <td>${student.className}</td>
                    <td>Grade ${student.grade}</td>
                    <td>${student.email || 'N/A'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary view-student" data-id="${student.id}" data-class="${student.classId}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary edit-student" data-id="${student.id}" data-class="${student.classId}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            studentsTableHtml = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <p class="text-muted">No students found. Add or import students to get started.</p>
                    </td>
                </tr>
            `;
        }

        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Students</h2>
                <div>
                    <button class="btn btn-outline-primary me-2" id="import-students">
                        <i class="fas fa-file-import me-1"></i> Import Students
                    </button>
                    <button class="btn btn-primary" id="add-student">
                        <i class="fas fa-plus me-1"></i> Add Student
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">All Students (${allStudents.length})</h5>
                    <div class="input-group" style="width: 300px;">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" class="form-control" id="student-search" placeholder="Search students...">
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Grade</th>
                                    <th>Email</th>
                                    <th class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="all-students-table">
                                ${studentsTableHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted small">
                            Showing ${allStudents.length} of ${allStudents.length} students
                        </div>
                        <button class="btn btn-sm btn-outline-secondary" id="export-students">
                            <i class="fas fa-download me-1"></i> Export to CSV
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('add-student')?.addEventListener('click', showAddStudentModal);
        document.getElementById('import-students')?.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('export-students')?.addEventListener('click', exportStudentsToCSV);
        
        // Add search functionality
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#all-students-table tr');
                
                rows.forEach(row => {
                    const name = row.cells[1]?.textContent?.toLowerCase() || '';
                    const className = row.cells[2]?.textContent?.toLowerCase() || '';
                    const email = row.cells[4]?.textContent?.toLowerCase() || '';
                    
                    if (name.includes(searchTerm) || className.includes(searchTerm) || email.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }
        
        // Add event delegation for view/edit buttons
        contentArea.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-student');
            const editBtn = e.target.closest('.edit-student');
            
            if (viewBtn) {
                e.preventDefault();
                const studentId = viewBtn.dataset.id;
                const classId = viewBtn.dataset.class;
                viewStudentProfile(studentId, classId);
            } else if (editBtn) {
                e.preventDefault();
                const studentId = editBtn.dataset.id;
                const classId = editBtn.dataset.class;
                editStudent(studentId, classId);
            }
        });
    }

    function renderLessons() {
        // Get all lessons sorted by date
        const allLessons = [];
        Object.entries(state.lessons).forEach(([classId, lessons]) => {
            lessons.forEach(lesson => {
                const classInfo = state.classes.find(c => c.id === classId);
                allLessons.push({
                    ...lesson,
                    className: classInfo?.name || 'Unknown Class',
                    grade: classInfo?.grade || 'N/A'
                });
            });
        });
        
        // Sort lessons by date (newest first)
        allLessons.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Group lessons by status
        const upcomingLessons = allLessons.filter(lesson => new Date(lesson.date) >= new Date());
        const pastLessons = allLessons.filter(lesson => new Date(lesson.date) < new Date());
        
        // Create lesson cards
        const createLessonCards = (lessons) => {
            if (lessons.length === 0) {
                return '<div class="col-12"><p class="text-muted">No lessons found.</p></div>';
            }
            
            return lessons.map(lesson => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 lesson-card" data-lesson-id="${lesson.id}" data-class-id="${lesson.classId}">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${lesson.title}</h6>
                            <span class="badge ${lesson.status === 'completed' ? 'bg-success' : 'bg-primary'}">
                                ${lesson.status === 'completed' ? 'Completed' : 'Upcoming'}
                            </span>
                        </div>
                        <div class="card-body">
                            <p class="card-text">${lesson.objective || 'No objective provided'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="far fa-calendar-alt me-1"></i> 
                                    ${new Date(lesson.date).toLocaleDateString()}
                                </small>
                                <small class="text-muted">
                                    <i class="fas fa-users me-1"></i> 
                                    Grade ${lesson.grade} - ${lesson.className}
                                </small>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-top-0">
                            <button class="btn btn-sm btn-outline-primary view-lesson">
                                <i class="fas fa-eye me-1"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary edit-lesson">
                                <i class="fas fa-edit me-1"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger float-end delete-lesson">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        };
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Lesson Plans</h2>
                <div>
                    <button class="btn btn-outline-primary me-2" id="lesson-templates">
                        <i class="fas fa-clipboard-list me-1"></i> Templates
                    </button>
                    <button class="btn btn-primary" id="create-lesson">
                        <i class="fas fa-plus me-1"></i> Create Lesson
                    </button>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">Upcoming Lessons</h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" id="calendar-view">
                            <i class="far fa-calendar-alt me-1"></i> Calendar View
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" id="list-view">
                            <i class="fas fa-list-ul me-1"></i> List View
                        </button>
                    </div>
                </div>
                
                <div class="row" id="upcoming-lessons">
                    ${createLessonCards(upcomingLessons)}
                </div>
                
                <div class="text-center mt-3">
                    <button class="btn btn-sm btn-outline-secondary" id="load-more-upcoming">
                        <i class="fas fa-chevron-down me-1"></i> Load More
                    </button>
                </div>
            </div>
            
            <div class="mb-4">
                <h5 class="mb-3">Past Lessons</h5>
                <div class="row" id="past-lessons">
                    ${createLessonCards(pastLessons.slice(0, 3))}
                </div>
                ${pastLessons.length > 3 ? `
                    <div class="text-center mt-3">
                        <button class="btn btn-sm btn-outline-secondary" id="show-all-past">
                            <i class="fas fa-history me-1"></i> Show All (${pastLessons.length} past lessons)
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <!-- Lesson Plan Modal -->
            <div class="modal fade" id="lessonPlanModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="lessonPlanModalTitle">Lesson Plan</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="lesson-plan-content">
                            <!-- Content will be loaded dynamically -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="print-lesson-plan">
                                <i class="fas fa-print me-1"></i> Print
                            </button>
                        </div>
        
        // Add event listeners for lesson actions
        const createLessonBtn = document.getElementById('create-lesson');
        const lessonTemplatesBtn = document.getElementById('lesson-templates');
        const calendarViewBtn = document.getElementById('calendar-view');
        const listViewBtn = document.getElementById('list-view');
        const loadMoreBtn = document.getElementById('load-more-upcoming');
        const showAllPastBtn = document.getElementById('show-all-past');
        const printLessonBtn = document.getElementById('print-lesson-plan');
        
        if (createLessonBtn) createLessonBtn.addEventListener('click', showCreateLessonModal);
        if (lessonTemplatesBtn) lessonTemplatesBtn.addEventListener('click', showLessonTemplates);
        if (calendarViewBtn) calendarViewBtn.addEventListener('click', showCalendarView);
        if (listViewBtn) listViewBtn.addEventListener('click', showListView);
        if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreUpcoming);
        if (showAllPastBtn) showAllPastBtn.addEventListener('click', showAllPast);
        if (printLessonBtn) printLessonBtn.addEventListener('click', printLessonPlan);
        
        // Event delegation for lesson cards
        if (contentArea) {
            contentArea.addEventListener('click', function(e) {
                const card = e.target.closest('.lesson-card');
                if (!card) return;
                
                const lessonId = card.dataset.lessonId;
                const classId = card.dataset.classId;
                
                if (e.target.closest('.view-lesson') || e.target === card) {
                    viewLessonPlan(lessonId, classId);
                } else if (e.target.closest('.edit-lesson')) {
                    editLessonPlan(lessonId, classId);
                } else if (e.target.closest('.delete-lesson')) {
                    deleteLessonPlan(lessonId, classId);
                }
            });
        }
    }
    
    function viewLessonPlan(lessonId, classId) {
        var lessons = state.lessons[classId] || [];
        var lesson = lessons.find(function(l) { return l.id === lessonId; });
        
        if (!lesson) {
            showAlert('Lesson not found', 'danger');
            return;
        }
        
        var classInfo = state.classes.find(function(c) { return c.id === classId; }) || {};
        var materialsList = '';
        if (Array.isArray(lesson.materials)) {
            materialsList = lesson.materials.map(function(m) { 
                return '<li>' + m + '</li>'; 
            }).join('');
        }
            
        var procedureList = '<p>No procedure steps defined.</p>';
        if (lesson.procedure && lesson.procedure.length > 0) {
            procedureList = lesson.procedure.map(function(step) {
                return '<div class="mb-2"><strong>' + step.step + '. ' + (step.time || '') + 
                       '</strong><p class="mb-1">' + step.description + '</p></div>';
            }).join('');
        }
        
        var modalContent = [
            '<div class="mb-4">',
                '<h4>', lesson.title, '</h4>',
                '<div class="text-muted mb-3">',
                    '<div>', (classInfo.name || 'Unknown Class'), '</div>',
                    '<div>', new Date(lesson.date).toLocaleDateString(), ' Ã¢â‚¬Â¢ ', 
                           (lesson.startTime || ''), ' - ', (lesson.endTime || ''), '</div>',
                '</div>',
                '<h5>Learning Objective</h5>',
                '<p>', (lesson.objective || 'No objective provided.'), '</p>',
                '<h5>Materials</h5>',
                materialsList ? '<ul>' + materialsList + '</ul>' : '<p>No materials listed.</p>',
                '<h5>Procedure</h5>',
                procedureList,
                '<h5>Assessment</h5>',
                '<p>', (lesson.assessment || 'No assessment method specified.'), '</p>'
        ];
        
        if (lesson.notes) {
            modalContent.push(
                '<h5>Notes & Reflection</h5>',
                '<p>', lesson.notes, '</p>'
            );
        }
        
        modalContent.push(
            '<div class="text-muted small mt-4">',
                '<div>Created: ', new Date(lesson.createdAt).toLocaleString(), '</div>'
        );
        
        if (lesson.updatedAt) {
            modalContent.push('<div>Last updated: ', new Date(lesson.updatedAt).toLocaleString(), '</div>');
        }
        
        modalContent.push(
                '</div>',
            '</div>',
            '<div class="d-flex justify-content-between">',
                '<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>',
                '<div>',
                    '<button type="button" class="btn btn-outline-danger me-2" ', 
                        'onclick="deleteLessonPlan(\'', lessonId, '\', \'', classId, '\')">',
                        '<i class="fas fa-trash me-1"></i> Delete',
                    '</button>',
                    '<button type="button" class="btn btn-primary" ', 
                        'onclick="editLessonPlan(\'', lessonId, '\', \'', classId, '\')">',
                        '<i class="fas fa-edit me-1"></i> Edit',
                    '</button>',
                '</div>',
            '</div>'
        );
        
        modalContent = modalContent.join('');
        
        var modalEl = document.getElementById('lessonPlanModal');
        if (modalEl) {
            var modalTitle = modalEl.querySelector('.modal-title');
            var modalBody = modalEl.querySelector('.modal-body');
            
            if (modalTitle) modalTitle.textContent = 'View Lesson Plan';
            if (modalBody) modalBody.innerHTML = modalContent;
            
            var modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
    
    function editLessonPlan(lessonId, classId) {
        const lessons = state.lessons[classId] || [];
        const lesson = lessons.find(function(l) { return l.id === lessonId; });
        
        if (!lesson) {
            showAlert('Lesson not found', 'danger');
            return;
        }
        
        // Show the create lesson form with existing data
        showCreateLessonModal();
        
        // Wait for modal to be shown
        setTimeout(function() {
            // Fill the form with existing lesson data
            var titleInput = document.getElementById('lesson-title');
            var classInput = document.getElementById('lesson-class');
            var dateInput = document.getElementById('lesson-date');
            var startTimeInput = document.getElementById('start-time');
            var endTimeInput = document.getElementById('end-time');
            var objectiveInput = document.getElementById('lesson-objective');
            var materialsInput = document.getElementById('lesson-materials');
            var assessmentInput = document.getElementById('lesson-assessment');
            var notesInput = document.getElementById('lesson-notes');
            var completedInput = document.getElementById('mark-completed');
            
            if (titleInput) titleInput.value = lesson.title || '';
            if (classInput) classInput.value = lesson.classId || '';
            if (dateInput) dateInput.value = lesson.date || '';
            if (startTimeInput) startTimeInput.value = lesson.startTime || '';
            if (endTimeInput) endTimeInput.value = lesson.endTime || '';
            if (objectiveInput) objectiveInput.value = lesson.objective || '';
            if (materialsInput) {
                materialsInput.value = Array.isArray(lesson.materials) ? 
                    lesson.materials.join(', ') : '';
            }
            if (assessmentInput) assessmentInput.value = lesson.assessment || '';
            if (notesInput) notesInput.value = lesson.notes || '';
            if (completedInput) completedInput.checked = lesson.status === 'completed';
            
            // Clear existing procedure steps
            var procedureContainer = document.getElementById('lesson-procedure');
            if (procedureContainer) {
                procedureContainer.innerHTML = '';
                
                // Add procedure steps
                if (lesson.procedure && lesson.procedure.length > 0) {
                    lesson.procedure.forEach(function(step) {
                        addProcedureStep(step.description, step.time);
                    });
                } else {
                    // Add one empty step
                    addProcedureStep('', '');
                }
            }
            
            // Update the form submission to handle updates
            var form = document.getElementById('lesson-plan-form');
            if (form) {
                var originalSubmit = form.onsubmit;
                
                form.onsubmit = function(e) {
                    e.preventDefault();
                    
                    // Remove the old lesson
                    var lessonIndex = lessons.findIndex(function(l) { 
                        return l.id === lessonId; 
                    });
                    
                    if (lessonIndex > -1) {
                        state.lessons[classId].splice(lessonIndex, 1);
                    }
                    
                    // Save the updated lesson
                    saveLessonPlan(e);
                    
                    // Restore original submit handler
                    form.onsubmit = originalSubmit;
                };
            }
            
            // Update the modal title
            var modalTitle = document.querySelector('#modal .modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Edit Lesson Plan';
            }
        }, 100);
    }
    
    function deleteLessonPlan(lessonId, classId) {
        if (!confirm('Are you sure you want to delete this lesson plan? This action cannot be undone.')) {
            return;
        }
        
        const lessons = state.lessons[classId] || [];
        const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
        
        if (lessonIndex > -1) {
            lessons.splice(lessonIndex, 1);
            state.lessons[classId] = lessons;
            localStorage.setItem('teacherLessons', JSON.stringify(state.lessons));
            showAlert('Lesson plan deleted successfully', 'success');
            renderLessons();
            
            // Close the modal if open
            const modalEl = document.getElementById('lessonPlanModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) {
                    modal.hide();
                }
            }
        } else {
            showAlert('Lesson not found', 'danger');
        }
    }
    
    function showCalendarView() {
        // Implementation for calendar view
        alert('Calendar view functionality coming soon!');
    }
    
    function showListView() {
        // Implementation for list view
        alert('List view functionality coming soon!');
    }
    
    function loadMoreUpcoming() {
        // Implementation for loading more upcoming lessons
        alert('Loading more upcoming lessons...');
    }
    
    function showAllPast() {
        // Implementation for showing all past lessons
        const pastLessons = [];
        Object.entries(state.lessons).forEach(([classId, lessons]) => {
            lessons.forEach(lesson => {
                if (new Date(lesson.date) < new Date()) {
                    const classInfo = state.classes.find(c => c.id === classId);
                    pastLessons.push({
                        ...lesson,
                        className: classInfo?.name || 'Unknown Class',
                        grade: classInfo?.grade || 'N/A'
                    });
                }
            });
        });
        
        const pastContainer = document.getElementById('past-lessons');
        if (pastContainer) {
            pastContainer.innerHTML = createLessonCards(pastLessons);
            
            // Hide the "Show All" button
            const showAllBtn = document.getElementById('show-all-past');
            if (showAllBtn) {
                showAllBtn.style.display = 'none';
            }
        }
    }
    
    function printLessonPlan() {
        const printContent = document.getElementById('lesson-plan-content').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div class="container mt-4">
                <h2 class="mb-4">${document.getElementById('lessonPlanModalTitle').textContent}</h2>
                ${printContent}
                <div class="text-muted text-end mt-4">
                    Printed on ${new Date().toLocaleString()}
                </div>
            </div>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        renderLessons(); // Restore the view
    }
    
    function showModal(title, content) {
        const modal = document.getElementById('modal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        
        // Show the modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-' + type + ' alert-dismissible fade show';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = message + 
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
        
        // Add to the top of the content area
        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }
        
        // Auto-remove after 5 seconds
        if (typeof bootstrap !== 'undefined') {
            setTimeout(function() {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }, 5000);
        }
    }
    
    function showCreateLessonModal() {
        if (!state.classes || state.classes.length === 0) {
            showAlert('Please create a class first before adding lessons.', 'warning');
            return;
        }
        
        var classOptions = state.classes.map(function(c) {
            return '<option value="' + c.id + '">' + c.name + ' (Grade ' + c.grade + ')</option>';
        }).join('');
        
        var modalContent = [
            '<form id="lesson-plan-form">',
                '<div class="mb-3">',
                    '<label for="lesson-title" class="form-label">Lesson Title</label>',
                    '<input type="text" class="form-control" id="lesson-title" required>',
                '</div>',
                '<div class="row mb-3">',
                    '<div class="col-md-6">',
                        '<label for="lesson-class" class="form-label">Class</label>',
                        '<select class="form-select" id="lesson-class" required>',
                            '<option value="">Select a class</option>',
                            classOptions,
                        '</select>',
                    '</div>',
                    '<div class="col-md-6">',
                        '<label for="lesson-date" class="form-label">Date</label>',
                        '<input type="date" class="form-control" id="lesson-date" required>',
                    '</div>',
                '</div>'
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="start-time" class="form-label">Start Time</label>
                        <input type="time" class="form-control" id="start-time" required>
                    </div>
                    <div class="col-md-6">
                        <label for="end-time" class="form-label">End Time</label>
                        <input type="time" class="form-control" id="end-time" required>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label for="lesson-objective" class="form-label">Learning Objective</label>
                    <textarea class="form-control" id="lesson-objective" rows="2" required></textarea>
                </div>
                
                <div class="mb-3">
                    <label for="lesson-materials" class="form-label">Materials (comma separated)</label>
                    <input type="text" class="form-control" id="lesson-materials" 
                           placeholder="e.g., textbooks, markers, handouts">
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Procedure</label>
                    <div id="lesson-procedure">
                        <!-- Procedure steps will be added here -->
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-secondary mt-2" id="add-step">
                        <i class="fas fa-plus me-1"></i> Add Step
                    </button>
                </div>
                
                <div class="mb-3">
                    <label for="lesson-assessment" class="form-label">Assessment</label>
                    <textarea class="form-control" id="lesson-assessment" rows="2"></textarea>
                </div>
                
                <div class="mb-3">
                    <label for="lesson-notes" class="form-label">Notes & Reflection</label>
                    <textarea class="form-control" id="lesson-notes" rows="3"></textarea>
                </div>
                
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="mark-completed">
                    <label class="form-check-label" for="mark-completed">
                        Mark as completed
                    </label>
                </div>
                
                <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Save Lesson Plan
                    </button>
                </div>
            </form>
        ];
        
        // Add remaining form content
        modalContent = modalContent.concat([
                '<div class="row mb-3">',
                    '<div class="col-md-6">',
                        '<label for="start-time" class="form-label">Start Time</label>',
                        '<input type="time" class="form-control" id="start-time" required>',
                    '</div>',
                    '<div class="col-md-6">',
                        '<label for="end-time" class="form-label">End Time</label>',
                        '<input type="time" class="form-control" id="end-time" required>',
                    '</div>',
                '</div>',
                '<div class="mb-3">',
                    '<label for="lesson-objective" class="form-label">Learning Objective</label>',
                    '<textarea class="form-control" id="lesson-objective" rows="2" required></textarea>',
                '</div>',
                '<div class="mb-3">',
                    '<label for="lesson-materials" class="form-label">Materials (comma separated)</label>',
                    '<input type="text" class="form-control" id="lesson-materials" ', 
                           'placeholder="e.g., textbooks, markers, handouts">',
                '</div>',
                '<div class="mb-3">',
                    '<label class="form-label">Procedure</label>',
                    '<div id="lesson-procedure"></div>',
                    '<button type="button" class="btn btn-sm btn-outline-secondary mt-2" id="add-step">',
                        '<i class="fas fa-plus me-1"></i> Add Step',
                    '</button>',
                '</div>',
                '<div class="mb-3">',
                    '<label for="lesson-assessment" class="form-label">Assessment</label>',
                    '<textarea class="form-control" id="lesson-assessment" rows="2"></textarea>',
                '</div>',
                '<div class="mb-3">',
                    '<label for="lesson-notes" class="form-label">Notes & Reflection</label>',
                    '<textarea class="form-control" id="lesson-notes" rows="3"></textarea>',
                '</div>',
                '<div class="form-check mb-3">',
                    '<input class="form-check-input" type="checkbox" id="mark-completed">',
                    '<label class="form-check-label" for="mark-completed">',
                        'Mark as completed',
                    '</label>',
                '</div>',
                '<div class="d-flex justify-content-end">',
                    '<button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">',
                        'Cancel',
                    '</button>',
                    '<button type="submit" class="btn btn-primary">',
                        '<i class="fas fa-save me-1"></i> Save Lesson Plan',
                    '</button>',
                '</div>',
            '</form>'
        ]).join('');
        
        // Show the modal
        var modalEl = document.getElementById('lessonPlanModal');
        if (!modalEl) return;
        
        var modal = new bootstrap.Modal(modalEl);
        var modalTitle = modalEl.querySelector('.modal-title');
        var modalBody = modalEl.querySelector('.modal-body');
        
        if (modalTitle) modalTitle.textContent = 'Create New Lesson Plan';
        if (modalBody) {
            modalBody.innerHTML = modalContent;
            
            // Set default date to today
            var today = new Date().toISOString().split('T')[0];
            var dateInput = document.getElementById('lesson-date');
            if (dateInput) dateInput.value = today;
            
            // Set default time to next hour
            var now = new Date();
            var nextHour = new Date(now.getTime() + 60 * 60 * 1000);
            var startTimeInput = document.getElementById('start-time');
            var endTimeInput = document.getElementById('end-time');
            
            if (startTimeInput) {
                startTimeInput.value = nextHour.toTimeString().substring(0, 5);
            }
            
            if (endTimeInput) {
                nextHour.setHours(nextHour.getHours() + 1);
                endTimeInput.value = nextHour.toTimeString().substring(0, 5);
            }
            
            // Add event listeners
            var addStepBtn = document.getElementById('add-step');
            if (addStepBtn) {
                addStepBtn.addEventListener('click', addProcedureStep);
            }
            
            // Add initial procedure step
            addProcedureStep();
            
            // Handle form submission
            var form = document.getElementById('lesson-plan-form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    saveLessonPlan(e);
                });
            }
        }
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('lesson-date');
        if (dateInput) dateInput.value = today;
        
        // Set default time to next hour
        const now = new Date();
        const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
        const startTimeInput = document.getElementById('start-time');
        const endTimeInput = document.getElementById('end-time');
        
        if (startTimeInput) {
            startTimeInput.value = nextHour.toTimeString().substring(0, 5);
        }
        
        if (endTimeInput) {
            nextHour.setHours(nextHour.getHours() + 1);
            endTimeInput.value = nextHour.toTimeString().substring(0, 5);
        }
        
        // Add event listeners
        document.getElementById('add-step')?.addEventListener('click', function() {
            addProcedureStep();
        });
        
        // Add initial procedure step
        addProcedureStep();
        
        // Handle form submission
        document.getElementById('lesson-plan-form')?.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLessonPlan(e);
        });
        
        modal.show();
    }
    
    function addProcedureStep(description, time) {
        description = description || '';
        time = time || '';
        const container = document.getElementById('lesson-procedure');
        if (!container) return;
        
        const stepNumber = container.children.length + 1;
        const stepId = `step-${Date.now()}-${stepNumber}`;
        
        const stepDiv = document.createElement('div');
        stepDiv.className = 'procedure-step mb-3 p-2 border rounded';
        stepDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Step ${stepNumber}</h6>
                <button type="button" class="btn btn-sm btn-outline-danger delete-step">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="row">
                <div class="col-md-3">
                    <label for="${stepId}-time" class="form-label small text-muted">Time</label>
                    <input type="text" class="form-control form-control-sm" id="${stepId}-time" 
                           value="${time}" placeholder="e.g., 5 min">
                </div>
                <div class="col-md-9">
                    <label for="${stepId}-desc" class="form-label small text-muted">Description</label>
                    <input type="text" class="form-control form-control-sm" id="${stepId}-desc" 
                           value="${description}" placeholder="What will students do?">
                </div>
            </div>
        `;
        
        container.appendChild(stepDiv);
        
        // Add delete step handler
        stepDiv.querySelector('.delete-step')?.addEventListener('click', function() {
            stepDiv.remove();
            // Renumber remaining steps
            const steps = container.querySelectorAll('.procedure-step');
            steps.forEach((step, index) => {
                const stepHeader = step.querySelector('h6');
                if (stepHeader) {
                    stepHeader.textContent = `Step ${index + 1}`;
                }
            });
        });
    }
    
    function saveLessonPlan(e) {
        if (!e || !e.target) return;
        const form = e.target;
        const classId = form.querySelector('#lesson-class').value;
        const title = form.querySelector('#lesson-title').value.trim();
        const date = form.querySelector('#lesson-date').value;
        const startTime = form.querySelector('#start-time').value;
        const endTime = form.querySelector('#end-time').value;
        const objective = form.querySelector('#lesson-objective').value.trim();
        const materials = form.querySelector('#lesson-materials').value
            .split(',')
            .map(m => m.trim())
            .filter(m => m);
        const assessment = form.querySelector('#lesson-assessment').value.trim();
        const notes = form.querySelector('#lesson-notes').value.trim();
        const isCompleted = form.querySelector('#mark-completed').checked;
        
        // Get procedure steps
        const procedureSteps = [];
        const stepElements = form.querySelectorAll('.procedure-step');
        stepElements.forEach((step, index) => {
            const stepId = step.querySelector('input[type="text"]').id.split('-')[1];
            const time = step.querySelector(`#${stepId}-time`).value.trim();
            const description = step.querySelector(`#${stepId}-desc`).value.trim();
            
            if (description) {
                procedureSteps.push({
                    step: index + 1,
                    time: time,
                    description: description
                });
            }
        });
        
        // Create lesson object
        const lesson = {
            id: `lesson-${Date.now()}`,
            classId: classId,
            title: title,
            date: date,
            startTime: startTime,
            endTime: endTime,
            objective: objective,
            materials: materials,
            procedure: procedureSteps,
            assessment: assessment,
            notes: notes,
            status: isCompleted ? 'completed' : 'planned',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to state
        if (!state.lessons[classId]) {
            state.lessons[classId] = [];
        }
        state.lessons[classId].push(lesson);
        
        // Save to localStorage
        localStorage.setItem('teacherLessons', JSON.stringify(state.lessons));
        
        // Close modal and refresh view
        const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
        if (modal) {
            modal.hide();
        }
        
        // Show success message
        showAlert('Lesson plan saved successfully!', 'success');
        
        // Refresh lessons view
        renderLessons();
    }
    
    function createLessonCards(lessons) {
        if (lessons.length === 0) {
            return '<div class="col-12"><p class="text-muted">No lessons found.</p></div>';
        }
        
        return lessons.map(lesson => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 lesson-card" data-lesson-id="${lesson.id}" data-class-id="${lesson.classId}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${lesson.title}</h6>
                        <span class="badge ${lesson.status === 'completed' ? 'bg-success' : 'bg-primary'}">
                            ${lesson.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${lesson.objective || 'No objective provided'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="far fa-calendar-alt me-1"></i> 
                                ${new Date(lesson.date).toLocaleDateString()}
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-users me-1"></i> 
                                Grade ${lesson.grade} - ${lesson.className}
                            </small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-top-0">
                        <button class="btn btn-sm btn-outline-primary view-lesson">
                            <i class="fas fa-eye me-1"></i> View
                        </button>
                        <button class="btn btn-sm btn-outline-secondary edit-lesson">
                            <i class="fas fa-edit me-1"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger float-end delete-lesson">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
});
