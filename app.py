# this imports the code from files and modules
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS 
import os
import ctypes
import store_helper as sh
import block_builder
import sd_generator as sd

# This is a fix for the way that python doesn't release system memory back to the OS and it was leading to locking up the system
libc = ctypes.cdll.LoadLibrary("libc.so.6")
M_MMAP_THRESHOLD = -3

# Set malloc mmap threshold.
libc.mallopt(M_MMAP_THRESHOLD, 2**20)

# Initialize the Flask application
app = Flask(__name__)
os.makedirs('static/images', exist_ok=True)

# Serve files from the 'dependencies' directory
@app.route('/static/<path:filename>')
def custom_static(filename):
    return send_from_directory('static', filename)

# Serve HTML files from the main directory
@app.route('/<path:filename>')
def serve_html(filename):
    return send_from_directory('.', filename)

@app.after_request
def apply_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

# Default route for index
@app.route('/')
def index():
    return send_from_directory('.', 'storeUI.html')  # Make sure this points to your main HTML file

CORS(app)# Route to handle the incoming POST request with user description

@app.route('/process-description', methods=['POST'])
def process_description():
    data = request.json  # Get the JSON data from the request
    user_input = data.get('user_input', '')  # Extract the 'user_input' field
    # Print the received input to the console
    print(f"Received user input: {user_input}")
    # Call the LLM with the user input and return the result
    llm_output = sh.call_llm_and_cleanup(user_input)
    processed_blocks = block_builder.build_blocks(llm_output, block_builder.block_id)


    return jsonify({'html_blocks': processed_blocks})  # Return the LLM output as JSON

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.get_json()
    image_subject = data.get('store_name')
    sd_prompt = data.get('sd_prompt')
    image_subject_name = data.get('store_front_sd_prompt')

    if not sd_prompt:
        return jsonify({'error': 'Missing sd_prompt'}), 400
    image_subject = data.get('image_subject')
    if not sd_prompt:
        return jsonify({'error': 'Missing sd_prompt'}), 400

    try:
        image_url = sd.preview_and_generate_image(image_subject,image_subject_name, sd_prompt)
        return jsonify({'image_url': image_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# New route to convert HTML to PDF
@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    data = request.json
    html_content = data.get('html_content', '')
    title = data.get('title', 'output')  # Default to 'output' if no title is provided
    print(f"Received HTML content for title: {title}")
    print(html_content)

    if not html_content:
        return jsonify({'error': 'No HTML content provided'}), 400
    
    
    # Define the directory where the HTML files will be stored
    output_dir = os.path.join(app.root_path, 'static', 'html_files')
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the HTML content to a file with the processed title
    html_filename = f"{title}.html"
    html_filepath = os.path.join(output_dir, html_filename)
    
    with open(html_filepath, 'w', encoding='utf-8') as file:
        file.write(html_content)

    # Return the URL to access the HTML file
    file_url = f"/static/html_files/{html_filename}"
    return jsonify({'html_url': file_url}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=True)  # Run the app on localhost, port 7860
