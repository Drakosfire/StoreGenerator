
# split text along : into key values.
def dict_from_text(data):
    lines = data.strip().split("\n")
    current_item = {}
    for line in lines:
        if ":" in line:
                key, value = line.split(":")
                key = key.strip()
                value = value.strip(", ")
                current_item[key] = value
    return current_item

def list_of_dict_from_text(data):
    
    lines = data.strip().split("\n")
    output_list = []
    # current_category = None
    current_item = {}

    for line in lines:
        line = line.strip()
        # print(f"line = {line}")
        if not line:
            continue
        if "name :" in line:
            if current_item: 
                output_list.append(current_item)
            current_item = {"name": line.split(":")[1].strip(", ")}
        
        elif ":" in line:
            key, value = line.split(":")
            key = key.strip()
            value = value.strip(", ")
            if key == "secrets" :
                value = list_from_text(value)
            current_item[key] = value
    
    if current_item:
        output_list.append(current_item)
    
    return output_list

def list_from_text(data): 
    # print(f"Incoming Text: {data}")
    value = [v.strip().strip("'").strip("\n") for v in data.split(",")]
    # print(f"Returned List : {value}")
    return value
        
#Function to process text from Key Value pairs into User Friendly text in a format that can be converted back to a dictionary
def format_qualities(qualities):
    # print(f"Formatting Start,{type(qualities)} ")
    formatted_text = ""
    if type(qualities) == list:
        # print("List")
        for item in qualities: 
            if type(item) == dict :  
                # print("List item Dictionary") 
                for key, value in item.items():
                    if type(value) == list:
                        formatted_text += f"{key} : "
                        for i in value:
                            formatted_text += f"{i} , "
                        formatted_text = formatted_text.rstrip(" ,")
                        formatted_text += "\n"
                        
                    else : 
                        formatted_text += f"{key} : {value}\n"
                formatted_text = formatted_text.rstrip(",")
                formatted_text += "\n"

            if type(item) == list:
                # print("List item List") 
                for i in item:
                    formatted_text += f"{i} , "
                formatted_text = formatted_text.rstrip(" ,")
            if type(item) == str:
                print(f"List : {item}") 
                formatted_text += f"{item} , "
            
                
        formatted_text = formatted_text.rstrip(",").rstrip(" ,")
        formatted_text += "\n "
        return formatted_text
    
    elif type(qualities) == dict: 
        for key, value in qualities.items():
            formatted_text += f"{key} : {value}\n"
            formatted_text = formatted_text.rstrip(",")
    return formatted_text

def parse_text_to_store_dict(store_name,
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
                            store_customers,
                            store_quests,
                            store_rumors,
                            store_security,
                            store_inventory):
    
    # Print variable, and check it's value and if length greater than 0.
    # Check for dict, str, list
       
    
    print(f"{store_inventory}")
    
    # Parse store description key : values with string values first
    store_dict = {}
    if store_name : 
        store_dict['store_name'] = store_name
    else: store_dict['store_name'] = ""

    if store_description : 
        store_dict['store_description'] = store_description
    else: store_dict['store_description'] = ""

    if store_reputation : 
        store_dict['store_reputation'] = store_reputation
    else: store_dict['store_reputation'] = ""

    if store_backstory : 
        store_dict['store_backstory'] = store_backstory
    else: store_dict['store_backstory'] = ""

    if store_type : 
        store_dict['store_type'] = store_type
    else: store_dict['store_type'] = ""

    if store_size : 
        store_dict['store_size'] = store_size
    else: store_dict['store_size'] = ""

    if store_hours : 
        store_dict['store_hours'] = store_hours
    else: store_dict['store_hours'] = ""

    if store_sd_prompt : 
        store_dict['store_sd_prompt'] = store_sd_prompt
    else: store_dict['store_sd_prompt'] = ""

    if store_location :
        store_dict['store_location'] = dict_from_text(store_location)
    else: store_dict['store_location'] = ''

    if store_owner :
        store_dict['store_owners'] = list_of_dict_from_text(store_owner)
    else: store_dict['store_owners'] = ''

    if store_employees :
        store_dict['store_employees'] = list_of_dict_from_text(store_employees)
    else: store_dict['store_employees'] = ''

    if store_quests :
        store_dict['store_quests'] = list_of_dict_from_text(store_quests)
    else: store_dict['store_quests'] = ''

    if store_customers :
        store_dict['store_customers'] = list_of_dict_from_text(store_customers)
    else: store_dict['store_customers'] = ''

    if store_rumors :
        store_dict['store_rumors'] = list_from_text(store_rumors)

    if store_services :
        store_dict['store_services'] = list_of_dict_from_text(store_services)
    else: store_dict['store_services'] = ''

    if store_specialties :
        store_dict['store_specialties'] = list_of_dict_from_text(store_specialties)
    else: store_dict['store_specialties'] = ''

    if store_security :
        store_dict['store_security'] = list_of_dict_from_text(store_security)
    else: store_dict['store_security'] = ''

    return store_dict

def format_inventory(inventory):
    formatted_text = ""
    print(f"Formatting Inventory ,{type(inventory)} ")
    # Iteration through item split_text keys in the inventory dictionary
    for item_split_text, item_list in inventory.items():
        
        formatted_text += f"{item_split_text} \n\n  "
        # Iterate through List of Dictionaries of item qualities
        for item in item_list:
            # print(item)
            # print(type(item))
            if type(item) == dict:
                 for key, value in item.items():
                    if type(value) == list:
                        formatted_text += f"{key} :"
                        for i in value :
                            formatted_text += f" '{i}', "
                        formatted_text = formatted_text.rstrip(", ")
                        formatted_text += "\n"
                        
                    else:
                        formatted_text += f"{key} : {value},\n"
            formatted_text += "\n"  
                
    return formatted_text

# Take in the text from the inventory textbox, and reformat into a dictionary object
def parse_text_to_inventory_dict(data):
    inventory_categories = [
    "core_inventory",
    "weapons",
    "armor",
    "potions",
    "scrolls",
    "magical_items",
    "mundane_items",
    "miscellaneous_items"
    ]
        
    lines = data.strip().split("\n")
    inventory = {}
    current_category = None
    current_item = {}

    for line in lines:
        line = line.strip()
        # print(f"line = {line}")
        if not line:
            continue
        
        if line in inventory_categories:
            # print(f"Current Category : {line}")
            current_category = f"{line}"
            inventory[f"{current_category}"] = []

        elif "name :" in line:
            if current_item: 
                inventory[f"{current_category}"].append(current_item)
            current_item = {"name": line.split(":")[1].strip(", ")}
            # print(current_item)
        
        elif ":" in line:
            key, value = line.split(":")
            key = key.strip()
            value = value.strip(", ")
            if key == "properties":
                value = [v.strip().strip("'") for v in value.split(",")]
            current_item[key] = value

        # print(f"Inventory Dictionary = {inventory}")
    
    if current_item:
        inventory[current_category].append(current_item)
    
    return inventory

            
     
    
    


