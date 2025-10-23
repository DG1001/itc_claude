from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import json
import threading
import time
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'jpg', 'jpeg', 'png', 'webp'}

DATA_FILE = 'data.json'
MAX_IMAGES = 10
IMAGE_DISPLAY_TIME = 5  # seconds
IMAGE_FADEOUT_TIME = 10  # seconds
TOTAL_LIFETIME = IMAGE_DISPLAY_TIME + IMAGE_FADEOUT_TIME

# Ensure required directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize data file
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump([], f)

def load_images():
    """Load image metadata from JSON file"""
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_images(images):
    """Save image metadata to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(images, f, indent=2)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def cleanup_expired_images():
    """Background thread to clean up expired images"""
    while True:
        time.sleep(1)  # Check every second
        images = load_images()
        current_time = datetime.now()
        updated = False

        for image in images[:]:
            upload_time = datetime.fromisoformat(image['timestamp'])
            age = (current_time - upload_time).total_seconds()

            # Delete if older than total lifetime
            if age > TOTAL_LIFETIME:
                # Delete file
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], image['filename'])
                if os.path.exists(filepath):
                    try:
                        os.remove(filepath)
                    except:
                        pass

                # Remove from metadata
                images.remove(image)
                updated = True

        if updated:
            save_images(images)

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_expired_images, daemon=True)
cleanup_thread.start()

@app.route('/')
def index():
    """Upload interface"""
    return render_template('index.html')

@app.route('/gallery')
def gallery():
    """Gallery view"""
    return render_template('gallery.html')

@app.route('/upload', methods=['POST'])
def upload():
    """Handle image upload"""
    # Validate file
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file format. Use JPG, PNG, or WEBP'}), 400

    # Validate comment
    comment = request.form.get('comment', '').strip()
    if len(comment) > 100:
        return jsonify({'error': 'Comment too long (max 100 characters)'}), 400

    # Generate unique filename
    timestamp = datetime.now().isoformat().replace(':', '-').replace('.', '-')
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{timestamp}.{ext}"

    # Save file
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        file.save(filepath)
    except Exception as e:
        return jsonify({'error': 'Failed to save image'}), 500

    # Load current images
    images = load_images()

    # Add new image
    new_image = {
        'filename': filename,
        'comment': comment,
        'timestamp': datetime.now().isoformat()
    }
    images.append(new_image)

    # Enforce FIFO with max 10 images
    while len(images) > MAX_IMAGES:
        old_image = images.pop(0)
        old_filepath = os.path.join(app.config['UPLOAD_FOLDER'], old_image['filename'])
        if os.path.exists(old_filepath):
            try:
                os.remove(old_filepath)
            except:
                pass

    # Save metadata
    save_images(images)

    return jsonify({'success': True, 'message': 'Image uploaded successfully'}), 200

@app.route('/api/images', methods=['GET'])
def get_images():
    """API endpoint for current images with timing info"""
    images = load_images()
    current_time = datetime.now()

    result = []
    for image in images:
        upload_time = datetime.fromisoformat(image['timestamp'])
        age = (current_time - upload_time).total_seconds()

        # Calculate state
        if age <= IMAGE_DISPLAY_TIME:
            state = 'visible'
        elif age <= TOTAL_LIFETIME:
            state = 'fading'
        else:
            continue  # Will be cleaned up by background thread

        result.append({
            'filename': image['filename'],
            'comment': image['comment'],
            'timestamp': image['timestamp'],
            'age': age,
            'state': state,
            'url': f"/uploads/{image['filename']}"
        })

    return jsonify(result)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded images"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
