from flask import Flask, request, jsonify, url_for, render_template, send_from_directory
from flask_cors import CORS 
from werkzeug.utils import secure_filename
import os
import ctypes
import json
import store_helper as sh
import block_builder as block_builder
import sd_generator as sd

# This is a fix for the way that python doesn't release system memory back to the OS
libc = ctypes.cdll.LoadLibrary("libc.so.6")
M_MMAP_THRESHOLD = -3
libc.mallopt(M_MMAP_THRESHOLD, 2**20)

# Initialize the Flask application
app = Flask(__name__)
CORS(app)

# Ensure static/images directory exists
os.makedirs('static/images', exist_ok=True)

# Automatically serve static files from the 'static' directory

# Route to serve the main page
@app.route('/')
def index():
    css_files = {
        'all_css': url_for('static', filename='./css/all.css'),
        'font_css': url_for('static', filename='./css/css.css?family=Open+Sans:400,300,600,700'),
        'bundle_css': url_for('static', filename='./css/bundle.css'),
        'style_css': url_for('static', filename='./css/style.css'),
        'phb_style_css': url_for('static', filename='./css/5ePHBstyle.css'),
        'store_ui_css': url_for('static', filename='./css/storeUI.css')
    }
    return render_template('storeUI.html', css_files=css_files)

@app.route('/saved_data/<path:filename>')
def serve_saved_data(filename):
    # Construct the full path to the file
    return send_from_directory('saved_data', filename)

@app.after_request
def apply_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

# Route to handle the incoming POST request with user description
@app.route('/process-description', methods=['POST'])
def process_description():
    data = request.json
    user_input = data.get('user_input', '')
    print(f"Received user input: {user_input}")
    llm_output = sh.call_llm_and_cleanup(user_input)
    processed_blocks = block_builder.build_blocks(llm_output, block_builder.block_id)
    return jsonify({'html_blocks': processed_blocks, 'llm_output': llm_output})

# Route to generate an image
@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.get_json()
    sd_prompt = data.get('sd_prompt')
    image_subject_name = data.get('store_front_sd_prompt')

    if not sd_prompt:
        return jsonify({'error': 'Missing sd_prompt'}), 400

    try:
        image_url = sd.preview_and_generate_image(data.get('image_subject'), image_subject_name, sd_prompt)
        return jsonify({'image_url': image_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Route to save the generated data as JSON
@app.route('/save-json', methods=['POST'])
def save_generated_data():
    data = request.json  # Receive JSON data from the client
    filename = data.get('filename', 'default_generated_data')

    # Path to save the JSON file
    file_path = os.path.join('saved_data',filename, f'{filename}.json')

    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Write the JSON data to the file
        with open(file_path, 'w') as json_file:
            json.dump(data, json_file, indent=4)

        return jsonify({"message": "Data saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper function to check allowed file extensions
def allowed_file(filename):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Route to upload images and save them
@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    # Get the image file and additional data
    image = request.files['image']
    directory_name = request.form.get('directoryName')
    block_id = request.form.get('blockId')

    # Validate and sanitize inputs
    if not allowed_file(image.filename):
        return jsonify({"error": "File type not allowed"}), 400
    if not directory_name or not block_id:
        return jsonify({"error": "Invalid directory name or block ID"}), 400

    # Ensure the directory exists
    directory_path = os.path.join('saved_data', directory_name)
    os.makedirs(directory_path, exist_ok=True)

    # Save the image with a secure filename
    filename = secure_filename(f"{block_id}_{image.filename}")
    image_path = os.path.join(directory_path, filename)

    try:
        # Save the image file
        image.save(image_path)

        # Return the URL for the image
        file_url = f'/saved_data/{directory_name}/{filename}'
        return jsonify({"fileUrl": file_url}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=True)
