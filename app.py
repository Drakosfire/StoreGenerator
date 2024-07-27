# this imports the code from files and modules
import gradio as gr
import utilities as u
import os
import ctypes
import store_helper as sh
import process_text
import process_html


# This is a fix for the way that python doesn't release system memory back to the OS and it was leading to locking up the system
libc = ctypes.cdll.LoadLibrary("libc.so.6")
M_MMAP_THRESHOLD = -3

# Set malloc mmap threshold.
libc.mallopt(M_MMAP_THRESHOLD, 2**20)

# Declare accessible directories
base_dir = os.path.dirname(os.path.abspath(__file__))  # Gets the directory where app.py is located
print(f"Base Directory :",base_dir)
list_of_static_dir = [os.path.join(base_dir, "output"), 
                    os.path.join(base_dir, "dependencies"),
                    os.path.join(base_dir, "galleries")] 
gr.set_static_paths(paths=list_of_static_dir)

    
# Build gradio app
# Storing everything inside the Blocks to be accessible to the app

with gr.Blocks() as demo:
    # Functions and State Variables
    store_dict= gr.State()
    store_name = gr.State()
    store_description = gr.State()
    store_reputation = gr.State()
    store_backstory = gr.State()
    store_sd_prompt = gr.State()
    store_location = gr.State()
    store_type = gr.State()
    store_size = gr.State()
    store_owner = gr.State()
    store_employees = gr.State()
    store_hours = gr.State()
    store_services = gr.State()
    store_specialties = gr.State()
    notable_customers = gr.State()
    store_quests = gr.State()
    store_rumors = gr.State()
    store_security = gr.State()
    store_inventory = gr.State()
    store_inventory_dict = gr.State()
    specialties_description = gr.State()

    def check_and_process_contents(item):
        if item:
            if len(item) > 0:
                store_value = item
                # if type(store_value) == list:
                store_value = process_text.format_qualities(store_value)
        else : store_value = ""
        return store_value
    
    def gen_store_desc(user_description): 
        llm_output = sh.call_llm_and_cleanup(user_description)
        store_dict = sh.convert_to_dict(llm_output)
        # Key List for checking is speciufic keys are present before running parsing functions
        keys_list = list(llm_output)
        store_name_value = store_dict['store_name']
        store_description_value = store_dict['store_description']
        store_reputation_value = store_dict['store_reputation']
        store_backstory_value = store_dict['store_backstory']
        store_sd_prompt_value = store_dict['store_sd_prompt']
        store_type_value = store_dict['store_type']
        store_size_value = store_dict['store_size']
        store_location_value = check_and_process_contents(store_dict['store_location'])
        store_owner_value = check_and_process_contents(store_dict['store_owners'])
        store_employees_value = check_and_process_contents(store_dict['store_employees'])
        store_hours_value = store_dict['store_hours']
        store_services_value = check_and_process_contents(store_dict['store_services'])
        store_specialties_value = check_and_process_contents(store_dict['store_specialties'])
        notable_customers_value = check_and_process_contents(store_dict['store_customers'])
        store_quests_value = check_and_process_contents(store_dict['store_quests'])
        store_rumors_value = check_and_process_contents(store_dict['store_rumors'])
        store_security_value = check_and_process_contents(store_dict['store_security'])

        
        #Return each State variable twice, once to the variable and once to the textbox
        return [store_dict, store_dict,
                store_name_value, store_name_value,
                store_description_value, store_description_value,
                store_reputation_value, store_reputation_value,
                store_backstory_value, store_backstory_value,
                store_sd_prompt_value, store_sd_prompt_value,
                store_type_value, store_type_value,
                store_size_value, store_size_value,
                store_location_value, store_location_value,
                store_owner_value, store_owner_value,
                store_employees_value,store_employees_value,
                notable_customers_value, notable_customers_value,
                store_hours_value, store_hours_value,
                store_services_value, store_services_value,
                store_specialties_value, store_specialties_value,
                store_quests_value, store_quests_value,
                store_rumors_value, store_rumors_value,
                store_security_value, store_security_value
                ]
    
    def gen_store_inventory(store_name, store_type, store_size, store_owner, store_reputation): 
        inventory_description = f"{store_name}, {store_type} {store_size} {store_owner} {store_reputation}"
        inventory_dict = sh.call_llm_and_cleanup(inventory_description, inventory=True)
        inventory_dict = sh.convert_to_dict(inventory_dict)
        if inventory_dict['store_inventory']:
            store_inventory_value = inventory_dict['store_inventory']
            store_inventory_value = process_text.format_inventory(store_inventory_value)
        
        #Return each State variable twice, once to the variable and once to the textbox
        return [store_inventory_value,store_inventory_value
                ]
    def store_desc_to_dict(store_name,
                            store_description,
                            store_reputation,
                            store_backstory,
                            store_sd_prompt,
                            store_location,
                            store_type,
                            store_size,
                            store_owner,
                            store_employees,
                            store_hours,
                            store_services,
                            store_specialties,
                            notable_customers,
                            store_quests,
                            store_rumors,
                            store_security,
                            store_inventory
                            ):
        store_dict = process_text.parse_text_to_store_dict(store_name,
                            store_description,
                            store_reputation,
                            store_backstory,
                            store_sd_prompt,
                            store_location,
                            store_type,
                            store_size,
                            store_owner,
                            store_employees,
                            store_hours,
                            store_services,
                            store_specialties,
                            notable_customers,
                            store_quests,
                            store_rumors,
                            store_security,
                            store_inventory)
        
        # Process each variable and rebuild the store dict format, pass back as dictionary to the store_dict state variable.
        store_dict = sh.convert_to_dict(store_dict)
        return store_dict, store_dict
    
    def inventory_to_dict(inventory):
        inventory_dict = process_text.parse_text_to_inventory_dict(inventory)
        # Convert text format to data object dictionary and check for validity
        inventory_dict = sh.convert_to_dict(inventory_dict)
        return inventory_dict, inventory_dict

     # Build html text by processing the generated dictionaries.
    def build_html_file(store_dict):
        template = process_html.dict_template
        if store_dict == None:
            store_dict = template

        store_file_path = process_html.build_html_base(store_dict)
        
        if not os.path.exists(store_file_path):
            print(f"{store_file_path} not found")
        else: print(f"{store_file_path} found")
        iframe = f"""<iframe src="file={store_file_path}" width="100%" height="500px"></iframe>"""
        
        return iframe
    
