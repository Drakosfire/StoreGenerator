
#Function to process text from Key Value pairs into User Friendly text

def format_qualities(qualities):
    print(f"Formatting Start,{type(qualities)} ")
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
                            formatted_text += i
                        formatted_text = formatted_text.rstrip(",")
                        formatted_text += "\n"
                        
                    else : 
                        formatted_text += f"{key} : {value}\n"
                formatted_text = formatted_text.rstrip(",")
                formatted_text += "\n"

            if type(item) == list:
                # print("List item List") 
                for i in item:
                    formatted_text += i
            if type(item) == str:
                # print("List item Str") 
                formatted_text += f"{item}\n"
                
        formatted_text = formatted_text.rstrip(",")
        formatted_text += "\n"
        return formatted_text
    
    elif type(qualities) == dict: 
        for key, value in qualities.items():
            formatted_text += f"{key} : {value}\n"
            formatted_text = formatted_text.rstrip(",")
    return formatted_text

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

def parse_text_to_inventory(data):
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
        print(f"line = {line}")
        if not line:
            continue
        
        if line in inventory_categories:
            print(f"Current Category : {line}")
            current_category = f"{line}"
            inventory[f"{current_category}"] = []

        elif "name :" in line:
            if current_item: 
                inventory[f"{current_category}"].append(current_item)
            current_item = {"name": line.split(":")[1].strip(", ")}
            print(current_item)
        
        elif ":" in line:
            key, value = line.split(":")
            key = key.strip()
            value = value.strip(", ")
            if key == "properties":
                value = [v.strip().strip("'") for v in value.split(",")]
            current_item[key] = value

        print(f"Inventory Dictionary = {inventory}")
    
    if current_item:
        inventory[current_category].append(current_item)
    
    return inventory

            
     
    
    


