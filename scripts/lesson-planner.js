// Level to class mapping
const classes = {
    '7th': Array.from({length: 12}, (_, i) => `1-${i+1}`),
    '8th': Array.from({length: 12}, (_, i) => `2-${i+1}`),
    '9th': Array.from({length: 12}, (_, i) => `3-${i+1}`)
};

// Populate class options for tag system
let selectedClasses = [];
let classContainer = null;
let classInput = null;
let classDropdown = null;
let selectedClassesInput = null;
const allClasses = Object.values(classes).flat();

function setClassTagElements() {
    classContainer = document.getElementById('classContainer');
    classInput = document.getElementById('classInput');
    classDropdown = document.getElementById('classDropdown');
    selectedClassesInput = document.getElementById('selectedClasses');
}

function updateDropdown(filter = '') {
    if (!classDropdown) return;
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
        updateDropdown(classInput ? classInput.value : '');
        updateHiddenInput();
        document.dispatchEvent(new CustomEvent('classSelectionChanged'));
    }
    if (classInput) {
        classInput.value = '';
    }
    if (classDropdown) {
        classDropdown.style.display = 'none';
    }
}

function removeTag(cls) {
    selectedClasses = selectedClasses.filter(c => c !== cls);
    renderTags();
    updateHiddenInput();
    document.dispatchEvent(new CustomEvent('classSelectionChanged'));
}

function renderTags() {
    if (!classContainer || !classInput) return;
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
    if (!selectedClassesInput) return;
    selectedClassesInput.value = JSON.stringify(selectedClasses);
}

document.addEventListener('DOMContentLoaded', function() {
    setClassTagElements();

    // Personal Information Storage Functions
    function savePersonalInfo() {
        const teacherName = document.getElementById('teacherName').value;
        const institution = document.getElementById('institution').value;
        const level = document.getElementById('level').value;
        
        if (teacherName || institution) {
            localStorage.setItem('lessonPlannerPersonalInfo', JSON.stringify({
                teacherName: teacherName,
                institution: institution,
                level: level
            }));
        }
    }

    function loadPersonalInfo() {
        const savedInfo = localStorage.getItem('lessonPlannerPersonalInfo');
        if (savedInfo) {
            const info = JSON.parse(savedInfo);
            if (info.teacherName) document.getElementById('teacherName').value = info.teacherName;
            if (info.institution) document.getElementById('institution').value = info.institution;
            if (info.level) document.getElementById('level').value = info.level;
        }
    }

    function clearPersonalInfo() {
        localStorage.removeItem('lessonPlannerPersonalInfo');
        document.getElementById('teacherName').value = '';
        document.getElementById('institution').value = '';
        document.getElementById('level').value = '';
    }

    // Load personal info on page load
    loadPersonalInfo();

    // Save personal info when fields change
    document.getElementById('teacherName').addEventListener('input', savePersonalInfo);
    document.getElementById('institution').addEventListener('input', savePersonalInfo);
    document.getElementById('level').addEventListener('change', savePersonalInfo);

    // Add event listeners for personal info buttons
    document.getElementById('saveInfoBtn').addEventListener('click', function() {
        savePersonalInfo();
        alert('Personal information saved successfully!');
    });

    document.getElementById('clearInfoBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all saved personal information?')) {
            clearPersonalInfo();
            alert('Personal information cleared!');
        }
    });

    
    if (classContainer && classInput && classDropdown && selectedClassesInput) {
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
    }

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
    'OHE': ['Observation', 'Hypothesis', 'Experiment'],
    'POHE': ['Preparation', 'Observation', 'Hypothesizing', 'Receptive', 'Productive', 'Experimenting', 'Closing'],
    'Custom': []
};

let stageData = [];
let stageIndex = 0;
let stageInputs = {};

function parseMinutesFromDuration(value) {
    if (!value) return null;
    const match = String(value).match(/(\d+)/);
    if (!match) return null;
    const minutes = parseInt(match[1], 10);
    return Number.isFinite(minutes) ? minutes : null;
}

