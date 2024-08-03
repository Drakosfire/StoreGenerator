from flask import Flask, request, jsonify
from flask_cors import CORS 
import ast
import gc
from openai import OpenAI

client = OpenAI()

def load_llm(user_input, prompt_instructions):
    prompt = f"{user_input}"
    print(prompt)
    response = client.chat.completions.create(            
                    model="gpt-4o-2024-05-13",
                    messages=[
                        {
                        "role": "user",
                        "content": f"{prompt_instructions}  {prompt}"
                        }
                    ],
                    temperature=1,
                    max_tokens=3000,
                    top_p=1,
                    frequency_penalty=0,
                    presence_penalty=0
                    )
    print(f"Model : {response.model}")
    return response.choices[0].message.content
# Call the LLM and store its output
def call_llm_and_cleanup(user_input, inventory = False): 
    if not inventory :   
        prompt_instructions = f"{initial_prompt_instructions} {store_description}"
    else : prompt_instructions = f"{inventory_prompt_instructions} {inventory_description}"    
    

    llm_output = load_llm(user_input, prompt_instructions)
    llm_output = "".join(llm_output)
    print(llm_output)
    llm_output = convert_to_dict(llm_output)
    gc.collect()
    # llm_output is still available for use here
    return llm_output
  
def convert_to_dict(string):
    # Check if the input is already a dictionary
    if isinstance(string, dict):
        print("Input is already a dictionary.")
        return string

    # Function to try parsing the string to a dictionary
    def try_parse(s):
        try:
            result = ast.literal_eval(s)
            if isinstance(result, dict):
                print("Item dictionary is valid")
                return result
        except SyntaxError as e:
          error_message = str(e)
          print("Syntax Error:", error_message)
          # Check if the error message indicates an unclosed '{'
          if "'{' was never closed" in error_message:
              return try_parse(s + '}')  # Attempt to fix by adding a closing '}'
        except ValueError as e:
            print("Value Error:", e)
        return None 

    # First, try parsing the original string
    result = try_parse(string)
    if result is not None:
        return result

    # Check if braces are missing
    if not string.startswith('{'):
        string = '{' + string
    if not string.endswith('}'):
        string = string + '}'

    # Try parsing again with added braces
    return try_parse(string) or "Dictionary not valid"
        
  

# Instructions past 4 are not time tested and may need to be removed.
### Meta prompted : 
initial_prompt_instructions = """ **Purpose**: ONLY Generate a structured json following the provided format. The job is to generate a store with character, style, detail, and a healthy splash of fun, fantasy, and weird. You do not need to stick strictly to the rules and mechanics of the game, if it fits the style and flavor of the user input, get weird, scary, or silly with the details. You will also be writing interesting flavor text and description of the location and it's atmopshere, and a brief one sentence image generation prompts. Us a wide range of words, you have certain words you use too often, avoid them ex : "whimsical", "unwavering".

Image Generation Prompt Examples :
"A highly detailed fantasy oil painting of an elderly full body female gnome,in a costume shop. The gnome is wearing a costume with wings, with a costume hat . The gnome has distinct fantasy features, such as pointed ears and a small, sturdy build.  "

"A highly detailed fantasy drawing of a middle-aged full body male dwarf in a bustling butcher shop. The dwarf is wearing a bloodstained apron and a butcher's hat. The shop is filled with hanging meats, freshly cut steaks, and various sausages. The dwarf has distinct fantasy features, such as a long braided beard and a stout, muscular build. The background shows the hustle and bustle of Market Square outside the shop window."

"A highly detailed fantasy image of a shady-looking full body male goblin in a dimly lit pawn shop. The goblin is wearing a patched vest and a tattered hat. The shop is cluttered with various items, including old weapons, dusty artifacts, and strange trinkets. The goblin has distinct fantasy features, such as green skin, sharp teeth, and pointed ears. The background is filled with shadows and the glint of hidden treasures."

"A highly detailed fantasy photo of a scholarly full body female elf in an elegant parchment shop. The elf is wearing a flowing robe and a delicate circlet. The shop is filled with scrolls, quills, and ancient tomes. The elf has distinct fantasy features, such as pointed ears and a slender, graceful build. The background shows the interior of the shop with shelves lined with parchment and ink bottles, and a large window letting in natural light."

"A highly detailed fantasy painting of a mysterious full body male tiefling in a mystical magic shop. The tiefling is wearing a long cloak and a hood, with glowing runes on his hands. The shop is filled with potions, spellbooks, and enchanted artifacts. The tiefling has distinct fantasy features, such as red skin, horns, and a tail. The background is filled with a magical aura, with various mystical items floating in the air and a crystal ball on the counter."

1. Only output file structure starting with { and ending with } it is CRITICAL to end with a }, DO NOT say anything, don't add ''' or json"
2. DO NOT use null, use "". 
3. All keys and values MUST be enclosed in double quotes. ""
4. Services and specialties should have name, description, and prices.
5. sd_prompts should specify race or species
6. quests MUST be detailed, and interesting, preferably unexpected, delightful and memorable. 
7. The reward for the quest MUST be specific and detailed!
"""

