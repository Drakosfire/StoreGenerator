# this imports the code from files and modules
import gradio as gr
import utilities as u
import os
import ctypes
import store_helper as sh


# This is a fix for the way that python doesn't release system memory back to the OS and it was leading to locking up the system
libc = ctypes.cdll.LoadLibrary("libc.so.6")
M_MMAP_THRESHOLD = -3

# Set malloc mmap threshold.
libc.mallopt(M_MMAP_THRESHOLD, 2**20)

# Declare accessible directories
base_dir = os.path.dirname(os.path.abspath(__file__))  # Gets the directory where the script is located
print(f"Base Directory :",base_dir)
list_of_static_dir = [os.path.join(base_dir, "output"), 
                    os.path.join(base_dir, "dependencies"),
                    os.path.join(base_dir, "galleries")] 
gr.set_static_paths(paths=list_of_static_dir)

# Build gradio app
# Storing everything inside the Blocks to be accessible to the app

with gr.Blocks() as demo:
    # Functions and State Variables
    store_description= gr.State()
    specialties_description = gr.State()

    def gen_store_desc(user_description): 
        
        llm_output = sh.call_llm_and_cleanup(user_description)
        #user_monster = sh.convert_to_dict(llm_output)
        #user_monster = llm_output
        #keys_list = list(user_monster)
            
        
        #Return each State variable twice, once to the variable and once to the textbox
        return [llm_output,llm_output]
    
    def gen_store_specialties(store_description): 
        
        llm_output = sh.call_llm_and_cleanup(store_description, specialties=True)
        #user_monster = sh.convert_to_dict(llm_output)
        #user_monster = llm_output
        #keys_list = list(user_monster)
            
        
        #Return each State variable twice, once to the variable and once to the textbox
        return [llm_output,llm_output]

    #Function to dynamically render textbox if it has text.                
    def update_visibility(textbox):        
        if not textbox:
            return gr.update(visible=False)
        return gr.update(visible=True)
    with gr.Tab("Store"):
        user_store_description = gr.Textbox(label = "Step 1 : What are the core qualities of the store?",
                                                lines = 1, placeholder=f"Ex : A trade shop with a female ogre merchant, basic trade goods and travel supplies, has a secret basement for smuggling.",
                                                elem_id= "custom-textbox")
        desc_gen = gr.Button(value = "Click to Generate Description")
        store_description_output = gr.Textbox(label = 'Description', lines = 2, interactive=True, visible=True)
        store_description_output.change(fn=update_visibility,
                                                    inputs=[store_description_output],
                                                    outputs=[store_description_output])
        desc_gen.click(fn = gen_store_desc, inputs = [user_store_description],
                        outputs= [store_description, store_description_output                                    
                                    ])

        image_path_list= u.absolute_path("./folder_with_images")
    
    with gr.Tab("Inventory"):
        user_store_description = gr.Textbox(label = "Step 1 : What are the core qualities of the store?",
                                                lines = 1, placeholder=f"Ex : A trade shop with a female ogre merchant, basic trade goods and travel supplies, has a secret basement for smuggling.",
                                                elem_id= "custom-textbox")
        desc_gen = gr.Button(value = "Click to Generate Description")
        store_description_output = gr.Textbox(label = 'Description', lines = 2, interactive=True, visible=True)
        store_description_output.change(fn=update_visibility,
                                                    inputs=[store_description_output],
                                                    outputs=[store_description_output])
        desc_gen.click(fn = gen_store_desc, inputs = [user_store_description],
                        outputs= [store_description, store_description_output                                    
                                    ])

        image_path_list= u.absolute_path("./folder_with_images")
    if __name__ == "__main__":
        demo.launch(allowed_paths=list_of_static_dir)  

