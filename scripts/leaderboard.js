document.addEventListener('DOMContentLoaded', () => {
    const sampleParticipants = [
        { name: 'G1', emoji: '🦁', score: 0 },
        { name: 'G2', emoji: '🐯', score: 0 },
        { name: 'G3', emoji: '🐻', score: 0 },
        { name: 'G4', emoji: '🐱', score: 0 },
        { name: 'G5', emoji: '🐸', score: 0 },
        { name: 'G6', emoji: '🦊', score: 0 }, // Added G6
    ];

    let participants = loadParticipants() || sampleParticipants;

    const rankingsTableBody = document.querySelector('#rankings-table tbody');
    const addParticipantNameInput = document.getElementById('new-participant-name');
    const addParticipantEmojiInput = document.getElementById('new-participant-emoji');
    const addParticipantBtn = document.getElementById('add-participant-btn');
    const resetLeaderboardBtn = document.getElementById('reset-leaderboard-btn');
    let lastUpdatedParticipantName = null; // For score change animation

    function saveParticipants() {
        localStorage.setItem('leaderboardParticipants', JSON.stringify(participants));
    }

    // Helper function to apply animation and remove class after
    function triggerAnimation(element, animationClass) {
        if (!element) return;
        element.classList.remove(animationClass); // Remove to re-trigger if already present
        void element.offsetWidth; // Trigger reflow to restart animation if class was re-added quickly
        element.classList.add(animationClass);
        element.addEventListener('animationend', () => {
            element.classList.remove(animationClass);
        }, { once: true });
    }

    function loadParticipants() {
        const storedParticipants = localStorage.getItem('leaderboardParticipants');
        return storedParticipants ? JSON.parse(storedParticipants) : null;
    }

    function sortParticipants() {
        participants.sort((a, b) => b.score - a.score);
    }

    function updatePodium() {
        const topThree = participants.slice(0, 3);

        for (let i = 1; i <= 3; i++) {
            const podiumNameEl = document.getElementById(`name-${i}`);
            const podiumEmojiEl = document.getElementById(`emoji-${i}`);
            const podiumScoreEl = document.getElementById(`score-${i}`);

            const participantData = topThree[i-1];
            if (participantData) {
                if (podiumNameEl.textContent !== participantData.name) {
                    podiumNameEl.textContent = participantData.name;
                    triggerAnimation(podiumNameEl, 'animate-fadeInUp');
                }
                if (podiumEmojiEl.textContent !== participantData.emoji) {
                    podiumEmojiEl.textContent = participantData.emoji;
                    triggerAnimation(podiumEmojiEl, 'animate-fadeInUp');
                }
                if (podiumScoreEl.textContent !== String(participantData.score)) {
                    podiumScoreEl.textContent = participantData.score;
                    triggerAnimation(podiumScoreEl, 'animate-pulse');
                }
            } else {
                if (podiumNameEl.textContent !== '-') podiumNameEl.textContent = '-';
                if (podiumEmojiEl.textContent !== '') podiumEmojiEl.textContent = '';
                if (podiumScoreEl.textContent !== '-') podiumScoreEl.textContent = '-';
            }
        }
    }

    function renderTable() {
        rankingsTableBody.innerHTML = ''; // Clear existing rows
        sortParticipants();

        participants.forEach((participant, index) => {
            const rank = index + 1;
            const row = rankingsTableBody.insertRow();

            if (participant.isNew) {
                row.classList.add('new-row-animation');
                // Remove the flag after applying the animation class
                // The animation class itself might be removed on 'animationend' if defined that way in CSS
                // or keep it if the CSS handles 'forwards'
                delete participant.isNew; 
            }

            row.insertCell().textContent = rank;
            row.insertCell().textContent = participant.name;
            row.insertCell().textContent = participant.emoji;
            const scoreCell = row.insertCell();
            scoreCell.textContent = participant.score;

            if (participant.name === lastUpdatedParticipantName) {
                triggerAnimation(scoreCell, 'animate-highlight');
                lastUpdatedParticipantName = null; // Reset after use
            }

            const actionsCell = row.insertCell();
            const addOnePointBtn = document.createElement('button');
            addOnePointBtn.textContent = '+1';
            addOnePointBtn.classList.add('btn', 'btn-sm', 'btn-primary', 'me-1'); // Bootstrap classes
            addOnePointBtn.title = "Add 1 Point";
            addOnePointBtn.addEventListener('click', () => {
                addPoints(participant.name, 1);
            });
            actionsCell.appendChild(addOnePointBtn);

            // Add +5 points button
            const addFivePointsBtn = document.createElement('button');
            addFivePointsBtn.textContent = '+5';
            addFivePointsBtn.classList.add('btn', 'btn-sm', 'btn-success', 'me-1'); // Bootstrap classes
            addFivePointsBtn.title = "Add 5 Points";
            addFivePointsBtn.addEventListener('click', () => {
                addPoints(participant.name, 5);
            });
            actionsCell.appendChild(addFivePointsBtn);

            // Add -1 point button
            const decreasePointsBtn = document.createElement('button');
            decreasePointsBtn.textContent = '-1';
            decreasePointsBtn.classList.add('btn', 'btn-sm', 'btn-warning'); // Bootstrap classes
            decreasePointsBtn.title = "Decrease 1 Point";
            decreasePointsBtn.addEventListener('click', () => {
                decreasePoints(participant.name, 1);
            });
            actionsCell.appendChild(decreasePointsBtn);

            // Add Remove participant button
            const removeParticipantBtn = document.createElement('button');
            removeParticipantBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'ms-2'); // Bootstrap classes, ms-2 for margin
            removeParticipantBtn.title = "Remove Participant";
            removeParticipantBtn.innerHTML = '<i class="bi bi-trash-fill"></i>'; // Bootstrap Icon
            removeParticipantBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent row click or other events if any
                removeParticipant(participant.name);
            });
            actionsCell.appendChild(removeParticipantBtn);
        });
        updatePodium();
        saveParticipants();
    }

    function addPoints(participantName, points) {
        const participant = participants.find(p => p.name === participantName);
        if (participant) {
            participant.score += points;
            lastUpdatedParticipantName = participantName;
            renderTable(); // Re-render to update scores and ranks
        }
    }

    function decreasePoints(participantName, points) {
        const participant = participants.find(p => p.name === participantName);
        if (participant) {
            participant.score -= points;
            if (participant.score < 0) {
                participant.score = 0; // Prevent negative scores
            }
            lastUpdatedParticipantName = participantName;
            renderTable();
        }
    }

    function addParticipant() {
        const name = addParticipantNameInput.value.trim();
        const emoji = addParticipantEmojiInput.value.trim();

        if (name && emoji) {
            if (participants.find(p => p.name.toLowerCase() === name.toLowerCase())) {
                alert('A participant with this name already exists.');
                return;
            }
            participants.push({ name, emoji, score: 0, isNew: true });
            addParticipantNameInput.value = '';
            addParticipantEmojiInput.value = '';
            renderTable();
        } else {
            alert('Please enter both name and emoji for the new participant.');
        }
    }

    function removeParticipant(nameToRemove) {
        if (confirm(`Are you sure you want to remove ${nameToRemove}? This action cannot be undone.`)) {
            participants = participants.filter(p => p.name !== nameToRemove);
            renderTable(); // Re-render the table and podium
            saveParticipants();
        }
    }

    addParticipantBtn.addEventListener('click', () => {addParticipant()});

    function resetLeaderboard() {
        if (confirm('Are you sure you want to reset the leaderboard? All scores will be lost and reset to default participants.')) {
            // Create a deep copy of sampleParticipants to avoid modifying the original
            participants = JSON.parse(JSON.stringify(sampleParticipants)).map(p => ({ ...p, score: 0 }));
            localStorage.removeItem('leaderboardParticipants'); // Clear specific item
            // Or, if you want to save the reset state (sample participants with 0 score):
            // saveParticipants(); 
            renderTable();
        }
    }

    if(resetLeaderboardBtn) {
        resetLeaderboardBtn.addEventListener('click', resetLeaderboard);
    }

    // Initial render
    renderTable();
});
