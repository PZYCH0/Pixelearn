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

// Function to process activity text with images
function processActivityText(text) {
    if (!text) return '';
    
    // Handle both [IMAGE:base64] and ![alt](url) markdown syntax
    let result = text;
    
    // Replace [IMAGE:base64] with img tag
    result = result.replace(/\[IMAGE:([^\]]+)\]/g, '<br><img src="$1" style="max-width: 350px; height: auto; border: 1px solid #ddd; border-radius: 4px; margin: 5px 0; display: inline-block;" alt="Activity Image"><br>');
    
    // Replace ![alt](url) markdown with img tag
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<br><img src="$2" alt="$1" style="max-width: 350px; height: auto; border: 1px solid #ddd; border-radius: 4px; margin: 5px 0; display: inline-block;"><br>');
    
    return result;
}

// Function to display image preview in input field
function displayImagePreview(activityInput, base64Data) {
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background: #e8f5e8;
        border: 1px solid #27ae60;
        border-radius: 4px;
        margin: 2px;
        font-size: 0.9em;
        position: relative;
    `;
    
    // Create actual image thumbnail
    const imgThumbnail = document.createElement('img');
    imgThumbnail.src = base64Data;
    imgThumbnail.style.cssText = `
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #ddd;
    `;
    
    const text = document.createElement('span');
    text.textContent = 'Image';
    text.style.color = '#27ae60';
    text.style.fontWeight = '600';
    text.style.fontSize = '0.8em';
    
    const removeBtn = document.createElement('span');
    removeBtn.innerHTML = '&times;';
    removeBtn.style.cssText = `
        cursor: pointer;
        color: #e74c3c;
        font-weight: bold;
        margin-left: 5px;
        background: rgba(255,255,255,0.8);
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    `;
    removeBtn.onclick = () => {
        previewContainer.remove();
        const imageTag = `[IMAGE:${base64Data}]`;
        activityInput.value = activityInput.value.replace(imageTag, '').trim();
    };
    
    previewContainer.appendChild(imgThumbnail);
    previewContainer.appendChild(text);
    previewContainer.appendChild(removeBtn);
    previewContainer.dataset.imageData = base64Data;
    
    // Add hover effect to show full image (only on the thumbnail)
    imgThumbnail.addEventListener('mouseenter', function() {
        const fullPreview = document.createElement('div');
        fullPreview.id = 'image-full-preview';
        fullPreview.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 80%;
            max-height: 80%;
        `;
        
        const fullImg = document.createElement('img');
        fullImg.src = base64Data;
        fullImg.style.cssText = `
            max-width: 100%;
            max-height: 70vh;
            border-radius: 4px;
        `;
        
        fullPreview.appendChild(fullImg);
        document.body.appendChild(fullPreview);
        
        // Remove on mouseleave
        fullPreview.addEventListener('mouseleave', function() {
            fullPreview.remove();
        });
    });
    
    imgThumbnail.addEventListener('mouseleave', function() {
        const fullPreview = document.getElementById('image-full-preview');
        if (fullPreview) {
            fullPreview.remove();
        }
    });
    
    return previewContainer;
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
            .map(row => {
                const activityInput = row.cells[2].querySelector('input');
                let activityValue = activityInput.value;

                // Restore full image data from preview containers for the preview
                const previewContainer = activityInput.parentNode.querySelector('.image-previews');
                if (previewContainer) {
                    const previews = previewContainer.querySelectorAll('div[data-image-data]');
                    previews.forEach(preview => {
                        const imageData = preview.dataset.imageData;
                        // Replace the placeholder with the full base64 data before processing
                        activityValue = activityValue.replace('[IMAGE]', `[IMAGE:${imageData}]`);
                    });
                }

                return {
                    stage: row.cells[0].querySelector('select').value,
                    time: escapeHtml(row.cells[1].querySelector('input').value),
                    activity: processActivityText(activityValue), // Now process the restored value
                    purpose: escapeHtml(row.cells[3].querySelector('input').value),
                    means: row.cells[4].querySelector('select').value,
                    mode: row.cells[5].querySelector('select').value
                };
            })
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
                                <td style="border: 1px solid #dee2e6; padding: 10px;">${processActivityText(stage.activity)}</td>
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
            processActivityText(stage.activity),
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
                    img { 
                        max-width: 350px; 
                        height: auto; 
                        border: 1px solid #ddd; 
                        border-radius: 4px; 
                        margin: 5px 0; 
                        display: inline-block;
                    }
                    @media print {
                        img { 
                            max-width: 350px !important; 
                            height: auto !important;
                            page-break-inside: avoid;
                        }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                    }
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

// Local storage functionality
const LESSON_STORAGE_KEY = 'lessonPlansDatabase';
const DRAFT_STORAGE_KEY = 'lessonPlannerDraft';

// Initialize local storage database if it doesn't exist
function initializeLessonDatabase() {
    if (!localStorage.getItem(LESSON_STORAGE_KEY)) {
        const initialDb = {
            '7th-grade': [],
            '8th-grade': [],
            '9th-grade': []
        };
        localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(initialDb));
    }
}

