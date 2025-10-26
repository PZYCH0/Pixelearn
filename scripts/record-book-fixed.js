// Main application object
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
        // Wait for DOM to be fully loaded
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
                console.log('Navigation clicked:', view); // Debug log
                try {
                    setActiveView(view);
                } catch (error) {
                    console.error('Error in setActiveView:', error);
                }
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
        
        // Connect the Save button in the class modal
        const saveClassBtn = document.getElementById('saveClass');
        if (saveClassBtn) {
            saveClassBtn.addEventListener('click', function(e) {
                e.preventDefault();
                saveClass();
            });
        }
        
        // Add student button - using event delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('#add-student')) {
                e.preventDefault();
                openStudentModal();
            }
            
            // Bulk import button
            if (e.target.closest('#bulk-import')) {
                e.preventDefault();
                openBulkImportModal();
            }
            
            // Save student button
            if (e.target.closest('#saveStudent')) {
                e.preventDefault();
                saveStudent();
            }
            
            // Process import button
            if (e.target.closest('#processImport')) {
                e.preventDefault();
                processBulkImport();
            }
        });
        
        // Text input events for bulk import
        const bulkImportText = document.getElementById('bulkImportText');
        const bulkImportClass = document.getElementById('bulkImportClass');
        
        if (bulkImportText) {
            bulkImportText.addEventListener('input', updateImportPreview);
        }
        
        if (bulkImportClass) {
            bulkImportClass.addEventListener('change', updateProcessImportButton);
        }
        // Add form submission handler
        const addClassForm = document.getElementById('addClassForm');
        if (addClassForm) {
            addClassForm.addEventListener('submit', (e) => {
                e.preventDefault();
                saveNewClass();
            });
        }
        // Add class button
        if (addClassBtn) {
            addClassBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (addClassModal) addClassModal.show();
            });
        }
        
        // Save class button
        if (saveClassBtn) {
            saveClassBtn.addEventListener('click', (e) => {
                e.preventDefault();
                saveNewClass();
            });
        }
        
        // Navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.id.replace('-tab', '');
                setActiveView(view);
            });
        });
        
        // Export/Import functionality
        const exportBtn = document.getElementById('export-data');
        const importBtn = document.getElementById('import-data');
        const importFile = document.getElementById('import-file');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                exportData();
            });
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (importFile) importFile.click();
            });
        }
        
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                importData(e);
            });
        }
        
        // Add event delegation for dynamically created elements
        document.addEventListener('click', (e) => {
            // Handle view buttons
            if (e.target.matches('#view-classes, #view-classes *')) {
                e.preventDefault();
                setActiveView('classes');
            } else if (e.target.matches('#view-students, #view-students *')) {
                e.preventDefault();
                setActiveView('students');
            } else if (e.target.matches('#view-lessons, #view-lessons *')) {
                e.preventDefault();
                setActiveView('lessons');
            }
            
            // Handle back to dashboard buttons
            if (e.target.matches('.back-to-dashboard, .back-to-dashboard *')) {
                e.preventDefault();
                setActiveView('dashboard');
            }
            
            // Handle add student button
            if (e.target.matches('#add-student, #add-student *')) {
                e.preventDefault();
                openStudentModal();
            }
        });
    }
    
    // Set the active view and render it
    function setActiveView(view) {
        console.log('Setting active view to:', view);
        
        // Validate the view
        const validViews = ['dashboard', 'classes', 'students', 'lessons', 'grades', 'reports'];
        if (!validViews.includes(view)) {
            console.error('Invalid view:', view);
            return;
        }
        
        try {
            // Update the current view in state
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
            } else {
                console.warn('No navigation links found');
            }
            
            // Render the appropriate view
            console.log('Rendering view:', view);
            switch(view) {
                case 'dashboard':
                    renderDashboard();
                    break;
                case 'classes':
                    renderClasses();
                    break;
                case 'students':
                    renderStudents();
                    break;
                case 'lessons':
                    renderLessons();
                    break;
                case 'grades':
                    renderGrades();
                    break;
                case 'reports':
                    renderReports();
                    break;
                default:
                    console.warn('No render function for view:', view);
                    renderDashboard(); // Fallback to dashboard
            }
        } catch (error) {
            console.error('Error in setActiveView:', error);
            // Try to recover by rendering the dashboard
            if (view !== 'dashboard') {
                console.log('Attempting to recover by showing dashboard');
                setActiveView('dashboard');
            }
        }
    }
    
    // Render the classes view
    function renderClasses() {
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>My Classes</h2>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addClassModal">
                    <i class="fas fa-plus"></i> Add New Class
                </button>
            </div>
            <div class="row" id="classes-container">
                ${state.classes.length > 0 ? 
                    state.classes.map(cls => `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${cls.name}</h5>
                                    <h6 class="card-subtitle mb-2 text-muted">Grade ${cls.gradeLevel}</h6>
                                    <p class="card-text">${cls.description || 'No description'}</p>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-primary view-class" data-id="${cls.id}">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        <button class="btn btn-sm btn-outline-secondary edit-class" data-id="${cls.id}">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('') : 
                    '<div class="col-12 text-center py-5">
                        <i class="fas fa-chalkboard fa-3x text-muted mb-3"></i>
                        <h4>No classes found</h4>
                        <p>Get started by adding your first class</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addClassModal">
                            <i class="fas fa-plus"></i> Add Class
                        </button>
                    </div>'
                }
            </div>`;
            
        // Add event listeners for class actions
        document.querySelectorAll('.view-class').forEach(btn => {
            btn.addEventListener('click', () => {
                const classId = btn.dataset.id;
                viewClass(classId);
            });
        });
        
        document.querySelectorAll('.edit-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const classId = btn.dataset.id;
                editClass(classId);
            });
        });
    }
    
    // Render the students view
    function renderStudents() {
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>All Students</h2>
                <div>
                    <button class="btn btn-primary me-2" id="add-student">
                        <i class="fas fa-user-plus"></i> Add Student
                    </button>
                    <button class="btn btn-outline-secondary" id="bulk-import">
                        <i class="fas fa-file-import"></i> Bulk Import
                    </button>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="students-list">
                                ${Object.values(state.students).length > 0 ? 
                                    Object.values(state.students).map(student => {
                                        const studentClass = state.classes.find(c => c.students && c.students.includes(student.id));
                                        return `
                                            <tr>
                                                <td>${student.lastName}, ${student.firstName}</td>
                                                <td>${studentClass ? studentClass.name : 'Not assigned'}</td>
                                                <td>${student.email || 'N/A'}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-primary edit-student" data-id="${student.id}">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-outline-danger delete-student" data-id="${student.id}">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('') : 
                                    '<tr><td colspan="4" class="text-center py-4">No students found. Add your first student to get started.</td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>`;
    }
    
    // Render the lessons view
    function renderLessons() {
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Lesson Plans</h2>
                <button class="btn btn-primary" id="create-lesson">
                    <i class="fas fa-plus"></i> Create Lesson Plan
                </button>
            </div>
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Lesson planning features coming soon!
            </div>`;
    }
    
    // Render the grades view
    function renderGrades() {
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Gradebook</h2>
                <div>
                    <button class="btn btn-primary me-2">
                        <i class="fas fa-plus"></i> Add Grade
                    </button>
                    <button class="btn btn-outline-secondary">
                        <i class="fas fa-download"></i> Export Grades
                    </button>
                </div>
            </div>
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Gradebook features coming soon!
            </div>`;
    }
    
    // Render the reports view
    function renderReports() {
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Reports</h2>
                <div>
                    <button class="btn btn-primary me-2">
                        <i class="fas fa-chart-bar"></i> Generate Report
                    </button>
                </div>
            </div>
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> Reporting features coming soon!
            </div>`;
    }
    
    // Render the dashboard view
    function renderDashboard() {
        if (!contentArea) return;
        
        const classCount = state.classes.length;
        const studentCount = Object.keys(state.students).length;
        const lessonCount = Object.keys(state.lessons).length;
        
        contentArea.innerHTML = `
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title">Classes</h5>
                            <h2 class="display-4">${classCount}</h2>
                            <p class="card-text">Manage your classes</p>
                            <button class="btn btn-light" id="view-classes">View Classes</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title">Students</h5>
                            <h2 class="display-4">${studentCount}</h2>
                            <p class="card-text">Manage your students</p>
                            <button class="btn btn-light" id="view-students">View Students</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h5 class="card-title">Lessons</h5>
                            <h2 class="display-4">${lessonCount}</h2>
                            <p class="card-text">Manage your lessons</p>
                            <button class="btn btn-light" id="view-lessons">View Lessons</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Other view rendering functions
    function renderClasses() {
        if (!contentArea) return;
        
        // Create class cards for each class
        const classesHTML = state.classes.length > 0 
            ? state.classes.map(cls => `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${cls.name}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Grade ${cls.gradeLevel}</h6>
                            ${cls.description ? `<p class="card-text">${cls.description}</p>` : ''}
                        </div>
                        <div class="card-footer bg-transparent">
                            <button class="btn btn-sm btn-outline-primary view-class" data-id="${cls.id}">
                                <i class="fas fa-eye me-1"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary edit-class" data-id="${cls.id}">
                                <i class="fas fa-edit me-1"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-class" data-id="${cls.id}">
                                <i class="fas fa-trash me-1"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')
            : '<div class="col-12"><div class="alert alert-info">No classes found. Click "Add New" to create a class.</div></div>';
        
        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Classes</h2>
                <div>
                    <button class="btn btn-primary back-to-dashboard me-2">
                        <i class="fas fa-arrow-left me-1"></i> Back to Dashboard
                    </button>
                    <button class="btn btn-success" id="add-new-class">
                        <i class="fas fa-plus me-1"></i> Add New Class
                    </button>
                </div>
            </div>
            <div class="row">
                ${classesHTML}
            </div>
        `;
        
        // Add event listeners for class actions
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.view-class, .edit-class, .delete-class');
            if (!target) return;
            
            const classId = target.dataset.id;
            if (!classId) return;
            
            const classItem = state.classes.find(c => c.id === classId);
            if (!classItem) return;
            
            e.preventDefault();
            
            if (target.classList.contains('view-class')) {
                viewClass(classId);
            } else if (target.classList.contains('edit-class')) {
                editClass(classId);
            } else if (target.classList.contains('delete-class')) {
                if (confirm(`Are you sure you want to delete ${classItem.name}?`)) {
                    deleteClass(classId);
                }
            }
        });
        
        // Add event listener for the Add New Class button
        document.getElementById('add-new-class')?.addEventListener('click', () => {
            if (addClassModal) addClassModal.show();
        });
    }
    
    function openStudentModal(studentId = null, classId = null) {
        const form = document.getElementById('studentForm');
        const modalTitle = document.querySelector('#studentModal .modal-title');
        const saveBtn = document.getElementById('saveStudent');
        
        if (studentId) {
            // Editing existing student
            modalTitle.textContent = 'Edit Student';
            saveBtn.textContent = 'Update Student';
            form.dataset.studentId = studentId;
            
            // Fill in the form
            document.getElementById('studentFirstName').value = state.students[studentId].firstName || '';
            document.getElementById('studentLastName').value = state.students[studentId].lastName || '';
            document.getElementById('studentEmail').value = state.students[studentId].email || '';
            document.getElementById('studentClass').value = state.students[studentId].classId || '';
            document.getElementById('studentNotes').value = state.students[studentId].notes || '';
        } else {
            // Adding new student
            modalTitle.textContent = 'Add New Student';
            saveBtn.textContent = 'Save Student';
            form.reset();
            delete form.dataset.studentId;
            
            // Set class dropdown
            const classSelect = document.getElementById('studentClass');
            if (classSelect) {
                // Clear existing options except the first one
                while (classSelect.options.length > 1) {
                    classSelect.remove(1);
                }
                
                // Add classes to dropdown
                state.classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = `${cls.name} (Grade ${cls.gradeLevel})`;
                    option.selected = (classId === cls.id);
                    classSelect.appendChild(option);
                });
            }
        }
        
        if (studentModal) studentModal.show();
    }
    
    function saveStudent() {
        const form = document.getElementById('studentForm');
        const studentId = form.dataset.studentId;
        const classId = document.getElementById('studentClass').value;
        
        const student = {
            id: studentId || Date.now().toString(),
            firstName: document.getElementById('studentFirstName').value.trim(),
            lastName: document.getElementById('studentLastName').value.trim(),
            email: document.getElementById('studentEmail').value.trim(),
            classId: classId,
            notes: document.getElementById('studentNotes').value.trim(),
            createdAt: studentId && state.students[studentId]?.createdAt || new Date().toISOString()
        };
        
        // Validate
        if (!student.firstName || !student.lastName || !student.classId) {
            alert('Please fill in all required fields');
            return;
        }
        
        // If updating, remove from previous class
        if (studentId && state.students[studentId]?.classId !== classId) {
            const oldClass = state.classes.find(c => c.id === state.students[studentId]?.classId);
            if (oldClass) {
                oldClass.students = oldClass.students.filter(id => id !== studentId);
            }
        }
        
        // Add to new class if not already present
        const targetClass = state.classes.find(c => c.id === classId);
        if (targetClass && !targetClass.students.includes(student.id)) {
            targetClass.students = targetClass.students || [];
            targetClass.students.push(student.id);
        }
        
        // Save to state
        state.students[student.id] = student;
        
        // Save to localStorage
        saveState();
        
        // Close modal and refresh view
        if (studentModal) studentModal.hide();
        setActiveView('students');
        
        // Show success message
        alert(`Student ${studentId ? 'updated' : 'added'} successfully!`);
    }
    
    function deleteStudent(studentId) {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            return;
        }
        
        // Remove student from their class
        const student = state.students[studentId];
        if (student && student.classId) {
            const studentClass = state.classes.find(c => c.id === student.classId);
            if (studentClass) {
                studentClass.students = studentClass.students.filter(id => id !== studentId);
            }
        }
        
        // Delete the student
        delete state.students[studentId];
        saveState();
        
        // Refresh the current view
        const currentView = state.currentView;
        if (currentView === 'students') {
            renderStudents();
        } else if (currentView === 'classes') {
            const currentClass = state.classes.find(c => c.id === state.currentClassId);
            if (currentClass) {
                viewClass(currentClass.id);
            } else {
                renderClasses();
            }
        }
    }
    
    function openBulkImportModal(defaultClassId = null) {
        if (!bulkImportModal) {
            bulkImportModal = new bootstrap.Modal(document.getElementById('bulkImportModal'));
        }
        const modal = bulkImportModal;
        const classSelect = document.getElementById('bulkImportClass');
        
        // Clear and populate class dropdown
        if (classSelect) {
            // Clear existing options except the first one
            while (classSelect.options.length > 1) {
                classSelect.remove(1);
            }
            
            // Add classes to dropdown
            state.classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = `${cls.name} (Grade ${cls.gradeLevel})`;
                option.selected = (defaultClassId === cls.id);
                classSelect.appendChild(option);
            });
        }
        
        // Reset form
        document.getElementById('bulkImportText').value = '';
        document.getElementById('importPreview').classList.add('d-none');
        document.getElementById('processImport').disabled = true;
        
        modal.show();
    }
    
    function parseStudentNames(text) {
        if (!text) return [];
        
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                // Handle "Lastname, Firstname" format
                if (line.includes(',')) {
                    const [last, ...firstParts] = line.split(',').map(part => part.trim());
                    return {
                        firstName: firstParts.join(' '),
                        lastName: last
                    };
                }
                
                // Handle "Firstname Lastname" format
                const parts = line.split(/\s+/);
                if (parts.length === 1) {
                    return { firstName: parts[0], lastName: '' };
                }
                return {
                    firstName: parts.slice(0, -1).join(' '),
                    lastName: parts[parts.length - 1]
                };
            });
    }
    
    function updateImportPreview() {
        const text = document.getElementById('bulkImportText').value;
        const preview = document.getElementById('importPreview');
        const previewBody = document.getElementById('importPreviewBody');
        const importCount = document.getElementById('importCount');
        
        const students = parseStudentNames(text);
        
        if (students.length === 0) {
            preview.classList.add('d-none');
            return;
        }
        
        // Update preview table
        previewBody.innerHTML = students.slice(0, 5).map((student, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
            </tr>
        `).join('');
        
        // Update count
        importCount.textContent = `Total students to import: ${students.length}${students.length > 5 ? ' (showing first 5)' : ''}`;
        
        // Show preview
        preview.classList.remove('d-none');
        
        // Update process button state
        updateProcessImportButton();
    }
    
    function updateProcessImportButton() {
        const processBtn = document.getElementById('processImport');
        const text = document.getElementById('bulkImportText').value;
        const classId = document.getElementById('bulkImportClass').value;
        
        processBtn.disabled = !(text.trim().length > 0 && classId);
    }
    
    function processBulkImport() {
        const textarea = document.getElementById('bulkImportText');
        const classSelect = document.getElementById('bulkImportClass');
        
        if (!textarea || !classSelect) return;
        
        const names = textarea.value.split('\n').filter(name => name.trim());
        const classId = classSelect.value;
        
        if (!classId) {
            alert('Please select a class');
            return;
        }
        
        if (names.length === 0) {
            alert('Please enter at least one student name');
            return;
        }
        
        // Process each name
        const newStudents = [];
        names.forEach(name => {
            const [lastName, firstName] = name.includes(',') 
                ? name.split(',').map(s => s.trim())
                : [null, name.trim()];
                
            const student = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                firstName: firstName || '',
                lastName: lastName || '',
                classId: classId,
                createdAt: new Date().toISOString()
            };
            
            // Add to global students
            state.students[student.id] = student;
            
            // Add to class students
            const classItem = state.classes.find(c => c.id === classId);
            if (classItem) {
                classItem.students = classItem.students || [];
                if (!classItem.students.includes(student.id)) {
                    classItem.students.push(student.id);
                }
            }
            
            newStudents.push(student);
        });
        
        // Save to localStorage
        saveState();
        
        // Close modal
        if (bulkImportModal) bulkImportModal.hide();
        
        // Show success message
        alert(`Successfully imported ${newStudents.length} students to ${classSelect.options[classSelect.selectedIndex].text}`);
        
        // Refresh the view
        if (state.currentView === 'classes') {
            viewClass(classId);
        } else {
            setActiveView('students');
        }
    }
    
    function viewClass(classId) {
        const cls = state.classes.find(c => c.id === classId);
        if (!cls) return;

        // Store current class ID for later use
        state.currentClassId = classId;

        // Get students in this class
        const classStudents = (cls.students || []).map(studentId => state.students[studentId]).filter(Boolean);

        // Generate student rows
        const studentRows = classStudents.length > 0 
            ? classStudents.map(student => `
                <tr>
                    <td>${student.lastName}, ${student.firstName}</td>
                    <td>${student.email || 'N/A'}</td>
                    <td class="text-nowrap">
                        <button class="btn btn-sm btn-outline-primary edit-student" data-id="${student.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-student ms-1" data-id="${student.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('')
            : '<tr><td colspan="3" class="text-center">No students in this class yet.</td></tr>';

        contentArea.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>${cls.name} (Grade ${cls.gradeLevel})</h2>
                <div>
                    <button class="btn btn-primary back-to-dashboard me-2">
                        <i class="fas fa-arrow-left me-1"></i> Back to Classes
                    </button>
                    <button class="btn btn-warning me-2" id="edit-class-${cls.id}">
                        <i class="fas fa-edit me-1"></i> Edit Class
                    </button>
                    <button class="btn btn-danger" id="delete-class-${cls.id}">
                        <i class="fas fa-trash me-1"></i> Delete
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">Class Information</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Grade Level:</strong> ${cls.gradeLevel}</p>
                            <p><strong>Description:</strong> ${cls.description || 'No description'}</p>
                            <p><strong>Students:</strong> ${classStudents.length}</p>
                            <p><strong>Created:</strong> ${new Date(cls.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Students (${classStudents.length})</h5>
                                <div>
                                    <button class="btn btn-sm btn-info me-2" id="bulk-import-class">
                                        <i class="fas fa-file-import me-1"></i> Bulk Import
                                    </button>
                                    <button class="btn btn-sm btn-success" id="add-student-to-class">
                                        <i class="fas fa-plus me-1"></i> Add Student
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${studentRows}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        // Set up event listeners
        const backBtn = document.querySelector('.back-to-dashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => setActiveView('classes'));
        }

        const editBtn = document.getElementById(`edit-class-${cls.id}`);
        if (editBtn) {
            editBtn.addEventListener('click', () => editClass(cls.id));
        }

        const deleteBtn = document.getElementById(`delete-class-${cls.id}`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteClass(cls.id));
        }

        const addStudentBtn = document.getElementById('add-student-to-class');
        if (addStudentBtn) {
            addStudentBtn.addEventListener('click', () => openStudentModal(null, cls.id));
        }

        const bulkImportBtn = document.getElementById('bulk-import-class');
        if (bulkImportBtn) {
            bulkImportBtn.addEventListener('click', () => openBulkImportModal(cls.id));
        }

        // Set up student row event listeners
        document.querySelectorAll('.edit-student').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.id;
                openStudentModal(studentId);
            });
        });

        // Set up delete student event listeners
        const deleteButtons = document.querySelectorAll('.delete-student');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.id;
                deleteStudent(studentId);
            });
        });
    }

    function editClass(classId) {
        const classItem = state.classes.find(c => c.id === classId);
        if (!classItem) return;

        // Pre-fill the form with class data
        const gradeLevel = document.getElementById('gradeLevel');
        const className = document.getElementById('className');
        const classDescription = document.getElementById('classDescription');

        if (gradeLevel) gradeLevel.value = classItem.gradeLevel;
        if (className) className.value = classItem.name;
        if (classDescription) classDescription.value = classItem.description || '';

        // Show the edit modal and set editing mode
        const editModal = new bootstrap.Modal(document.getElementById('addClassModal'));
        editModal.show();

        const form = document.getElementById('addClassForm');
        if (form) {
            form.dataset.editingId = classId;
            document.querySelector('#addClassModal .modal-title').textContent = 'Edit Class';
            document.querySelector('#saveClass').textContent = 'Update Class';
        }
    }
    
    function saveClass() {
        const form = document.getElementById('addClassForm');
        if (!form) return;
        
        const className = document.getElementById('className')?.value.trim();
        const gradeLevel = document.getElementById('gradeLevel')?.value;
        const description = document.getElementById('classDescription')?.value.trim() || '';
        const isEditing = form.dataset.editingId;
        
        if (!className || !gradeLevel) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (isEditing) {
            // Update existing class
            const classId = form.dataset.editingId;
            const classIndex = state.classes.findIndex(c => c.id === classId);
            
            if (classIndex !== -1) {
                // Preserve the existing students array
                const existingStudents = state.classes[classIndex].students || [];
                
                state.classes[classIndex] = {
                    ...state.classes[classIndex],
                    name: className,
                    gradeLevel,
                    description,
                    students: existingStudents, // Keep existing students
                    updatedAt: new Date().toISOString()
                };
                
                localStorage.setItem('teacherClasses', JSON.stringify(state.classes));
                
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addClassModal'));
                if (modal) modal.hide();
                
                // Refresh the appropriate view
                if (state.currentView === 'class' && state.currentClassId === classId) {
                    viewClass(classId);
                } else {
                    renderClasses();
                }
            }
        } else {
            // Create new class
            const newClass = {
                id: Date.now().toString(),
                name: className,
                gradeLevel,
                description,
                students: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            state.classes.push(newClass);
            localStorage.setItem('teacherClasses', JSON.stringify(state.classes));
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addClassModal'));
            if (modal) modal.hide();
            
            // Refresh the classes view
            renderClasses();
        }
        
        // Reset the form
        form.reset();
        if (form.dataset.editingId) {
            delete form.dataset.editingId;
            document.querySelector('#addClassModal .modal-title').textContent = 'Add New Class';
            document.querySelector('#saveClass').textContent = 'Save Class';
        }
    }

    function showCreateLessonModal() {}
    function saveLessonPlan() {}
    function viewLessonPlan() {}
    function editLessonPlan() {}
    function deleteLessonPlan() {}
    function exportData() {}
    function importData() {}
    
    // Return public methods
    return {
        init,
        setActiveView,
        renderDashboard,
        renderClasses,
        renderStudents,
        renderLessons,
        renderGrades,
        renderReports,
        viewClass,
        editClass,
        deleteClass,
        saveClass,
        saveNewClass,
        showCreateLessonModal,
        saveLessonPlan,
        viewLessonPlan,
        editLessonPlan,
        deleteLessonPlan,
        exportData,
        importData,
        openStudentModal,
        saveStudent,
        deleteStudent,
        openBulkImportModal,
        processBulkImport,
        updateImportPreview,
        updateProcessImportButton
    };
})();

// Initialize the application when the DOM is fully loaded
function initializeApp() {
    // Make sure Bootstrap is loaded
    if (typeof bootstrap !== 'undefined') {
        TeacherRecordBook.init();
    } else {
        // If Bootstrap isn't loaded yet, wait for it
        document.addEventListener('DOMContentLoaded', TeacherRecordBook.init);
    }
}

// Start the application
initializeApp();

// Global functions that can be called from HTML
// These are now handled by the TeacherRecordBook object's methods
