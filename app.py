from flask import Flask, request, jsonify, url_for, render_template
from flask_cors import CORS 
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
        'all_css': url_for('static', filename='all.css'),
        'font_css': url_for('static', filename='css.css?family=Open+Sans:400,300,600,700'),
        'bundle_css': url_for('static', filename='bundle.css'),
        'style_css': url_for('static', filename='style.css'),
        'phb_style_css': url_for('static', filename='5ePHBstyle.css'),
        'store_ui_css': url_for('static', filename='storeUI.css')
    }
    return render_template('storeUI.html', css_files=css_files)

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
@app.route('/save-generated-data', methods=['POST'])
def save_generated_data():
    data = request.json  # Receive JSON data from the client

    # Path to save the JSON file
    file_path = os.path.join('saved_data', 'generated_data.json')

    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Write the JSON data to the file
        with open(file_path, 'w') as json_file:
            json.dump(data, json_file, indent=4)

        return jsonify({"message": "Data saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=True)