// Auto-save draft functionality
let autoSaveTimeout;
function autoSaveDraft() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const formData = collectFormData();
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        showDraftSavedIndicator();
    }, 1000); // Save after 1 second of inactivity
}

function showDraftSavedIndicator() {
    let indicator = document.getElementById('draftIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'draftIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            box-shadow: 0 2px 10px rgba(39, 174, 96, 0.3);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;
        indicator.textContent = '✓ Draft saved';
        document.body.appendChild(indicator);
    }

    indicator.style.opacity = '1';
    indicator.style.transform = 'translateY(0)';

    setTimeout(() => {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(-10px)';
    }, 2000);
}

function loadDraft() {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
        try {
            const formData = JSON.parse(draft);
            populateFormFromData(formData);
            showNotification('Draft loaded from previous session', 'success');
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
}

function populateFormFromData(data) {
    // Populate basic fields
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data[key];
            } else {
                element.value = data[key];
            }
        }
    });

    // Handle special cases
    if (data.selectedClasses) {
        selectedClasses = data.selectedClasses;
        renderTags();
        updateHiddenInput();
    }

    // Populate dynamic lists
    if (data.objectives) {
        const objectivesList = document.getElementById('objectivesList');
        objectivesList.innerHTML = '';
        data.objectives.forEach((obj, index) => {
            const item = createDynamicListItem(obj, index === 0);
            objectivesList.appendChild(item);
        });
        updateNumbers(objectivesList);
    }

    if (data.materials) {
        const materialsList = document.getElementById('materialsList');
        materialsList.innerHTML = '';
        data.materials.forEach((mat, index) => {
            const item = createChecklistItem(mat, index === 0);
            materialsList.appendChild(item);
        });
    }

    if (data.stages) {
        const stagesTable = document.querySelector('#stagesTable tbody');
        stagesTable.innerHTML = '';
        data.stages.forEach(stage => {
            const row = createStageRow('');
            const cells = row.cells;
            cells[0].querySelector('select').value = stage.stage || '';
            cells[1].querySelector('input').value = stage.time || '';
            cells[2].querySelector('input').value = stage.activity || '';
            cells[3].querySelector('input').value = stage.purpose || '';
            cells[4].querySelector('select').value = stage.means || '';
            cells[5].querySelector('select').value = stage.mode || '';
            stagesTable.appendChild(row);
        });
    }
}

function createDynamicListItem(value, isFirst) {
    const item = document.createElement('div');
    item.className = 'dynamic-list';
    item.innerHTML = `
        <span class="number">1.</span>
        <input type="text" value="${value}" placeholder="Enter learning objective">
        <button type="button" class="add">Add</button>
        <button type="button" class="remove" ${isFirst ? 'disabled' : ''}>Remove</button>
    `;
    return item;
}

function createChecklistItem(data, isFirst) {
    const item = document.createElement('div');
    item.className = 'checklist-item';
    item.innerHTML = `
        <input type="checkbox" ${data.checked ? 'checked' : ''}>
        <input type="text" value="${data.text}" placeholder="Enter material">
        <button type="button" class="add">Add</button>
        <button type="button" class="remove" ${isFirst ? 'disabled' : ''}>Remove</button>
    `;
    return item;
}

function collectFormData() {
    const data = {};

    // Collect basic form fields
    const form = document.getElementById('lessonForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.id) {
            if (input.type === 'checkbox') {
                data[input.id] = input.checked;
            } else {
                data[input.id] = input.value;
            }
        }
    });

    // Collect selected classes
    data.selectedClasses = selectedClasses;

    // Collect objectives
    data.objectives = Array.from(document.querySelectorAll('#objectivesList input[type="text"]'))
        .map(input => input.value)
        .filter(val => val.trim());

    // Collect materials
    data.materials = Array.from(document.querySelectorAll('#materialsList .checklist-item'))
        .map(item => ({
            checked: item.querySelector('input[type="checkbox"]').checked,
            text: item.querySelector('input[type="text"]').value
        }))
        .filter(item => item.text.trim());

    // Collect stages
    data.stages = Array.from(document.querySelectorAll('#stagesTable tbody tr'))
        .map(row => {
            const activityInput = row.cells[2].querySelector('input');
            let activityValue = activityInput.value;
            
            // Restore full image data from preview containers
            const previewContainer = activityInput.parentNode.querySelector('.image-previews');
            if (previewContainer) {
                const previews = previewContainer.querySelectorAll('div[data-image-data]');
                previews.forEach(preview => {
                    const imageData = preview.dataset.imageData;
                    activityValue = activityValue.replace('[IMAGE]', `[IMAGE:${imageData}]`);
                });
            }
            
            return {
                stage: row.cells[0].querySelector('select').value,
                time: row.cells[1].querySelector('input').value,
                activity: activityValue,
                purpose: row.cells[3].querySelector('input').value,
                means: row.cells[4].querySelector('select').value,
                mode: row.cells[5].querySelector('select').value
            };
        })
        .filter(stage => stage.stage || stage.activity || stage.time);

    return data;
}