#Function to dynamically render textbox if it has text.                
    def update_visibility(textbox):        
        if not textbox:
            return gr.update(visible=False)
        return gr.update(visible=True)
    with gr.Tab("Store"):
        user_store_dict = gr.Textbox(label = "Step 1 : What are the core qualities of the store?",
                                                lines = 1, placeholder=f"Ex : A trade shop with a female ogre merchant, basic trade goods and travel supplies, has a secret basement for smuggling.",
                                                elem_id= "custom-textbox")
        desc_gen = gr.Button(value = "Click to Generate Description")
        store_name_output = gr.Textbox(label = "Store Name", lines = 1, interactive = True, visible = False)
        store_name_output.change(fn=update_visibility,
                                                    inputs=[store_name_output],
                                                    outputs=[store_name_output])
        store_dict_gen = gr.Button(value = "Click to convert test to data object")
        store_dict_output = gr.Textbox(label = 'Inventory', lines = 16, interactive=True, visible=True)
        
        store_dict_gen.click(fn = store_desc_to_dict, inputs = [store_name,
                                                                store_description,
                                                                store_reputation,
                                                                store_backstory,
                                                                store_sd_prompt,
                                                                store_location,
                                                                store_type,
                                                                store_size,
                                                                store_owner,
                                                                store_employees,
                                                                store_hours,
                                                                store_services,
                                                                store_specialties,
                                                                notable_customers,
                                                                store_quests,
                                                                store_rumors,
                                                                store_security,
                                                                store_inventory],
                        outputs= [store_dict, store_dict_output])
        store_description_output = gr.Textbox(label = "Store Description", lines = 1, interactive = True, visible = True)
        store_description_output.change(fn=update_visibility,
                                                    inputs=[store_description_output],
                                                    outputs=[store_description_output])
        store_reputation_output = gr.Textbox(label = "Store Reputation", lines = 1, interactive = True, visible = True)
        store_backstory_output = gr.Textbox(label = "Store Backstory", lines = 1, interactive = True, visible = True)
        store_sd_prompt_output = gr.Textbox(label = "Store Image Prompt", lines = 1, interactive = True, visible = True)
        store_type_output = gr.Textbox(label = "Store Type", lines = 1, interactive = True, visible = True)
        store_size_output = gr.Textbox(label = "Store Size", lines = 1, interactive = True, visible = True)
        store_location_output = gr.Textbox(label = "Store Location", lines = 1, interactive = True, visible = True)
        store_owner_output = gr.Textbox(label = "Owners", lines = 1, interactive = True, visible = True)
        store_employees_output = gr.Textbox(label = "Employees", lines = 1, interactive = True, visible = True)
        notable_customers_output = gr.Textbox(label = "Notable Customers", lines = 1, interactive = True, visible = True)
        store_hours_output = gr.Textbox(label = "Hours", lines = 1, interactive = True, visible = True)
        store_services_output = gr.Textbox(label = "Services", lines = 1, interactive = True, visible = True)
        store_specialties_output = gr.Textbox(label = "Specialties", lines = 1, interactive = True, visible = True)
        store_quests_output = gr.Textbox(label = "Quests", lines = 1, interactive = True, visible = True)
        store_rumors_output = gr.Textbox(label = "Rumors", lines = 1, interactive = True, visible = True)
        store_security_output = gr.Textbox(label = "Security", lines = 1, interactive = True, visible = True)


        desc_gen.click(fn = gen_store_desc, inputs = [user_store_dict],
                        outputs= [store_dict,store_dict,
                                    store_name, store_name_output,
                                    store_description, store_description_output,
                                    store_reputation, store_reputation_output,
                                    store_backstory, store_backstory_output,
                                    store_sd_prompt,store_sd_prompt_output,
                                    store_type, store_type_output,
                                    store_size, store_size_output,
                                    store_location, store_location_output,
                                    store_owner, store_owner_output,
                                    store_employees, store_employees_output,
                                    notable_customers, notable_customers_output,
                                    store_hours, store_hours_output,
                                    store_services,store_services_output,     
                                    store_specialties,store_specialties_output,
                                    store_quests, store_quests_output,
                                    store_rumors, store_rumors_output,
                                    store_security, store_security_output                                                               
                                    ])
        
        image_path_list= u.absolute_path("./folder_with_images")
    
    with gr.Tab("Inventory"):        
        inv_gen = gr.Button(value = "Click to Generate Inventory")
        store_inventory_output = gr.Textbox(label = 'Inventory', lines = 16, interactive=True, visible=True)
        store_inventory_output.change(fn=update_visibility,
                                                    inputs=[store_inventory_output],
                                                    outputs=[store_inventory_output])
        inv_gen.click(fn = gen_store_inventory, inputs = [store_name, store_type, store_size, store_owner, store_reputation],
                        outputs= [store_inventory, store_inventory_output                                    
                                    ])
        inv_dict_gen = gr.Button(value = "Click to convert test to data object")
        store_inventory_dict_output = gr.Textbox(label = 'Inventory', lines = 16, interactive=True, visible=True)
        
        inv_dict_gen.click(fn = inventory_to_dict, inputs = [store_inventory_output],
                        outputs= [store_inventory_dict, store_inventory_dict_output                                    
                                    ])
        

        image_path_list= u.absolute_path("./folder_with_images")
    with gr.Tab("HTML"):
        with gr.Row():
            with gr.Column():
                gen_html = gr.Button(value = "Step 3 : Generate html")
                html = gr.HTML(label="HTML preview", show_label=True)
            gen_html.click(build_html_file,inputs =[store_dict], 
                        outputs= html)
            
    if __name__ == "__main__":
        demo.launch(allowed_paths=list_of_static_dir)  

