# this imports the code from files and modules
from flask import Flask, request, jsonify
from flask_cors import CORS 
import utilities as u
import os
import ctypes
import store_helper as sh
import process_text
import block_builder
import sd_generator as sd

# This is a fix for the way that python doesn't release system memory back to the OS and it was leading to locking up the system
libc = ctypes.cdll.LoadLibrary("libc.so.6")
M_MMAP_THRESHOLD = -3

# Set malloc mmap threshold.
libc.mallopt(M_MMAP_THRESHOLD, 2**20)
# Ensure the directory exists



# Initialize the Flask application
app = Flask(__name__)
os.makedirs('static/images', exist_ok=True)

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

if __name__ == '__main__':
    app.run(debug=True)