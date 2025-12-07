# Lesson Planner Archive System

This document describes the archive system for the Lesson Planner web application. The system allows users to save generated lesson plans locally in the browser and view them in an organized archive.

## Features

- **Automatic Saving**: Lesson plans are automatically saved when generated
- **Manual Saving**: "Save Locally" button for manual saves
- **Local Storage**: Lessons stored in browser localStorage, no server required
- **Organized Storage**: Lessons organized by grade (7th, 8th, 9th)
- **Archive Viewer**: Web interface to browse, search, and manage saved lessons
- **Offline Support**: Works without internet connection
- **Data Management**: View, delete, and organize saved lesson plans

## File Structure

```
c:\Users\Pc\Desktop\Pixelearn\
├── games\
│   ├── LESSON PLANNER.html    # Main lesson planner
│   └── lesson-archive.html    # Archive viewer page
└── scripts\
    ├── lesson-planner.js      # Main script with localStorage features
    └── archive-viewer.js      # Archive viewer functionality
```

## Setup Instructions

### 1. Access the Applications

- **Lesson Planner**: Open `games/LESSON PLANNER.html` in your browser
- **Archive Viewer**: Open `games/lesson-archive.html` in your browser

No server setup required! The application works entirely in the browser using localStorage.

## Storage System

The application uses browser localStorage to persist lesson plans locally. No server or external APIs are required.

### localStorage Key: 'lessonPlansDatabase'

The data is stored as a JSON object with the following structure:

## Storage Structure

The localStorage contains lesson data organized by grade:

```json
{
  "7th-grade": [
    {
      "id": "unique-id-123",
      "lessonTitle": "Present Perfect Tense",
      "grade": "7th-grade",
      "date": "2025-11-07",
      "teacherName": "Zakaria Ghazali",
      "classes": ["1-1", "1-2"],
      "unit": "Unit 3: Grammar & Communication",
      "duration": "55 minutes",
      "objectives": ["Students will be able to..."],
      "materials": [{"checked": true, "text": "Whiteboard"}],
      "stages": [{"stage": "Warm-up", "time": "5 min", ...}],
      "assessment": "Students will complete...",
      "reflection": "This lesson introduces...",
      "htmlContent": "<!DOCTYPE html><html>...</html>",
      "createdAt": "2025-11-07T10:30:00Z"
    }
  ],
  "8th-grade": [],
  "9th-grade": []
}
```

## File Naming Convention

Saved lesson files follow this pattern:
```
{gradeNumber}_{LessonTitle}_{YYYY-MM-DD}.html
```

Examples:
- `7_Present_Perfect_Tense_2025-11-07.html`
- `8_Advanced_Writing_2025-11-07.html`
- `9_Literature_Analysis_2025-11-05.html`

**Rules:**
- Grade number: 7, 8, or 9 (extracted from "7th", "8th", "9th")
- Lesson title: Sanitized (spaces → underscores, special chars removed, max 50 chars)
- Date: ISO format YYYY-MM-DD
- Duplicate handling: Appends number if filename exists (e.g., `_1`, `_2`)

## Usage

### Creating and Saving Lessons

1. Fill out the lesson plan form in `LESSON PLANNER.html`
2. Click "Generate Lesson Plan" - preview opens in new tab
3. Lesson automatically saves to local storage
4. Success notification appears: "✓ Lesson saved locally!"
5. Use "Save Locally" button for manual saves
6. Use "View Archive" button to access saved lessons

### Viewing Archive

1. Open `lesson-archive.html` in browser or click "View Archive" from planner
2. Switch between grade tabs (7th, 8th, 9th)
3. Use search to filter lessons by title, teacher, or class
4. Click "View" to open saved lesson HTML in new window
5. Click "Delete" to remove lesson (with confirmation)

## Error Handling

- **Server Offline**: Graceful degradation, app works without saving
- **Save Failures**: Clear error messages, retry options
- **File Conflicts**: Automatic numbering for duplicate filenames
- **Network Issues**: Retry mechanisms and user feedback

## Technical Details

### Storage
- **localStorage**: Browser-based key-value storage
- **Data Format**: JSON with lesson metadata and HTML content
- **Persistence**: Survives browser restarts (until cleared)
- **Size Limit**: Typically 5-10MB per origin

### Frontend
- **Vanilla JavaScript**: No frameworks required
- **Responsive Design**: Works on desktop and mobile
- **Offline Support**: No internet connection needed
- **Notifications**: Success/error feedback system

### Security
- Input sanitization for HTML content
- Data stored locally in browser (no external transmission)

## Troubleshooting

### Lessons Not Saving
- Check browser console for errors
- Ensure localStorage is not disabled in browser settings
- Verify browser supports localStorage (most modern browsers do)
- Check if localStorage quota is exceeded (clear some data if needed)

### Archive Page Empty
- Check if lessons exist in browser localStorage
- Open browser developer tools (F12) → Application/Storage → Local Storage
- Look for 'lessonPlansDatabase' key
- If missing, try saving a new lesson first

### Lessons Not Opening
- Check if popup blocker is enabled (allow popups for this site)
- Verify lesson data contains htmlContent
- Check browser console for JavaScript errors

## Development Notes

- localStorage initializes automatically with empty grade arrays
- HTML content stored as UTF-8 strings
- Timestamps stored in ISO format for sorting
- Archive viewer sorts lessons by creation date (newest first)
- Data persists across browser sessions until manually cleared

## Future Enhancements

- Export/import lesson data as JSON files for backup
- Cloud synchronization options
- Lesson plan templates and categories
- Enhanced search and filtering
- Lesson analytics and usage statistics
- Data migration from server-based systems