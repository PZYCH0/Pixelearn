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
        }
        classInput.value = '';
        classDropdown.style.display = 'none';
    }

    function removeTag(cls) {
        selectedClasses = selectedClasses.filter(c => c !== cls);
        renderTags();
        updateHiddenInput();
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
    'OE': ['Observation', 'Experiment'],
    'Custom': []
};

// Pre-fill stages based on model selection
document.getElementById('model').addEventListener('change', function() {
    const model = this.value;
    const tbody = document.querySelector('#stagesTable tbody');
    tbody.innerHTML = '';

    if (model && modelStages[model]) {
        modelStages[model].forEach(stage => {
            const newRow = createStageRow(stage);
            tbody.appendChild(newRow);
        });
    }

    if (tbody.children.length === 0) {
        const newRow = createStageRow('');
        tbody.appendChild(newRow);
    }
});

function createStageRow(stageValue) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="stage-select">
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
            </select>
        </td>
        <td><input type="text" placeholder="Time"></td>
        <td><input type="text" placeholder="Activity"></td>
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
        <td><button type="button" class="remove-row">Remove</button></td>
    `;
    if (stageValue) {
        row.querySelector('.stage-select').value = stageValue;
    }
    return row;
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

// Dynamic stages table
document.getElementById('addRow').addEventListener('click', function() {
    const tbody = document.querySelector('#stagesTable tbody');
    const newRow = createStageRow('');
    tbody.appendChild(newRow);
});

document.getElementById('stagesTable').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-row')) {
        const tbody = document.querySelector('#stagesTable tbody');
        if (tbody.children.length > 1) {
            e.target.closest('tr').remove();
        }
    }
});

// Function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Generate preview - THE MAIN FUNCTION
document.getElementById('generateBtn').addEventListener('click', function() {
    const form = document.getElementById('lessonForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const selectedClassesValue = document.getElementById('selectedClasses').value;
    const selectedClasses = selectedClassesValue ? JSON.parse(selectedClassesValue) : [];
    
    if (selectedClasses.length === 0) {
        alert('Please select at least one class.');
        return;
    }

    const levelSelect = document.getElementById('level');
    const modelSelect = document.getElementById('model');
    
    const data = {
        teacherName: escapeHtml(document.getElementById('teacherName').value),
        institution: escapeHtml(document.getElementById('institution').value),
        date: escapeHtml(document.getElementById('date').value),
        level: levelSelect.options[levelSelect.selectedIndex].text,
        class: selectedClasses,
        model: modelSelect.options[modelSelect.selectedIndex].text,
        unit: escapeHtml(document.getElementById('unit').value),
        lessonTitle: escapeHtml(document.getElementById('lessonTitle').value),
        duration: escapeHtml(document.getElementById('duration').value),
        objectives: Array.from(document.querySelectorAll('#objectivesList input[type="text"]'))
            .map(input => escapeHtml(input.value))
            .filter(val => val.trim()),
        materials: Array.from(document.querySelectorAll('#materialsList .checklist-item'))
            .map(item => ({
                checked: item.querySelector('input[type="checkbox"]').checked,
                text: escapeHtml(item.querySelector('input[type="text"]').value)
            }))
            .filter(item => item.text.trim()),
        stages: Array.from(document.querySelectorAll('#stagesTable tbody tr'))
            .map(row => ({
                stage: row.cells[0].querySelector('select').value,
                time: escapeHtml(row.cells[1].querySelector('input').value),
                activity: escapeHtml(row.cells[2].querySelector('input').value),
                purpose: escapeHtml(row.cells[3].querySelector('input').value),
                means: row.cells[4].querySelector('select').value,
                mode: row.cells[5].querySelector('select').value
            }))
            .filter(stage => stage.stage || stage.activity),
        assessment: escapeHtml(document.getElementById('assessment').value),
        reflection: escapeHtml(document.getElementById('reflection').value)
    };

    const contentHtml = `
        <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #9b59b6;">
            <h3 style="font-size: 1.8em; margin-bottom: 5px;">${data.teacherName}</h3>
            <p style="font-size: 1.2em; color: #7f8c8d;">${data.institution}</p>
        </div>

        <div style="background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div><strong>Date:</strong> ${data.date}</div>
                <div><strong>Level:</strong> ${data.level}</div>
                <div><strong>Classes:</strong> ${data.class.join(', ')}</div>
                <div><strong>Model:</strong> ${data.model}</div>
                <div><strong>Duration:</strong> ${data.duration}</div>
            </div>
        </div>
        <div style="margin-bottom: 25px;">
            <div style="background: #9b59b6; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold;">
                <i class="fas fa-book"></i> Unit & Lesson
            </div>
            <div style="padding: 15px; background: #ecf0f1; border-radius: 0 0 8px 8px;">
                <strong>Unit:</strong> ${data.unit}<br>
                <strong>Lesson Title:</strong> ${data.lessonTitle}
            </div>
        </div>
        <div style="margin-bottom: 25px;">
            <div style="background: #27ae60; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold;">
                <i class="fas fa-bullseye"></i> Learning Objectives
            </div>
            <div style="padding: 15px; background: #ecf0f1; border-radius: 0 0 8px 8px;">
                Students will be able to:<br>
                <ol style="margin: 0; padding-left: 20px;">
                    ${data.objectives.map(obj => `<li style="margin-bottom: 8px;">${obj}</li>`).join('')}
                </ol>
            </div>
        </div>
        <div style="margin-bottom: 25px;">
            <div style="background: #e67e22; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold;">
                <i class="fas fa-toolbox"></i> Materials Needed
            </div>
            <div style="padding: 15px; background: #ecf0f1; border-radius: 0 0 8px 8px;">
                <ul style="list-style: none; margin: 0; padding: 0;">
                    ${data.materials.map(mat => `<li style="margin-bottom: 8px;"><span style="color: ${mat.checked ? '#27ae60' : '#95a5a6'};">${mat.checked ? '&#10004;' : '&#9711;'}</span> ${mat.text}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div style="margin-bottom: 25px;">
            <div style="background: #9b59b6; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold;">
                <i class="fas fa-tasks"></i> Lesson Stages
            </div>
            <div style="padding: 15px; background: #ecf0f1; border-radius: 0 0 8px 8px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white;">
                    <thead>
                        <tr style="background: #34495e; color: white;">
                            <th style="border: 1px solid #7f8c8d; padding: 10px;">Stage</th>
                            <th style="border: 1px solid #7f8c8d; padding: 10px;">Time</th>
                            <th style="border: 1px solid #7f8c8d; padding: 10px;">Activity</th>
                            <th style="border: 1px solid #7f8c8d; padding: 10px;">Purpose</th>
                            <th style="border: 1px solid #7f8c8d; padding: 10px;">Means</th>
                            <th style="border: 1px solid #7f8c8d; padding: 10px;">Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.stages.map((stage, i) => `
                            <tr style="background: ${i % 2 === 0 ? '#fff' : '#f8f9fa'};">
                                <td style="border: 1px solid #dee2e6; padding: 10px;"><strong>${stage.stage}</strong></td>
                                <td style="border: 1px solid #dee2e6; padding: 10px;">${stage.time}</td>
                                <td style="border: 1px solid #dee2e6; padding: 10px;">${stage.activity}</td>
                                <td style="border: 1px solid #dee2e6; padding: 10px;">${stage.purpose}</td>
                                <td style="border: 1px solid #dee2e6; padding: 10px;">${stage.means}</td>
                                <td style="border: 1px solid #dee2e6; padding: 10px;">${stage.mode}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ${data.assessment.trim() ? `
        <div style="margin-bottom: 25px;">
            <div style="background: #e74c3c; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold;">
                <i class="fas fa-clipboard-check"></i> Assessment
            </div>
            <div style="padding: 15px; background: #ecf0f1; border-radius: 0 0 8px 8px;">
                ${data.assessment.replace(/\n/g, '<br>')}
            </div>
        </div>
        ` : ''}
        ${data.reflection.trim() ? `
        <div style="margin-bottom: 25px;">
            <div style="background: #16a085; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; font-weight: bold;">
                <i class="fas fa-sticky-note"></i> Reflection & Notes
            </div>
            <div style="padding: 15px; background: #ecf0f1; border-radius: 0 0 8px 8px;">
                ${data.reflection.replace(/\n/g, '<br>')}
            </div>
        </div>
        ` : ''}
    `;
    
    // Try to open in new tab
    const newWin = window.open('', '_blank');
    
    if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        // Popup blocked fallback
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = contentHtml;
        document.getElementById('preview').style.display = 'block';
        document.getElementById('preview').scrollIntoView({ behavior: 'smooth' });
        alert('Pop-up blocked! Showing preview below instead.');
        return;
    }

    // Build preview document
    const docHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lesson Plan Preview - ${data.lessonTitle}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0; 
    padding: 30px; 
    line-height: 1.6;
  }
  .page {
    max-width: 1223px;
    margin: 0 auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    padding: 40px;
  }
  h2, h3 { margin-top: 0; color: #2c3e50; }
  .print-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
    transition: all 0.3s;
    z-index: 1000;
  }
  .print-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(155, 89, 182, 0.4);
  }
  @media print { 
    body { background: #fff; padding: 0; }
    .page { box-shadow: none; border-radius: 0; padding: 20px; }
    .print-btn { display: none; }
  }
</style>
</head>
<body>
  <button class="print-btn" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
  <div class="page">
    ${contentHtml}
  </div>
</body>
</html>`;

    newWin.document.open();
    newWin.document.write(docHtml);
    newWin.document.close();
    
    // Also show inline preview
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = contentHtml;
    document.getElementById('preview').style.display = 'block';
});