function parseMinutesFromStageTime(value) {
    if (!value) return null;
    const match = String(value).match(/(\d+)/);
    if (!match) return null;
    const minutes = parseInt(match[1], 10);
    return Number.isFinite(minutes) ? minutes : null;
}

function getTotalStageMinutes() {
    return stageData.reduce((sum, stage) => {
        const minutes = parseMinutesFromStageTime(stage.time);
        return sum + (minutes || 0);
    }, 0);
}

function isStageDurationWithinLimit() {
    const durationInput = document.getElementById('duration');
    const totalMinutes = parseMinutesFromDuration(durationInput ? durationInput.value : '');
    if (!Number.isFinite(totalMinutes)) return true;
    const stageTotal = getTotalStageMinutes();
    return stageTotal <= totalMinutes;
}

function assertStageDurationWithinLimit() {
    const durationInput = document.getElementById('duration');
    const totalMinutes = parseMinutesFromDuration(durationInput ? durationInput.value : '');
    if (!Number.isFinite(totalMinutes)) return true;

    const stageTotal = getTotalStageMinutes();
    if (stageTotal <= totalMinutes) return true;

    alert(`Stage time totals ${stageTotal} min, which exceeds the lesson duration of ${totalMinutes} min.`);
    return false;
}

function applyDurationToStages(totalMinutes) {
    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0 || stageData.length === 0) return;

    const count = stageData.length;
    const base = Math.floor(totalMinutes / count);
    const remainder = totalMinutes % count;

    stageData = stageData.map((stage, index) => ({
        ...stage,
        time: `${base + (index < remainder ? 1 : 0)} min`
    }));
}

function setStageInputs() {
    stageInputs = {
        name: document.getElementById('stageName'),
        time: document.getElementById('stageTime'),
        activity: document.getElementById('stageActivity'),
        purpose: document.getElementById('stagePurpose'),
        means: document.getElementById('stageMeans'),
        mode: document.getElementById('stageMode'),
        progress: document.getElementById('stageProgress'),
        title: document.getElementById('stageTitle'),
        list: document.getElementById('stageList')
    };
}

function buildStageDataForModel(model) {
    const stages = modelStages[model] || [];
    stageData = stages.length
        ? stages.map(name => ({ stage: name, time: '', activity: '', purpose: '', means: '', mode: '' }))
        : [{ stage: '', time: '', activity: '', purpose: '', means: '', mode: '' }];

    const durationInput = document.getElementById('duration');
    const totalMinutes = parseMinutesFromDuration(durationInput ? durationInput.value : '');
    applyDurationToStages(totalMinutes);

    stageIndex = 0;
    renderStageList();
    loadStageToInputs();
}

function syncStageInputsToData() {
    if (!stageData.length || !stageInputs.activity) return;
    const current = stageData[stageIndex];
    current.stage = stageInputs.name.value.trim();
    current.time = stageInputs.time.value.trim();
    current.activity = restoreActivityValueFromPreviews(stageInputs.activity);
    current.purpose = stageInputs.purpose ? stageInputs.purpose.value.trim() : '';
    current.means = stageInputs.means.value;
    current.mode = stageInputs.mode.value;
}

function clearStagePreviews() {
    if (!stageInputs.activity || !stageInputs.activity.parentNode) return;
    const preview = stageInputs.activity.parentNode.querySelector('.image-previews');
    if (preview) preview.remove();
}

function loadStageToInputs() {
    if (!stageData.length || !stageInputs.activity) return;
    const current = stageData[stageIndex];
    stageInputs.name.value = current.stage || '';
    stageInputs.time.value = current.time || '';
    stageInputs.activity.value = current.activity || '';
    if (stageInputs.purpose) {
        stageInputs.purpose.value = current.purpose || '';
    }
    clearStagePreviews();
    hydrateActivityImages(stageInputs.activity);
    stageInputs.means.value = current.means || '';
    stageInputs.mode.value = current.mode || '';
    updateStageProgress();
    renderStageList();
}