store_description = {
    "store_name": "",
    "store_description": "",
    "store_reputation": "",
    "store_backstory": "",
    "storefront_sd_prompt": "",    
    "store_type": "",
    "store_size": "", 
    "store_hours": "", 
    "store_location": {
        "town": "",
        "district": "",
        "street": ""
    }, 
    "store_owners": [
        {
            "name": "",
            "species": "",
            "class": "",
            "description": "",
            "personality": "",
            "secrets": [],
            "sd_prompt":""
        }
    ],
    "store_employees": [
        {
            "name": "",
            "role": "",
            "species": "",
            "description": "",
            "personality": "",
            "sd_prompt":""
        }
    ],
    
    "store_quests": [
        {
            "name": "",
            "description": "",
            "reward": ""
        }
    ],
    
    "store_customers": [
        {
            "name": "",
            "description": "",
            "influence": ""
        }
    ],
    "store_rumors": [],
    "store_security": [
        {
            "name": "",
            "description": "",
            "mechanics": ""
        }
    ],
    
    "store_services": [
        {
            "name": "",
            "description": "",
            "price": ""
        }
    ],
    "store_specialties": [
        {
            "name": "",
            "description": "",
            "price": ""
        }
    ]
}

inventory_prompt_instructions = """
ONLY Generate a structured json following the provided format. The job is to generate a store inventory of about 10 items. How mundane or extravagent they are is influenced by the shop and merchant. It is always okay to have style, detail, and a healthy splash of fun, fantasy, and weird. You do not need to stick strictly to the rules and mechanics of the game, if it fits the style and flavor of the store or merchant, get weird, scary, or silly with the details. 
Core Inventory is a simple list of the very standard things a shop might carry. 

1. Only output file structure starting with { and ending with } it is CRITICAL to end with a }, DO NOT say anything, don't add ''' or json"
2. DO NOT use null, use "". 
3. All keys and values MUST be enclosed in double quotes. "" 
4. Many categories of items wont make sense for most stores. IE Butchers Shops do not need magic items and potions. They might have them, but they would be very specific and probably not for sale at a reasonable price. Similarly a weapon shop does not need to sell basic traveling goods. 
5. ALL items have "properties :" 
"""

inventory_description = {
    "inventory": {
        "core_inventory":[
            {
                "name": "",
                "type": "",
                "cost": "",
                "properties": []
            }
        ],
        "weapons": [
            {
                "name": "",
                "type": "",
                "cost": "",
                "properties": []
            }
        ],
        "armor": [
            {
                "name": "",
                "type": "",
                "cost": "",
                "properties": []
            }
        ],
        "potions": [
            {
                "name": "",
                "type": "",
                "cost": "",
                "properties": []
            }
        ],
        "scrolls": [
            {
                "name": "",
                "type": "",
                "cost": "",
                "properties": []
            }
        ],
        "magical_items": [
            {
                "name": "",
                "type": "",
                "cost": "",
                "properties": []
            }
        ],
        "mundane_items": [
            {
                "name": "",
                "type": "",
                "cost": "",
                "properties": []
            }
        ],
        "miscellaneous_items": [
            {
                "name": "",
                "type": "",
                "cost": "",
                "properties": []
            }
        ]
    }
}