console.log('Lesson Planner JS loaded successfully!');

// PDF Export Function
document.getElementById('exportPdf').addEventListener('click', function() {
    console.log('Starting PDF export...');

    try {
        // Collect form data the same way as generate function
        const selectedClassesValue = document.getElementById('selectedClasses').value;
        const selectedClasses = selectedClassesValue ? JSON.parse(selectedClassesValue) : [];

        const levelSelect = document.getElementById('level');
        const modelSelect = document.getElementById('model');

        const data = {
            teacherName: escapeHtml(document.getElementById('teacherName').value),
            institution: escapeHtml(document.getElementById('institution').value),
            date: escapeHtml(document.getElementById('date').value),
            level: levelSelect.options[levelSelect.selectedIndex].text,
            class: selectedClasses,
            model: modelSelect.options[modelSelect.selectedIndex].text,
            unit: escapeHtml(document.getElementById('unit').value),
            lessonTitle: escapeHtml(document.getElementById('lessonTitle').value),
            duration: escapeHtml(document.getElementById('duration').value),
            objectives: Array.from(document.querySelectorAll('#objectivesList input[type="text"]'))
                .map(input => escapeHtml(input.value))
                .filter(val => val.trim()),
            materials: Array.from(document.querySelectorAll('#materialsList .checklist-item'))
                .map(item => ({
                    checked: item.querySelector('input[type="checkbox"]').checked,
                    text: escapeHtml(item.querySelector('input[type="text"]').value)
                }))
                .filter(item => item.text.trim()),
            stages: Array.from(document.querySelectorAll('#stagesTable tbody tr'))
                .map(row => ({
                    stage: row.cells[0].querySelector('select').value,
                    time: escapeHtml(row.cells[1].querySelector('input').value),
                    activity: escapeHtml(row.cells[2].querySelector('input').value),
                    purpose: escapeHtml(row.cells[3].querySelector('input').value),
                    means: row.cells[4].querySelector('select').value,
                    mode: row.cells[5].querySelector('select').value
                }))
                .filter(stage => stage.stage || stage.activity),
            assessment: escapeHtml(document.getElementById('assessment').value),
            reflection: escapeHtml(document.getElementById('reflection').value)
        };

        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set up fonts and colors
        doc.setFont('helvetica', 'normal');
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(data.teacherName, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(data.institution, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        // Header Info Section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Header Information', margin, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        const headerInfo = [
            `Date: ${data.date}`,
            `Level: ${data.level}`,
            `Classes: ${data.class.join(', ')}`,
            `Model: ${data.model}`,
            `Duration: ${data.duration}`
        ];

        headerInfo.forEach(line => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += 7;
        });
        yPosition += 10;

        // Unit & Lesson Section
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Unit & Lesson', margin, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        doc.text(`Unit: ${data.unit}`, margin, yPosition);
        yPosition += 7;
        doc.text(`Lesson Title: ${data.lessonTitle}`, margin, yPosition);
        yPosition += 15;

        // Learning Objectives Section
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Learning Objectives', margin, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        doc.text('Students will be able to:', margin, yPosition);
        yPosition += 7;

        data.objectives.forEach((obj, index) => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(`${index + 1}. ${obj}`, margin + 10, yPosition);
            yPosition += 7;
        });
        yPosition += 10;

        // Materials Section
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Materials Needed', margin, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        data.materials.forEach(mat => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            const checkmark = mat.checked ? '[✓]' : '[ ]';
            doc.text(`${checkmark} ${mat.text}`, margin, yPosition);
            yPosition += 7;
        });
        yPosition += 10;

        // Lesson Stages Table
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Lesson Stages', margin, yPosition);
        yPosition += 10;

        const tableData = data.stages.map(stage => [
            stage.stage,
            stage.time,
            stage.activity,
            stage.purpose,
            stage.means,
            stage.mode
        ]);

        doc.autoTable({
            startY: yPosition,
            head: [['Stage', 'Time', 'Activity', 'Purpose', 'Means', 'Mode']],
            body: tableData,
            margin: { left: margin, right: margin },
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [155, 89, 182], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 20 },
                2: { cellWidth: 40 },
                3: { cellWidth: 35 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 }
            }
        });

        yPosition = doc.lastAutoTable.finalY + 15;

        // Assessment Section
        if (data.assessment.trim()) {
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text('Assessment', margin, yPosition);
            yPosition += 10;

            doc.setFont('helvetica', 'normal');
            const assessmentLines = doc.splitTextToSize(data.assessment, contentWidth);
            assessmentLines.forEach(line => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, margin, yPosition);
                yPosition += 7;
            });
            yPosition += 10;
        }

        // Reflection Section
        if (data.reflection.trim()) {
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text('Reflection & Notes', margin, yPosition);
            yPosition += 10;

            doc.setFont('helvetica', 'normal');
            const reflectionLines = doc.splitTextToSize(data.reflection, contentWidth);
            reflectionLines.forEach(line => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, margin, yPosition);
                yPosition += 7;
            });
        }

        // Add page numbers
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        // Save the PDF
        doc.save('lesson_plan.pdf');
        console.log('PDF export completed successfully');

    } catch (error) {
        console.error('PDF export failed:', error);
        alert('Failed to export PDF. Please check console for details.');
    }
});

