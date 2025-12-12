// Level to class mapping
const classes = {
    '7th': Array.from({length: 12}, (_, i) => `1-${i+1}`),
    '8th': Array.from({length: 12}, (_, i) => `2-${i+1}`),
    '9th': Array.from({length: 12}, (_, i) => `3-${i+1}`)
};

// Populate class options for tag system
let selectedClasses = [];
document.addEventListener('DOMContentLoaded', function() {
    const classContainer = document.getElementById('classContainer');
    const classInput = document.getElementById('classInput');
    const classDropdown = document.getElementById('classDropdown');
    const selectedClassesInput = document.getElementById('selectedClasses');
    const allClasses = Object.values(classes).flat();

    function updateDropdown(filter = '') {
        classDropdown.innerHTML = '';
        const filtered = allClasses.filter(cls => cls.toLowerCase().includes(filter.toLowerCase()) && !selectedClasses.includes(cls));
        filtered.forEach(cls => {
            const option = document.createElement('div');
            option.className = 'tag-option';
            option.textContent = cls;
            option.addEventListener('click', () => addTag(cls));
            classDropdown.appendChild(option);
        });
    }

    function addTag(cls) {
        if (!selectedClasses.includes(cls)) {
            selectedClasses.push(cls);
            renderTags();
            updateDropdown(classInput.value);
            updateHiddenInput();
            document.dispatchEvent(new CustomEvent('classSelectionChanged'));
        }
        classInput.value = '';
        classDropdown.style.display = 'none';
    }

    function removeTag(cls) {
        selectedClasses = selectedClasses.filter(c => c !== cls);
        renderTags();
        updateHiddenInput();
        document.dispatchEvent(new CustomEvent('classSelectionChanged'));
    }

    function renderTags() {
        const tags = classContainer.querySelectorAll('.tag');
        tags.forEach(tag => tag.remove());
        selectedClasses.forEach(cls => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `${cls} <span class="remove">&times;</span>`;
            tag.querySelector('.remove').addEventListener('click', () => removeTag(cls));
            classContainer.insertBefore(tag, classInput);
        });
    }

    function updateHiddenInput() {
        selectedClassesInput.value = JSON.stringify(selectedClasses);
    }

    classContainer.addEventListener('click', () => {
        classInput.focus();
        updateDropdown(classInput.value);
        classDropdown.style.display = 'block';
    });

    classInput.addEventListener('input', (e) => {
        updateDropdown(e.target.value);
        classDropdown.style.display = 'block';
    });

    classInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = classInput.value.trim();
            if (value && allClasses.includes(value) && !selectedClasses.includes(value)) {
                addTag(value);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!classContainer.contains(e.target)) {
            classDropdown.style.display = 'none';
        }
    });

    updateDropdown();

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
});

// Model to default stages mapping
const modelStages = {
    'PPP': ['Warm-up', 'Presentation', 'Practice', 'Production'],
    'TTT': ['Test', 'Teacher-led', 'Test'],
    'UDL': ['Engage', 'Explore', 'Explain', 'Elaborate', 'Evaluate'],
    'ECRIF': ['Engage', 'Conceptualize', 'Reflect', 'Investigation', 'Formulate'],
    'OHE': ['Observe', 'Hypothesize', 'Experiment'],
    'Custom': []
};

const stageOptions = `
    <option value="">Select Stage</option>
    <option value="Warm-up">Warm-up</option>
    <option value="Presentation">Presentation</option>
    <option value="Practice">Practice</option>
    <option value="Production">Production</option>
    <option value="Engage">Engage</option>
    <option value="Explore">Explore</option>
    <option value="Explain">Explain</option>
    <option value="Elaborate">Elaborate</option>
    <option value="Evaluate">Evaluate</option>
    <option value="Reflect">Reflect</option>
    <option value="Observation">Observation</option>
    <option value="Hypothesis">Hypothesis</option>
    <option value="Experiment">Experiment</option>
    <option value="Investigation">Investigation</option>
    <option value="Formulate">Formulate</option>
    <option value="Conceptualize">Conceptualize</option>
    <option value="Teacher-led">Teacher-led</option>
    <option value="Transition">Transition</option>
    <option value="Test">Test</option>
    <option value="Other">Other</option>
`;

