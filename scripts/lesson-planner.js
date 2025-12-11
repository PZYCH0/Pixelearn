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
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
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
            `;
            newRow.querySelector('.stage-select').value = stage;
            tbody.appendChild(newRow);
        });
    }

    if (tbody.children.length === 0) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
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
        `;
        tbody.appendChild(newRow);
    }
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
