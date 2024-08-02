import fal_client
def preview_and_generate_image(image_subject, image_subject_name ,sd_prompt):   
    handler = fal_client.submit(
        "fal-ai/flux/dev",
        arguments={
            "prompt": f"A fantasy image of a {image_subject} in a fantasy world, the name of the store is {image_subject_name} it looks likes {sd_prompt}",
            "num_inference_steps": 28,
            "guidance_scale": 3.5,

        },
    )

    result = handler.get()
    return result['images'][0]['url']
