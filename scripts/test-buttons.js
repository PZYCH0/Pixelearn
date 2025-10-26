// Test script to verify button functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Test if the save class button exists
    const saveClassBtn = document.getElementById('saveClass');
    console.log('Save Class Button:', saveClassBtn);
    
    // Add a test click handler
    if (saveClassBtn) {
        saveClassBtn.addEventListener('click', function() {
            console.log('Save Class button clicked!');
            alert('Save Class button works!');
        });
    }
    
    // Check if the form exists
    const classForm = document.getElementById('addClassForm');
    console.log('Class Form:', classForm);
    
    // Add a test submit handler
    if (classForm) {
        classForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted!');
            alert('Form submission works!');
        });
    }
});
