const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database file path
const DATABASE_PATH = path.join(__dirname, '..', 'lesson-plans', 'database.json');
const LESSON_PLANS_DIR = path.join(__dirname, '..', 'lesson-plans');

// Ensure lesson-plans directory exists
if (!fs.existsSync(LESSON_PLANS_DIR)) {
    fs.mkdirSync(LESSON_PLANS_DIR, { recursive: true });
}

// Initialize database if it doesn't exist
if (!fs.existsSync(DATABASE_PATH)) {
    const initialDb = {
        '7th-grade': [],
        '8th-grade': [],
        '9th-grade': []
    };
    fs.writeFileSync(DATABASE_PATH, JSON.stringify(initialDb, null, 2));
}

// Helper function to read database
function readDatabase() {
    try {
        const data = fs.readFileSync(DATABASE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return { '7th-grade': [], '8th-grade': [], '9th-grade': [] };
    }
}

// Helper function to write database
function writeDatabase(data) {
    try {
        fs.writeFileSync(DATABASE_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing database:', error);
        return false;
    }
}

// Helper function to sanitize filename
function sanitizeFilename(title) {
    return title
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/-+/g, '_') // Replace multiple hyphens with single underscore
        .substring(0, 50); // Limit length
}

// POST /api/save-lesson - Save lesson plan
app.post('/api/save-lesson', (req, res) => {
    try {
        const { teacherName, institution, date, level, classes, model, unit, lessonTitle, duration, objectives, materials, stages, assessment, reflection, htmlContent } = req.body;

        if (!lessonTitle || !level || !date || !classes || !htmlContent) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate unique ID
        const id = uuidv4();

        // Determine grade folder
        const gradeNumber = level.replace('th', ''); // 7th -> 7, 8th -> 8, 9th -> 9
        const gradeFolder = `${gradeNumber}th-grade`;

        // Create grade directory if it doesn't exist
        const gradeDir = path.join(LESSON_PLANS_DIR, gradeFolder);
        if (!fs.existsSync(gradeDir)) {
            fs.mkdirSync(gradeDir, { recursive: true });
        }

        // Generate filename
        const sanitizedTitle = sanitizeFilename(lessonTitle);
        const dateStr = date.split('T')[0]; // Get YYYY-MM-DD format
        let fileName = `${gradeNumber}_${sanitizedTitle}_${dateStr}.html`;
        let filePath = path.join(gradeDir, fileName);

        // Handle duplicate filenames
        let counter = 1;
        while (fs.existsSync(filePath)) {
            fileName = `${gradeNumber}_${sanitizedTitle}_${dateStr}_${counter}.html`;
            filePath = path.join(gradeDir, fileName);
            counter++;
        }

        // Save HTML file
        fs.writeFileSync(filePath, htmlContent, 'utf8');

        // Update database
        const db = readDatabase();
        const lessonData = {
            id,
            fileName,
            lessonTitle,
            grade: gradeFolder,
            date: dateStr,
            teacherName,
            classes,
            unit,
            duration,
            objectives,
            materials,
            stages,
            assessment,
            reflection,
            createdAt: new Date().toISOString(),
            filePath: `lesson-plans/${gradeFolder}/${fileName}`
        };

        if (!db[gradeFolder]) {
            db[gradeFolder] = [];
        }
        db[gradeFolder].push(lessonData);

        if (writeDatabase(db)) {
            res.json({
                success: true,
                message: 'Lesson saved successfully',
                id,
                filePath: lessonData.filePath
            });
        } else {
            // Clean up file if database update failed
            try {
                fs.unlinkSync(filePath);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
            res.status(500).json({ error: 'Failed to update database' });
        }

    } catch (error) {
        console.error('Error saving lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/lessons - Get all lessons
app.get('/api/lessons', (req, res) => {
    try {
        const db = readDatabase();
        res.json(db);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/lessons/:grade - Get lessons for specific grade
app.get('/api/lessons/:grade', (req, res) => {
    try {
        const { grade } = req.params;
        const validGrades = ['7th-grade', '8th-grade', '9th-grade'];

        if (!validGrades.includes(grade)) {
            return res.status(400).json({ error: 'Invalid grade' });
        }

        const db = readDatabase();
        res.json({ [grade]: db[grade] || [] });
    } catch (error) {
        console.error('Error fetching lessons for grade:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/lesson/:id - Get specific lesson
app.get('/api/lesson/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = readDatabase();

        for (const grade in db) {
            const lesson = db[grade].find(l => l.id === id);
            if (lesson) {
                return res.json(lesson);
            }
        }

        res.status(404).json({ error: 'Lesson not found' });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/lesson/:id - Delete lesson
app.delete('/api/lesson/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = readDatabase();

        for (const grade in db) {
            const lessonIndex = db[grade].findIndex(l => l.id === id);
            if (lessonIndex !== -1) {
                const lesson = db[grade][lessonIndex];

                // Delete file
                const filePath = path.join(__dirname, '..', lesson.filePath);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (fileError) {
                    console.error('Error deleting file:', fileError);
                }

                // Remove from database
                db[grade].splice(lessonIndex, 1);
                writeDatabase(db);

                return res.json({ success: true, message: 'Lesson deleted successfully' });
            }
        }

        res.status(404).json({ error: 'Lesson not found' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve static files from lesson-plans directory
app.use('/lesson-plans', express.static(path.join(__dirname, '..', 'lesson-plans')));

// Image upload endpoint
app.post('/api/upload-image', (req, res) => {
    try {
        console.log('Image upload request received');
        // For now, we'll handle base64 images sent from client
        // In a production app, you'd want proper file upload handling
        const { imageData, fileName } = req.body;

        if (!imageData || !fileName) {
            console.log('Missing image data or filename');
            return res.status(400).json({ error: 'Missing image data or filename' });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        console.log('Uploads directory:', uploadsDir);
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('Created uploads directory');
        }

        // Remove data URL prefix if present
        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

        // Generate unique filename
        const ext = fileName.split('.').pop();
        const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const filePath = path.join(uploadsDir, uniqueFileName);

        console.log('Saving image to:', filePath);

        // Save the image
        fs.writeFileSync(filePath, base64Data, 'base64');

        console.log('Image saved successfully');

        res.json({
            success: true,
            imageUrl: `/uploads/${uniqueFileName}`,
            message: 'Image uploaded successfully'
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image: ' + error.message });
    }
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Lesson Planner Server running on port ${PORT}`);
    console.log(`Database path: ${DATABASE_PATH}`);
    console.log(`Lesson plans directory: ${LESSON_PLANS_DIR}`);
});

module.exports = app;