// Get lessons database from localStorage
function getLessonDatabase() {
    try {
        const data = localStorage.getItem(LESSON_STORAGE_KEY);
        return data ? JSON.parse(data) : { '7th-grade': [], '8th-grade': [], '9th-grade': [] };
    } catch (error) {
        console.error('Error reading lesson database:', error);
        return { '7th-grade': [], '8th-grade': [], '9th-grade': [] };
    }
}

// Save lessons database to localStorage
function saveLessonDatabase(db) {
    try {
        localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(db));
        return true;
    } catch (error) {
        console.error('Error saving lesson database:', error);
        return false;
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

// Save lesson to localStorage
function saveLessonToArchive() {
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
        classes: selectedClasses,
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
                activity: processActivityText(row.cells[2].querySelector('input').value),
                purpose: escapeHtml(row.cells[3].querySelector('input').value),
                means: row.cells[4].querySelector('select').value,
                mode: row.cells[5].querySelector('select').value
            }))
            .filter(stage => stage.stage || stage.activity),
        assessment: escapeHtml(document.getElementById('assessment').value),
        reflection: escapeHtml(document.getElementById('reflection').value)
    };

    // Generate HTML content for saving
    const contentHtml = `
        <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #9b59b6;">
            <h3 style="font-size: 1.8em; margin-bottom: 5px;">${data.teacherName}</h3>
            <p style="font-size: 1.2em; color: #7f8c8d;">${data.institution}</p>
        </div>

        <div style="background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div><strong>Date:</strong> ${data.date}</div>
                <div><strong>Level:</strong> ${data.level}</div>
                <div><strong>Classes:</strong> ${data.classes.join(', ')}</div>
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
                                <td style="border: 1px solid #dee2e6; padding: 10px;">${processActivityText(stage.activity)}</td>
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

    // Create HTML document for saving
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.lessonTitle} - ${data.teacherName}</title>
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

    try {
        // Initialize database if needed
        initializeLessonDatabase();

        // Get current database
        const db = getLessonDatabase();

        // Determine grade folder
        const gradeText = data.level.split(' ')[0]; // "7th grade" -> "7th"
        const gradeFolder = `${gradeText}-grade`; // "7th" -> "7th-grade"

        // Generate unique ID
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        // Create lesson data object
        const lessonData = {
            id,
            lessonTitle: data.lessonTitle,
            grade: gradeFolder,
            date: data.date,
            teacherName: data.teacherName,
            classes: data.classes,
            unit: data.unit,
            duration: data.duration,
            objectives: data.objectives,
            materials: data.materials,
            stages: data.stages,
            assessment: data.assessment,
            reflection: data.reflection,
            htmlContent,
            createdAt: new Date().toISOString()
        };

        // Add to database
        if (!db[gradeFolder]) {
            db[gradeFolder] = [];
        }
        db[gradeFolder].push(lessonData);

        // Save to localStorage
        if (saveLessonDatabase(db)) {
            // Clear draft since lesson was saved successfully
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            showNotification('✓ Lesson saved locally!', 'success');
        } else {
            showNotification('Failed to save lesson to local storage.', 'error');
        }
    } catch (error) {
        console.error('Error saving lesson:', error);
        showNotification('Failed to save lesson.', 'error');
    }
}

// Initialize local storage functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize local storage database
    initializeLessonDatabase();

    // Load draft if exists
    loadDraft();

    // Add save button event listener
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveLessonToArchive);
    }

    // Add view archive button event listener
    const viewArchiveBtn = document.getElementById('viewArchiveBtn');
    if (viewArchiveBtn) {
        viewArchiveBtn.addEventListener('click', function() {
            window.open('lesson-archive.html', '_blank');
        });
    }

    // Add auto-save event listeners
    setupAutoSave();
});

function setupAutoSave() {
    // Auto-save on input changes
    const form = document.getElementById('lessonForm');
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        input.addEventListener('input', autoSaveDraft);
        input.addEventListener('change', autoSaveDraft);
    });

    // Auto-save when dynamic content changes
    const observer = new MutationObserver(autoSaveDraft);
    observer.observe(document.getElementById('objectivesList'), { childList: true, subtree: true });
    observer.observe(document.getElementById('materialsList'), { childList: true, subtree: true });
    observer.observe(document.querySelector('#stagesTable tbody'), { childList: true, subtree: true });

    // Auto-save on class selection changes
    document.addEventListener('classSelectionChanged', autoSaveDraft);
}

// Auto-save after generating preview
const originalGenerateBtn = document.getElementById('generateBtn');
if (originalGenerateBtn) {
    const originalClickHandler = originalGenerateBtn.onclick || function() {};
    originalGenerateBtn.addEventListener('click', function() {
        // Call original functionality first
        originalClickHandler.call(this);

        // Then auto-save after a short delay to ensure preview is generated
        setTimeout(() => {
            saveLessonToArchive();
        }, 1000);
    });
}


console.log('Lesson Planner loaded successfully!');
