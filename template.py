# Three structures to work with the LLMs strengths and weaknesses
# LLM instructions, only print populated categories. Which will require a crawl of the dictionary and some if then checks to prevent trying to retrieve keys that don't exist.
# Tabs for each subsection. Instructions, Store, Merchants, Services, Inventory 
# To save on tokens, we wont generate an SD prompt for each item, but send a request for a prompt using the item dictionary.
# Description of Store
{
    "store_name": "",
    "location": {
        "town": "",
        "district": "",
        "street": ""
    },
    "type": "",
    "size": "",
    "description": "",
    "atmosphere": "",
    "sd_prompt": "",
    "owners": [
        {
            "name": "",
            "race": "",
            "class": "",
            "description": "",
            "personality": "",
            "secrets": []
        }
    ],
    "employees": [
        {
            "name": "",
            "role": "",
            "race": "",
            "description": "",
            "personality": ""
        }
    ],
    "reputation": "",
    "related_quests": [
        {
            "name": "",
            "description": "",
            "reward": ""
        }
    ],
    "background_story": "",
    "notable_customers": [],
    "rumors": [],
    "security_measures": [],
    "store_hours": ""
}

# Services and Specialties

{
    "services": [
        {
            "name": "",
            "description": "",
            "price": ""
        }
    ],
    "specialties": []
}

# Inventory

{
    "inventory": {
        "core_inventory":[],
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
