# SnapPic - Live-Coding Prompt

## Base Prompt for All Tools

### Role
You are an experienced Python developer with expertise in Flask, JavaScript, and Progressive Web Apps.

### Task
Create a Flask web app named "SnapPic" with the following functionality:

#### Frontend (PWA)
- **Upload Interface:** Users can take photos with their smartphone camera or select from gallery and upload images
- **Comment Field:** Short text for the image (max. 100 characters)
- **Responsive Design:** Mobile-first, works optimally on smartphones
- **PWA Features:** Manifest, Service Worker for offline functionality, app icon
- **Design:** Modern, professional design with Material Design principles

#### Backend (Flask)
- **Upload Endpoint:** `/upload` (POST) for image + comment
- **Gallery Endpoint:** `/gallery` (GET) for gallery view
- **API Endpoint:** `/api/images` (GET) for JSON data of current images
- **Static Serving:** Images available under `/uploads/`
- **Home Route:** `/` for upload interface

#### Core Logic
- **Timing:** Each image is visible for 5 seconds, then 10 seconds fade-out animation, then automatic deletion
- **Capacity:** Maximum 10 images simultaneously in the gallery
- **FIFO Principle:** New images displace the oldest images
- **Auto-Refresh:** Gallery updates automatically every 2 seconds
- **File Cleanup:** Automatic deletion of image files after expiration

#### Technical Requirements
- **Dependencies:** Only Flask (no additional Python packages)
- **Data Storage:** Local JSON file for metadata, images in file system
- **Deployment:** Can be started directly with `python app.py`
- **Port:** Flask app runs on port 5000
- **File Formats:** Supports JPG, PNG, WEBP
- **File Size:** Maximum 5MB per image

### Constraints
- Use only standard Python libraries + Flask
- No external CDNs, APIs, or frameworks
- Vanilla HTML/CSS/JavaScript (no frontend framework)
- Compatible with Python 3.8+
- Images stored in `uploads/` folder
- Metadata in `data.json` in main directory

### Expected File Structure
```
snappic/
├── app.py                 # Flask app with all routes
├── data.json             # Image metadata
├── templates/
│   ├── index.html        # Upload interface
│   └── gallery.html      # Gallery view
├── static/
│   ├── style.css         # Styling for all pages
│   ├── script.js         # JavaScript functionality
│   ├── manifest.json     # PWA manifest
│   └── icon-192.png      # PWA icon
├── uploads/              # Image uploads (created automatically)
└── requirements.txt      # Dependencies (only Flask)
```

### Implementation Details
- **Timestamps:** Use `datetime.now().isoformat()` for unique filenames
- **Validation:** Check file type, file size, and comment length
- **Responsive CSS:** CSS Grid/Flexbox for all screen sizes
- **JavaScript:** Timer management and auto-refresh logic
- **Error Handling:** Meaningful error messages for upload problems
- **Threading:** Background timer for automatic image deletion

### Additional Requirements
- Implement basic security measures against malicious uploads
- Create a functional Service Worker for PWA features
- Ensure the app works even with slower connections
- Add loading indicators for upload processes

## Important Changes:

1. **Clearer Specifications:** File formats, file size, and technical details clarified
2. **Consistency:** "Apple Material Design" → "Material Design principles"
3. **Data Storage:** Explicit mention of JSON file for metadata
4. **Security:** Validation and security measures added
5. **Threading:** Explicit mention for background timer
6. **PWA Details:** Service Worker and icon requirements specified
7. **Structure:** Clearer separation between frontend and backend requirements