function updateStageProgress() {
    if (!stageInputs.progress || !stageInputs.title) return;
    stageInputs.progress.textContent = `Stage ${stageIndex + 1} of ${stageData.length}`;
    const title = stageInputs.name.value.trim() || stageData[stageIndex].stage || `Stage ${stageIndex + 1}`;
    stageInputs.title.textContent = title;
}

function renderStageList() {
    if (!stageInputs.list) return;
    stageInputs.list.innerHTML = '';
    stageData.forEach((stage, index) => {
        const label = stage.stage || `Stage ${index + 1}`;
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `stage-pill${index === stageIndex ? ' active' : ''}`;
        pill.textContent = label;
        pill.addEventListener('click', () => {
            if (index === stageIndex) return;
            syncStageInputsToData();
            stageIndex = index;
            loadStageToInputs();
        });
        stageInputs.list.appendChild(pill);
    });
}

// Pre-fill stages based on model selection
document.getElementById('model').addEventListener('change', function() {
    buildStageDataForModel(this.value);
    autoSaveDraft();
});

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

function generateImagePlaceholderToken() {
    return `[IMAGE_TOKEN:${Date.now()}_${Math.random().toString(16).slice(2)}]`;
}

function ensureImagePreviewsContainer(activityInput) {
    if (!activityInput || !activityInput.parentNode) return null;

    let container = activityInput.parentNode.querySelector('.image-previews');
    if (!container) {
        container = document.createElement('div');
        container.className = 'image-previews';
        container.style.cssText = 'display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;';
        activityInput.parentNode.appendChild(container);
    }
    return container;
}

function insertImageIntoActivity(activityInput, base64Data) {
    if (!activityInput || !base64Data) return;

    const previewsContainer = ensureImagePreviewsContainer(activityInput);
    if (!previewsContainer) return;
    
    // Add image preview without modifying the input text
    previewsContainer.appendChild(displayImagePreview(activityInput, base64Data));
}

function hydrateActivityImages(activityInput) {
    if (!activityInput) return;

    const raw = activityInput.value || '';
    const matches = raw.matchAll(/\[IMAGE:([^\]]+)\]/g);
    let replaced = raw;
    let didHydrate = false;

    for (const match of matches) {
        const base64Data = match[1];
        const fullTag = match[0];
        const placeholderToken = generateImagePlaceholderToken();

        replaced = replaced.replace(fullTag, placeholderToken);
        const previewsContainer = ensureImagePreviewsContainer(activityInput);
        if (previewsContainer) {
            previewsContainer.appendChild(displayImagePreview(activityInput, base64Data, placeholderToken));
            didHydrate = true;
        }
    }

    if (didHydrate) {
        activityInput.value = replaced;
    }
}