function createStageRow(selectedStage = '') {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="stage-select">${stageOptions}</select>
        </td>
        <td><input type="text" placeholder="Time"></td>
        <td class="activity-cell">
            <div class="activity-wrapper">
                <div class="activity-tools">
                    <button type="button" class="activity-snippets" title="Insert common activity snippet">Snippets</button>
                    <label class="activity-upload-btn" title="Upload or paste an image">
                        <input type="file" accept="image/*" class="activity-upload" hidden>
                        <span><i class="fas fa-upload"></i> Upload</span>
                    </label>
                </div>
                <div class="activity-input" contenteditable="true" data-placeholder="Activity details or paste images"></div>
            </div>
        </td>
        <td><input type="text" placeholder="Purpose"></td>
        <td>
            <select>
                <option value="">Select</option>
                <option value="Individual work">Individual</option>
                <option value="Pair work">Pair work</option>
                <option value="Group work">Group work</option>
            </select>
        </td>
        <td>
            <select>
                <option value="">Select</option>
                <option value="Teacher-Student">T-S</option>
                <option value="Student-Teacher">S-T</option>
                <option value="Student-Student">S-S</option>
            </select>
        </td>
        <td data-label="Action"><button type="button" class="remove-row">Remove</button></td>
    `;
    row.querySelector('.stage-select').value = selectedStage;
    attachActivityHandlers(row);
    return row;
}

// Pre-fill stages based on model selection
document.getElementById('model').addEventListener('change', function() {
    const model = this.value;
    const tbody = document.querySelector('#stagesTable tbody');
    tbody.innerHTML = '';

    if (model && modelStages[model]) {
        modelStages[model].forEach(stage => {
            tbody.appendChild(createStageRow(stage));
        });
    }

    if (tbody.children.length === 0) {
        tbody.appendChild(createStageRow());
    }
});

function insertAtCaret(target, node) {
    if (!target || !node) return;
    const selection = window.getSelection();
    const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
    const canInsert = range && target.contains(range.commonAncestorContainer);
    if (canInsert) {
        range.deleteContents();
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        target.appendChild(node);
    }
}

function handleImageFile(inputEl, file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    const activityInput = inputEl.closest('.activity-wrapper')?.querySelector('.activity-input');
    if (!activityInput) return;
    reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        img.alt = file.name;
        img.style.maxWidth = '100%';
        img.style.display = 'block';
        insertAtCaret(activityInput, img);
        inputEl.value = '';
    };
    reader.readAsDataURL(file);
}

function handleActivityPaste(event) {
    const { clipboardData } = event;
    if (!event.target.classList.contains('activity-input')) return;
    if (!clipboardData) return;
    const items = clipboardData.items;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            handleImageFile(event.target, file);
            break;
        }
    }
}

const activitySnippets = [
    'Students brainstorm examples with a partner before sharing.',
    'Use flashcards to elicit key vocabulary and model pronunciation.',
    'Group discussion followed by quick write-up on chart paper.',
    'Students complete a short formative quiz using mini whiteboards.'
];

function openSnippetPicker(activityInput) {
    if (!activityInput) return;
    const snippet = prompt('Choose or edit an activity snippet:', activitySnippets[0]);
    if (snippet) {
        const textNode = document.createTextNode(snippet);
        insertAtCaret(activityInput, textNode);
    }
}

function attachActivityHandlers(row) {
    const activityInput = row.querySelector('.activity-input');
    const uploadInput = row.querySelector('.activity-upload');
    const snippetBtn = row.querySelector('.activity-snippets');

    activityInput?.addEventListener('paste', handleActivityPaste);
    uploadInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        handleImageFile(uploadInput, file);
    });
    snippetBtn?.addEventListener('click', () => {
        openSnippetPicker(activityInput);
    });
}

// Dynamic objectives list
document.getElementById('objectivesList').addEventListener('click', function(e) {
    if (e.target.classList.contains('add')) {
        const list = e.target.closest('#objectivesList');
        const newItem = list.lastElementChild.cloneNode(true);
        const inputs = newItem.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        newItem.querySelector('.remove').disabled = false;
        list.appendChild(newItem);
        updateNumbers(list);
    } else if (e.target.classList.contains('remove')) {
        const list = e.target.closest('#objectivesList');
        if (list.children.length > 1) {
            e.target.closest('.dynamic-list').remove();
            updateNumbers(list);
        }
    }
});

function updateNumbers(list) {
    const items = list.querySelectorAll('.dynamic-list');
    items.forEach((item, index) => {
        item.querySelector('.number').textContent = (index + 1) + '.';
    });
}

// Dynamic materials checklist
document.getElementById('materialsList').addEventListener('click', function(e) {
    if (e.target.classList.contains('add')) {
        const list = e.target.closest('#materialsList');
        const newItem = list.lastElementChild.cloneNode(true);
        const inputs = newItem.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        newItem.querySelector('input[type="checkbox"]').checked = false;
        newItem.querySelector('.remove').disabled = false;
        list.appendChild(newItem);
    } else if (e.target.classList.contains('remove')) {
        const list = e.target.closest('#materialsList');
        if (list.children.length > 1) {
            e.target.closest('.checklist-item').remove();
        }
    }
});

console.log('Archive functionality loaded successfully');

// Lesson planner actions
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const viewArchiveBtn = document.getElementById('viewArchiveBtn');
    const exportPdfBtn = document.getElementById('exportPdf');
    const exportDocxBtn = document.getElementById('exportDocx');
    const stagesTableBody = document.querySelector('#stagesTable tbody');
    const addRowBtn = document.getElementById('addRow');
    const preview = document.getElementById('preview');
    const previewContent = document.getElementById('previewContent');
    let latestPlan = null;

    stagesTableBody?.querySelectorAll('tr').forEach(attachActivityHandlers);

    function ensureOneStageRow() {
        if (stagesTableBody && stagesTableBody.children.length === 0) {
            stagesTableBody.appendChild(createStageRow());
        }
    }

    addRowBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        stagesTableBody?.appendChild(createStageRow());
    });

    stagesTableBody?.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-row')) {
            const rows = stagesTableBody.querySelectorAll('tr');
            if (rows.length > 1) {
                e.target.closest('tr')?.remove();
            }
        }
    });

    ensureOneStageRow();

    function getObjectives() {
        return Array.from(document.querySelectorAll('#objectivesList .dynamic-list input'))
            .map(input => input.value.trim())
            .filter(text => text.length);
    }

    function getMaterials() {
        return Array.from(document.querySelectorAll('#materialsList .checklist-item')).map(item => ({
            text: item.querySelector('input[type="text"]').value.trim(),
            prepared: item.querySelector('input[type="checkbox"]').checked
        })).filter(material => material.text.length);
    }

function getStages() {
    return Array.from(document.querySelectorAll('#stagesTable tbody tr')).map(row => {
        const stageSelect = row.querySelector('.stage-select');
        const timeInput = row.querySelector('td:nth-child(2) input');
        const activityInput = row.querySelector('.activity-input');
        const purposeInput = row.querySelector('td:nth-child(4) input');
        const groupingSelect = row.querySelector('td:nth-child(5) select');
        const interactionSelect = row.querySelector('td:nth-child(6) select');

        const activityHtml = (activityInput?.innerHTML || '').trim();
        const activityText = (activityInput?.textContent || '').trim();

        return {
            stage: stageSelect?.value || '',
            time: timeInput?.value.trim() || '',
            activityHtml,
            activityText,
            purpose: purposeInput?.value.trim() || '',
            grouping: groupingSelect?.value || '',
            interaction: interactionSelect?.value || ''
        };
    }).filter(stage => stage.stage || stage.time || stage.activityHtml || stage.purpose || stage.grouping || stage.interaction);
}

    function collectFormData() {
        const selectedClassesInput = document.getElementById('selectedClasses');
        let classesChosen = [];
        try {
            classesChosen = JSON.parse(selectedClassesInput.value || '[]');
        } catch (err) {
            classesChosen = [];
        }

        return {
            teacher: document.getElementById('teacher').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            level: document.getElementById('level').value,
            classGroups: classesChosen,
            course: document.getElementById('course').value.trim(),
            lessonTitle: document.getElementById('lessonTitle').value.trim(),
            date: document.getElementById('date').value,
            timing: document.getElementById('timing').value.trim(),
            model: document.getElementById('model').value,
            objectives: getObjectives(),
            materials: getMaterials(),
            differentiation: document.getElementById('differentiation').value.trim(),
            desiredOutcomes: document.getElementById('desiredOutcomes').value.trim(),
            lessonFocus: document.getElementById('lessonFocus').value.trim(),
            targetLanguage: document.getElementById('targetLanguage').value.trim(),
            classroomManagement: document.getElementById('classroomManagement').value.trim(),
            engaging: document.getElementById('engaging').value.trim(),
            reflective: document.getElementById('reflective').value.trim(),
            stages: getStages(),
            assessment: document.getElementById('assessment').value.trim(),
            reflection: document.getElementById('reflection').value.trim()
        };
    }

    function buildListMarkup(items) {
        if (!items.length) return '<p><em>No items provided.</em></p>';
        return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }

    function buildMaterialsMarkup(materials) {
        if (!materials.length) return '<p><em>No materials listed.</em></p>';
        return `<ul>${materials.map(m => `<li>${m.text} ${m.prepared ? '(Prepared)' : ''}</li>`).join('')}</ul>`;
    }

function buildStagesMarkup(stages) {
    if (!stages.length) return '<p><em>No lesson stages added.</em></p>';
    const rows = stages.map(stage => `
            <tr>
                <td>${stage.stage || '-'}</td>
                <td>${stage.time || '-'}</td>
                <td>${stage.activityHtml || '-'}</td>
                <td>${stage.purpose || '-'}</td>
                <td>${stage.grouping || '-'}</td>
                <td>${stage.interaction || '-'}</td>
            </tr>`).join('');
        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ccc; padding: 6px;">Stage</th>
                        <th style="border: 1px solid #ccc; padding: 6px;">Time</th>
                        <th style="border: 1px solid #ccc; padding: 6px;">Activity</th>
                        <th style="border: 1px solid #ccc; padding: 6px;">Purpose</th>
                        <th style="border: 1px solid #ccc; padding: 6px;">Grouping</th>
                        <th style="border: 1px solid #ccc; padding: 6px;">Interaction</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>`;
    }

    function renderPreview(data) {
        const html = `
            <div class="preview-section">
                <h3>Lesson Overview</h3>
                <p><strong>Teacher:</strong> ${data.teacher || '—'}</p>
                <p><strong>Subject:</strong> ${data.subject || '—'}</p>
                <p><strong>Level:</strong> ${data.level || '—'}</p>
                <p><strong>Class(es):</strong> ${data.classGroups.length ? data.classGroups.join(', ') : '—'}</p>
                <p><strong>Course:</strong> ${data.course || '—'}</p>
                <p><strong>Lesson Title:</strong> ${data.lessonTitle || '—'}</p>
                <p><strong>Date:</strong> ${data.date || '—'}</p>
                <p><strong>Duration:</strong> ${data.timing || '—'}</p>
                <p><strong>Model:</strong> ${data.model || '—'}</p>
            </div>
            <div class="preview-section">
                <h3>Objectives</h3>
                ${buildListMarkup(data.objectives)}
            </div>
            <div class="preview-section">
                <h3>Materials</h3>
                ${buildMaterialsMarkup(data.materials)}
            </div>
            <div class="preview-section">
                <h3>Differentiation</h3>
                <p>${data.differentiation || '<em>No differentiation notes.</em>'}</p>
            </div>
            <div class="preview-section">
                <h3>Desired Outcomes</h3>
                <p>${data.desiredOutcomes || '<em>No outcomes provided.</em>'}</p>
            </div>
            <div class="preview-section">
                <h3>Lesson Focus</h3>
                <p>${data.lessonFocus || '<em>No focus provided.</em>'}</p>
            </div>
            <div class="preview-section">
                <h3>Target Language</h3>
                <p>${data.targetLanguage || '<em>No target language specified.</em>'}</p>
            </div>
            <div class="preview-section">
                <h3>Management Plans</h3>
                <p>${data.classroomManagement || '<em>No classroom management plan.</em>'}</p>
            </div>
            <div class="preview-section">
                <h3>Engaging and Reflective Practices</h3>
                <p>${data.engaging || '<em>No engagement notes.</em>'}</p>
                <p>${data.reflective || '<em>No reflection notes.</em>'}</p>
            </div>
            <div class="preview-section">
                <h3>Lesson Stages</h3>
                ${buildStagesMarkup(data.stages)}
            </div>
            <div class="preview-section">
                <h3>Assessment</h3>
                <p>${data.assessment || '<em>No assessment details.</em>'}</p>
            </div>
            <div class="preview-section">
                <h3>Reflection & Notes</h3>
                <p>${data.reflection || '<em>No reflections added.</em>'}</p>
            </div>
        `;

        latestPlan = { data, html };
        previewContent.innerHTML = html;
        preview.style.display = 'block';
        preview.scrollIntoView({ behavior: 'smooth' });
    }

    function saveLocally() {
        if (!latestPlan) {
            latestPlan = { data: collectFormData(), html: '' };
            latestPlan.html = renderAndReturnHTML(latestPlan.data);
        }
        const archive = JSON.parse(localStorage.getItem('lessonPlans') || '[]');
        archive.unshift({ ...latestPlan, savedAt: new Date().toISOString() });
        localStorage.setItem('lessonPlans', JSON.stringify(archive));
        alert('Lesson plan saved locally.');
    }

    function renderAndReturnHTML(data) {
        const html = previewContent.innerHTML || renderPreview(data);
        return html || previewContent.innerHTML;
    }

    function openArchive() {
        const archive = JSON.parse(localStorage.getItem('lessonPlans') || '[]');
        if (!archive.length) {
            alert('No saved lesson plans found.');
            return;
        }
        const archiveWindow = window.open('', 'LessonPlanArchive');
        archiveWindow.document.write('<html><head><title>Lesson Plan Archive</title></head><body style="font-family: Arial, sans-serif; padding: 16px;"></body></html>');
        const body = archiveWindow.document.body;
        const title = archiveWindow.document.createElement('h2');
        title.textContent = 'Saved Lesson Plans';
        body.appendChild(title);

        archive.forEach((item, index) => {
            const wrapper = archiveWindow.document.createElement('div');
            wrapper.style.border = '1px solid #ccc';
            wrapper.style.padding = '10px';
            wrapper.style.marginBottom = '10px';
            wrapper.innerHTML = `
                <strong>${item.data.lessonTitle || 'Untitled Lesson'}</strong><br>
                <small>Saved: ${new Date(item.savedAt).toLocaleString()}</small><br>
                <small>Teacher: ${item.data.teacher || '—'}</small>
            `;

            const viewBtn = archiveWindow.document.createElement('button');
            viewBtn.textContent = 'View';
            viewBtn.style.marginTop = '6px';
            viewBtn.addEventListener('click', () => {
                previewContent.innerHTML = item.html;
                preview.style.display = 'block';
                latestPlan = item;
                window.focus();
            });
            wrapper.appendChild(viewBtn);
            body.appendChild(wrapper);
        });
    }

    function exportPdf() {
        if (!latestPlan) {
            renderPreview(collectFormData());
        }
        const doc = new window.jspdf.jsPDF({ unit: 'pt' });
        let y = 40;
        doc.setFontSize(18);
        doc.text('Lesson Plan', 300, y, { align: 'center' });
        doc.setFontSize(12);
        y += 24;

        const data = latestPlan.data;
        const overview = [
            `Teacher: ${data.teacher || '—'}`,
            `Subject: ${data.subject || '—'}`,
            `Level: ${data.level || '—'}`,
            `Classes: ${data.classGroups.length ? data.classGroups.join(', ') : '—'}`,
            `Course: ${data.course || '—'}`,
            `Lesson Title: ${data.lessonTitle || '—'}`,
            `Date: ${data.date || '—'}`,
            `Duration: ${data.timing || '—'}`,
            `Model: ${data.model || '—'}`
        ];

        overview.forEach(line => {
            doc.text(line, 40, y);
            y += 16;
        });

        function addSection(title, contentLines) {
            doc.setFont(undefined, 'bold');
            doc.text(title, 40, y);
            doc.setFont(undefined, 'normal');
            y += 16;
            contentLines.forEach(line => {
                const split = doc.splitTextToSize(line, 520);
                split.forEach(txt => {
                    doc.text(txt, 50, y);
                    y += 14;
                });
            });
            y += 8;
        }

        addSection('Objectives', data.objectives.length ? data.objectives : ['No objectives provided.']);
        addSection('Materials', data.materials.length ? data.materials.map(m => `${m.text}${m.prepared ? ' (Prepared)' : ''}`) : ['No materials listed.']);
        addSection('Differentiation', [data.differentiation || 'No differentiation notes.']);
        addSection('Desired Outcomes', [data.desiredOutcomes || 'No outcomes provided.']);
        addSection('Lesson Focus', [data.lessonFocus || 'No focus provided.']);
        addSection('Target Language', [data.targetLanguage || 'No target language specified.']);
        addSection('Classroom Management', [data.classroomManagement || 'No classroom management plan.']);
        addSection('Engaging & Reflective Practices', [data.engaging || 'No engagement notes.', data.reflective || 'No reflection notes.']);

        if (data.stages.length) {
            const tableData = data.stages.map(stage => [
                stage.stage || '-',
                stage.time || '-',
                stage.activityText || '-',
                stage.purpose || '-',
                stage.grouping || '-',
                stage.interaction || '-'
            ]);
            doc.autoTable({
                startY: y,
                head: [['Stage', 'Time', 'Activity', 'Purpose', 'Grouping', 'Interaction']],
                body: tableData,
                styles: { fontSize: 10, cellPadding: 4 }
            });
            y = doc.lastAutoTable.finalY + 16;
        }

        addSection('Assessment', [data.assessment || 'No assessment details.']);
        addSection('Reflection', [data.reflection || 'No reflections added.']);

        doc.save('lesson-plan.pdf');
    }

    function exportDocx() {
        if (!latestPlan) {
            renderPreview(collectFormData());
        }
        const docContent = `
            <html><head><meta charset="utf-8"></head><body>
            <h1 style="text-align:center;">Lesson Plan</h1>
            ${previewContent.innerHTML}
            </body></html>`;
        const blob = window.htmlDocx.asBlob(docContent);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lesson-plan.docx';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    generateBtn?.addEventListener('click', () => {
        const data = collectFormData();
        renderPreview(data);
    });

    saveBtn?.addEventListener('click', saveLocally);
    viewArchiveBtn?.addEventListener('click', openArchive);
    exportPdfBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        exportPdf();
    });
    exportDocxBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        exportDocx();
    });
});