// DOCX Export Function
document.getElementById('exportDocx').addEventListener('click', function() {
    console.log('Starting DOCX export...');

    try {
        // Get the preview content HTML
        const previewContent = document.getElementById('previewContent');
        if (!previewContent || !previewContent.innerHTML.trim()) {
            alert('Please generate the lesson plan preview first.');
            return;
        }

        // Create a temporary HTML document for conversion
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Lesson Plan</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h3 { color: #8e44ad; margin-bottom: 10px; }
                    strong { color: #2c3e50; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
                    th { background-color: #34495e; color: white; }
                    tr:nth-child(even) { background-color: #f8f9fa; }
                    ol { margin: 0; padding-left: 20px; }
                    ul { margin: 0; padding-left: 20px; }
                    li { margin-bottom: 5px; }
                </style>
            </head>
            <body>
                ${previewContent.innerHTML}
            </body>
            </html>
        `;

        // Convert HTML to DOCX
        const converted = htmlDocx.asBlob(htmlContent);

        // Create download link
        const url = URL.createObjectURL(converted);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'lesson_plan.docx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('DOCX export completed successfully');

    } catch (error) {
        console.error('DOCX export failed:', error);
        alert('Failed to export DOCX. Please check console for details. Make sure the html-docx-js library is loaded properly.');
    }
});

console.log('Export functions loaded successfully');
