"""
Flask application for Brain Tumor Classification System.
"""

import os
import json
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import base64

app = Flask(__name__, template_folder='.', static_folder='static', static_url_path='/static')
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB max file size

socketio = SocketIO(app, cors_allowed_origins="*")

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('static', exist_ok=True)
os.makedirs('static/images', exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Serve the main HTML page."""
    return render_template('index.html')


@app.route('/sample-images', methods=['GET'])
def get_sample_images():
    """Return list of sample images for the gallery."""
    # Sample images data structure
    # You can modify this to read from a directory or database
    sample_images = [
        {
            "category": "glioma",
            "filename": "glioma_001.jpg",
            "display_name": "Glioma Tumor",
            "path": "/static/images/samples/glioma_001.jpg"
        },
        {
            "category": "meningioma",
            "filename": "meningioma_001.jpg",
            "display_name": "Meningioma Tumor",
            "path": "/static/images/samples/meningioma_001.jpg"
        },
        {
            "category": "pituitary",
            "filename": "pituitary_001.jpg",
            "display_name": "Pituitary Tumor",
            "path": "/static/images/samples/pituitary_001.jpg"
        },
        {
            "category": "no_tumor",
            "filename": "no_tumor_001.jpg",
            "display_name": "No Tumor",
            "path": "/static/images/samples/no_tumor_001.jpg"
        }
    ]
    
    # Add more sample images (you can expand this list)
    for i in range(2, 6):
        for category in ["glioma", "meningioma", "pituitary", "no_tumor"]:
            sample_images.append({
                "category": category,
                "filename": f"{category}_{i:03d}.jpg",
                "display_name": category.replace("_", " ").title(),
                "path": f"/static/images/samples/{category}_{i:03d}.jpg"
            })
    
    return jsonify({"images": sample_images})


@app.route('/predict-sample', methods=['POST'])
def predict_sample():
    """Handle prediction request for sample images."""
    try:
        data = request.get_json()
        category = data.get('category', 'no_tumor')
        filename = data.get('filename', '')
        
        # Mock prediction results
        # In a real application, you would load your ML model here
        confidence_scores = {
            "glioma": 0.0,
            "meningioma": 0.0,
            "pituitary": 0.0,
            "no_tumor": 0.0
        }
        
        # Set high confidence for the selected category
        confidence_scores[category] = 95.7
        # Distribute remaining probability
        remaining = (100 - 95.7) / 3
        for key in confidence_scores:
            if key != category:
                confidence_scores[key] = remaining
        
        # Mock preprocessing steps
        preprocessing_steps = [
            {
                "name": "Original Image",
                "description": "Input brain MRI scan",
                "image_url": f"/static/images/samples/{filename}"
            },
            {
                "name": "Grayscale Conversion",
                "description": "Converted to grayscale",
                "image_url": f"/static/images/samples/{filename}"
            },
            {
                "name": "Noise Reduction",
                "description": "Applied Gaussian blur",
                "image_url": f"/static/images/samples/{filename}"
            },
            {
                "name": "Normalization",
                "description": "Normalized pixel values",
                "image_url": f"/static/images/samples/{filename}"
            }
        ]
        
        result = {
            "prediction": category,
            "confidence_scores": confidence_scores,
            "uploaded_image_url": f"/static/images/samples/{filename}",
            "preprocessing_steps": preprocessing_steps
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction request for uploaded images."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Mock prediction results
            # In a real application, you would load your ML model here
            confidence_scores = {
                "glioma": 25.0,
                "meningioma": 30.0,
                "pituitary": 20.0,
                "no_tumor": 25.0
            }
            
            # Mock preprocessing steps
            preprocessing_steps = [
                {
                    "name": "Original Image",
                    "description": "Input brain MRI scan",
                    "image_url": f"/uploads/{filename}"
                },
                {
                    "name": "Grayscale Conversion",
                    "description": "Converted to grayscale",
                    "image_url": f"/uploads/{filename}"
                },
                {
                    "name": "Noise Reduction",
                    "description": "Applied Gaussian blur",
                    "image_url": f"/uploads/{filename}"
                },
                {
                    "name": "Normalization",
                    "description": "Normalized pixel values",
                    "image_url": f"/uploads/{filename}"
                }
            ]
            
            # Find the prediction with highest confidence
            prediction = max(confidence_scores, key=confidence_scores.get)
            
            result = {
                "prediction": prediction,
                "confidence_scores": confidence_scores,
                "uploaded_image_url": f"/uploads/{filename}",
                "preprocessing_steps": preprocessing_steps
            }
            
            return jsonify(result)
        
        return jsonify({"error": "Invalid file type"}), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files."""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    print('Client connected')
    emit('response', {'message': 'Connected to Brain Tumor Assistant'})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    print('Client disconnected')


@socketio.on('message')
def handle_message(data):
    """Handle chat messages from client."""
    message = data.get('message', '')
    print(f'Received message: {message}')
    
    # Mock AI response
    # In a real application, you would integrate with an AI service
    responses = [
        "I can help you understand brain tumor classifications. What would you like to know?",
        "Based on the MRI scan analysis, I can provide information about different tumor types.",
        "Would you like to know more about glioma, meningioma, or pituitary tumors?",
        "I'm here to assist with brain tumor classification questions."
    ]
    
    import random
    response = random.choice(responses)
    
    emit('response', {'message': response})


def main():
    """Main entry point for the application."""
    # Run the Flask app with Socket.IO
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)


if __name__ == "__main__":
    main()