function restoreActivityValueFromPreviews(activityInput) {
    if (!activityInput || !activityInput.parentNode) return '';

    let result = activityInput.value || '';
    const previewContainer = activityInput.parentNode.querySelector('.image-previews');
    
    if (!previewContainer) return result;

    // Get all image previews in order
    const previews = Array.from(previewContainer.querySelectorAll('div[data-image-data]'));
    
    // If there are images, combine them with the text
    if (previews.length > 0) {
        // For now, just append images after the text
        // You might want to implement more sophisticated ordering if needed
        const imageTags = previews.map(p => `[IMAGE:${p.dataset.imageData}]`).join(' ');
        return result + (result ? ' ' : '') + imageTags;
    }
    
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
        // No need to modify the input text since we're not using tokens
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
    
    syncStageInputsToData();
    if (!assertStageDurationWithinLimit()) {
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
        materials: getMaterialsFromChecklist()
            .map(item => ({
                checked: item.checked,
                text: escapeHtml(item.text)
            }))
            .filter(item => item.text.trim()),
        stages: stageData
            .map(stage => ({
                stage: escapeHtml(stage.stage),
                time: escapeHtml(stage.time),
                activity: processActivityText(stage.activity),
                purpose: escapeHtml(stage.purpose),
                means: stage.means,
                mode: stage.mode
            }))
            .filter(stage => stage.stage || stage.activity),
        assessment: escapeHtml(document.getElementById('assessment').value),
        reflection: escapeHtml(document.getElementById('reflection').value)
    };

    const contentHtml = `
        <div style="text-align: center; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 2px solid #9b59b6;">
            <h3 style="font-size: 1.4em; margin-bottom: 3px;">${data.teacherName}</h3>
            <p style="font-size: 1em; color: #7f8c8d;">${data.institution}</p>
        </div>

        <!-- 2x2 Grid Layout for Preview -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 10px; margin-bottom: 15px;">
            <!-- Grid 1: Basic Information -->
            <div style="background: rgba(248, 249, 250, 0.9); border-radius: 10px; border-left: 3px solid #9b59b6; padding: 12px; border: 1px solid rgba(155, 89, 182, 0.1);">
                <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 8px 10px; margin: -12px -12px 10px -12px; border-radius: 10px 10px 0 0; font-weight: bold; font-size: 0.9em; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <i class="fas fa-info-circle" style="color: white !important; font-size: 0.9em;"></i> Basic Information
                </div>
                <div style="display: grid; gap: 4px; font-size: 0.8em;">
                    <div><strong>Date:</strong> ${data.date}</div>
                    <div><strong>Level:</strong> ${data.level}</div>
                    <div><strong>Classes:</strong> ${data.class.join(', ')}</div>
                    <div><strong>Model:</strong> ${data.model}</div>
                    <div><strong>Duration:</strong> ${data.duration}</div>
                </div>
            </div>

            <!-- Grid 2: Unit & Lesson -->
            <div style="background: rgba(248, 249, 250, 0.9); border-radius: 10px; border-left: 3px solid #9b59b6; padding: 12px; border: 1px solid rgba(155, 89, 182, 0.1);">
                <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 8px 10px; margin: -12px -12px 10px -12px; border-radius: 10px 10px 0 0; font-weight: bold; font-size: 0.9em; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <i class="fas fa-book" style="color: white !important; font-size: 0.9em;"></i> Unit & Lesson
                </div>
                <div style="display: grid; gap: 4px; font-size: 0.8em;">
                    <div><strong>Unit:</strong> ${data.unit}</div>
                    <div><strong>Lesson Title:</strong> ${data.lessonTitle}</div>
                </div>
            </div>

            <!-- Grid 3: Learning Objectives -->
            <div style="background: rgba(248, 249, 250, 0.9); border-radius: 10px; border-left: 3px solid #9b59b6; padding: 12px; border: 1px solid rgba(155, 89, 182, 0.1);">
                <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; padding: 8px 10px; margin: -12px -12px 10px -12px; border-radius: 10px 10px 0 0; font-weight: bold; font-size: 0.9em; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <i class="fas fa-bullseye" style="color: white !important; font-size: 0.9em;"></i> Learning Objectives
                </div>
                <div style="font-size: 0.8em;">
                    <strong>Students will be able to:</strong>
                    <ol style="margin: 4px 0 0 0; padding-left: 16px;">
                        ${data.objectives.map(obj => `<li style="margin-bottom: 4px;">${obj}</li>`).join('')}
                    </ol>
                </div>
            </div>

            <!-- Grid 4: Materials Needed -->
            <div style="background: rgba(248, 249, 250, 0.9); border-radius: 10px; border-left: 3px solid #9b59b6; padding: 12px; border: 1px solid rgba(155, 89, 182, 0.1);">
                <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 8px 10px; margin: -12px -12px 10px -12px; border-radius: 10px 10px 0 0; font-weight: bold; font-size: 0.9em; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <i class="fas fa-toolbox" style="color: white !important; font-size: 0.9em;"></i> Materials Needed
                </div>
                <ul style="list-style: none; margin: 0; padding: 0; font-size: 0.8em;">
                    ${data.materials.map(mat => `<li style="margin-bottom: 4px;"><span style="color: ${mat.checked ? '#27ae60' : '#95a5a6'};">${mat.checked ? '&#10004;' : '&#9711;'}</span> ${mat.text}</li>`).join('')}
                </ul>
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            <div style="background: #9b59b6; color: white; padding: 8px 12px; border-radius: 6px 6px 0 0; font-weight: bold;">
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
  @media (max-width: 768px) {
    .page {
      padding: 20px;
    }
    .page > div[style*="grid-template-columns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
      gap: 15px !important;
    }
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

// Export functions have been removed

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
        if (data.objectives.length === 0) {
            objectivesList.appendChild(createDynamicListItem('', true));
        } else {
            data.objectives.forEach((obj, index) => {
                const item = createDynamicListItem(obj, index === 0);
                objectivesList.appendChild(item);
            });
        }
        updateNumbers(objectivesList);
    }

    if (data.materials) {
        const materialsList = document.getElementById('materialsList');
        const otherCheck = document.getElementById('materialOtherCheck');
        const otherText = document.getElementById('materialOtherText');
        if (materialsList) {
            const labels = Array.from(materialsList.querySelectorAll('.checklist-item'));
            const savedMaterials = data.materials.map(item => (item.text || '').trim());
            const savedLookup = new Set(savedMaterials.map(text => text.toLowerCase()));

            labels.forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const textInput = item.querySelector('input[type="text"]');
                const labelText = textInput ? textInput.value : (item.querySelector('span')?.textContent || '');
                const normalized = (labelText || '').trim().toLowerCase();
                if (checkbox) {
                    checkbox.checked = normalized ? savedLookup.has(normalized) : false;
                }
            });

            if (otherCheck && otherText) {
                const knownLabels = labels
                    .map(item => (item.querySelector('span')?.textContent || '').trim())
                    .filter(Boolean)
                    .map(text => text.toLowerCase());
                const unknown = data.materials.find(item => {
                    const text = (item.text || '').trim().toLowerCase();
                    return text && !knownLabels.includes(text);
                });
                if (unknown) {
                    otherCheck.checked = true;
                    otherText.value = unknown.text;
                }
            }
        }
    }

    if (data.stages) {
        if (!stageInputs.activity) {
            setStageInputs();
        }
        stageData = data.stages.map(stage => ({
            stage: stage.stage || '',
            time: stage.time || '',
            activity: stage.activity || '',
            purpose: stage.purpose || '',
            means: stage.means || '',
            mode: stage.mode || ''
        }));
        stageIndex = Number.isInteger(data.stageIndex) ? data.stageIndex : 0;
        if (stageIndex < 0 || stageIndex >= stageData.length) {
            stageIndex = 0;
        }
        renderStageList();
        loadStageToInputs();
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
    data.materials = getMaterialsFromChecklist();

    // Collect stages
    syncStageInputsToData();
    data.stages = stageData.map(stage => ({
        stage: stage.stage,
        time: stage.time,
        activity: stage.activity,
        purpose: stage.purpose || '',
        means: stage.means,
        mode: stage.mode
    }));

    data.stageIndex = stageIndex;

    return data;
}

function getMaterialsFromChecklist() {
    return Array.from(document.querySelectorAll('#materialsList .checklist-item'))
        .map(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const textInput = item.querySelector('input[type="text"]');
            const labelText = textInput ? textInput.value : (item.querySelector('span')?.textContent || '');
            return {
                checked: checkbox ? checkbox.checked : false,
                text: (labelText || '').trim()
            };
        })
        .filter(item => item.text.trim());
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

    syncStageInputsToData();
    if (!assertStageDurationWithinLimit()) {
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
        materials: getMaterialsFromChecklist()
            .map(item => ({
                checked: item.checked,
                text: escapeHtml(item.text)
            }))
            .filter(item => item.text.trim()),
        stages: stageData
            .map(stage => ({
                stage: escapeHtml(stage.stage),
                time: escapeHtml(stage.time),
                activity: stage.activity,
                purpose: escapeHtml(stage.purpose),
                means: stage.means,
                mode: stage.mode
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


// Mobile Modal System
const isMobile = window.innerWidth <= 768;

if (isMobile) {
    const modalShown = sessionStorage.getItem('lessonPlannerModalShown');
    if (!modalShown) {
        setTimeout(() => showModal(), 1000); // Show after page load
    }
}

function showModal() {
    document.getElementById('mobileModal').style.display = 'block';
}

function hideModal() {
    document.getElementById('mobileModal').style.display = 'none';
    sessionStorage.setItem('lessonPlannerModalShown', 'true');
}

document.addEventListener('DOMContentLoaded', function() {
    const modalClose = document.getElementById('modalClose');
    const modalSkip = document.getElementById('modalSkip');
    const modalSubmit = document.getElementById('modalSubmit');
    const modalBackdrop = document.querySelector('.modal-backdrop');

    if (modalClose) modalClose.addEventListener('click', hideModal);
    if (modalSkip) modalSkip.addEventListener('click', hideModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', hideModal);

    if (modalSubmit) {
        modalSubmit.addEventListener('click', function() {
            const form = document.getElementById('modalForm');
            if (form && form.checkValidity()) {
                // Populate main form
                const teacherName = document.getElementById('modalTeacherName').value;
                const institution = document.getElementById('modalInstitution').value;
                const level = document.getElementById('modalLevel').value;

                document.getElementById('teacherName').value = teacherName;
                document.getElementById('institution').value = institution;
                document.getElementById('level').value = level;

                hideModal();
                showNotification('Information saved successfully', 'success');
            } else if (form) {
                form.reportValidity();
            }
        });
    }

    const otherCheck = document.getElementById('materialOtherCheck');
    const otherText = document.getElementById('materialOtherText');
    if (otherCheck && otherText) {
        otherCheck.addEventListener('change', () => {
            if (!otherCheck.checked) {
                otherText.value = '';
                autoSaveDraft();
            }
        });
        otherText.addEventListener('input', autoSaveDraft);
    }
});

// Wizard navigation for guided flow
document.addEventListener('DOMContentLoaded', function() {
    setStageInputs();

    const wizardSteps = Array.from(document.querySelectorAll('.wizard-step'));
    const prevBtn = document.getElementById('wizardPrev');
    const nextBtn = document.getElementById('wizardNext');
    const teacherNameInput = document.getElementById('teacherName');
    const teacherGreeting = document.getElementById('teacherGreeting');
    const modelSelect = document.getElementById('model');

    if (!wizardSteps.length || !prevBtn || !nextBtn) return;

    let wizardIndex = 0;

    const updateGreeting = () => {
        const name = teacherNameInput ? teacherNameInput.value.trim() : '';
        if (teacherGreeting) {
            teacherGreeting.textContent = name || 'friend';
        }
    };

    if (teacherNameInput) {
        teacherNameInput.addEventListener('input', updateGreeting);
        updateGreeting();
    }

    const stageFieldListeners = () => {
        if (!stageInputs.activity) return;
        const fields = [stageInputs.name, stageInputs.time, stageInputs.activity, stageInputs.purpose, stageInputs.means, stageInputs.mode];
        fields.forEach(field => {
            if (!field) return;
            field.addEventListener('input', () => {
                syncStageInputsToData();
                updateStageProgress();
                renderStageList();
                autoSaveDraft();
            });
            field.addEventListener('change', () => {
                syncStageInputsToData();
                updateStageProgress();
                renderStageList();
                autoSaveDraft();
            });
        });
    };

    stageFieldListeners();

    const durationInput = document.getElementById('duration');
    if (durationInput) {
        durationInput.addEventListener('input', () => {
            const totalMinutes = parseMinutesFromDuration(durationInput.value);
            syncStageInputsToData();
            applyDurationToStages(totalMinutes);
            loadStageToInputs();
            autoSaveDraft();
        });
    }

    const validateStep = (index) => {
        const step = wizardSteps[index];
        if (!step) return true;
        const required = step.querySelectorAll('[required]');
        for (const field of required) {
            if (!field.checkValidity()) {
                field.reportValidity();
                return false;
            }
        }
        return true;
    };

    const updateNavLabels = () => {
        prevBtn.disabled = wizardIndex === 0 && stageIndex === 0;
        if (wizardSteps[wizardIndex]?.dataset.step === 'stages') {
            nextBtn.textContent = stageIndex < stageData.length - 1 ? 'Next Stage' : 'Next';
            prevBtn.textContent = stageIndex > 0 ? 'Previous Stage' : 'Back';
        } else {
            nextBtn.textContent = wizardIndex === wizardSteps.length - 1 ? 'Finish' : 'Next';
            prevBtn.textContent = 'Back';
        }
    };

    const showStep = (index) => {
        wizardIndex = Math.max(0, Math.min(index, wizardSteps.length - 1));
        wizardSteps.forEach((step, i) => {
            step.classList.toggle('active', i === wizardIndex);
        });

        if (wizardSteps[wizardIndex]?.dataset.step === 'stages') {
            if (!modelSelect.value) {
                wizardIndex = Math.max(0, wizardIndex - 1);
                wizardSteps.forEach((step, i) => {
                    step.classList.toggle('active', i === wizardIndex);
                });
                modelSelect.reportValidity();
            } else if (!stageData.length) {
                buildStageDataForModel(modelSelect.value);
            } else {
                loadStageToInputs();
            }
        }

        updateNavLabels();
        wizardSteps[wizardIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goNext = () => {
        if (!validateStep(wizardIndex)) return;

        const currentStep = wizardSteps[wizardIndex]?.dataset.step;
        if (currentStep === 'framework' && modelSelect && !modelSelect.value) {
            modelSelect.reportValidity();
            return;
        }

        if (currentStep === 'stages') {
            syncStageInputsToData();
            if (!assertStageDurationWithinLimit()) {
                return;
            }
            if (stageIndex < stageData.length - 1) {
                stageIndex += 1;
                loadStageToInputs();
                updateNavLabels();
                return;
            }
        }

        showStep(wizardIndex + 1);
    };

    const goPrev = () => {
        const currentStep = wizardSteps[wizardIndex]?.dataset.step;
        if (currentStep === 'stages') {
            syncStageInputsToData();
            if (stageIndex > 0) {
                stageIndex -= 1;
                loadStageToInputs();
                updateNavLabels();
                return;
            }
        }
        showStep(wizardIndex - 1);
    };

    prevBtn.addEventListener('click', goPrev);
    nextBtn.addEventListener('click', goNext);

    showStep(0);
});

console.log('Lesson Planner loaded successfully!');

// Mobile image upload functionality
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('image-upload')) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64 = event.target.result;
                const activityInput = e.target.closest('.field')?.querySelector('textarea');
                insertImageIntoActivity(activityInput, base64);
                showNotification('Image added to activity', 'success');
            };
            reader.readAsDataURL(file);
        }
    }
});

document.addEventListener('click', function(e) {
    if (e.target.closest('.upload-btn')) {
        const btn = e.target.closest('.upload-btn');
        const fileInput = btn.previousElementSibling;
        fileInput.click();
    }
});

// Image paste functionality (Ctrl+V)
document.addEventListener('paste', function(e) {
    const active = document.activeElement;
    const isTextInput = active && ((active.tagName === 'INPUT' && active.type === 'text') || active.tagName === 'TEXTAREA');
    if (!isTextInput) return;
    if (active.id !== 'stageActivity') return;

    const clipboardItems = e.clipboardData?.items;
    if (!clipboardItems || clipboardItems.length === 0) return;

    const imageItems = Array.from(clipboardItems).filter(item => item.type && item.type.startsWith('image/'));
    if (imageItems.length === 0) return;

    e.preventDefault();

    imageItems.forEach(item => {
        const file = item.getAsFile();
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64 = event.target.result;
            insertImageIntoActivity(active, base64);
            showNotification('Image pasted into activity', 'success');
        };
        reader.readAsDataURL(file);
    });
});
