import time
import replicate



start_time = time.time()
temp_image_path = "./image_temp/"

def preview_and_generate_image(image_subject ,sd_prompt):    
    
    output = replicate.run(
    "stability-ai/stable-diffusion-3",
    input={
        "cfg": 3.5,
        "steps": 28,
        "prompt": f"This is a {image_subject} it looks likes {sd_prompt} ",
        "aspect_ratio": "1:1",
        "output_format": "webp",
        "output_quality": 90,
        "negative_prompt": "",
        "prompt_strength": 0.85
    }
)
    print(output)
    image_url = output[0]  # Assume the first output is the image URL
    
    return image_url
   


