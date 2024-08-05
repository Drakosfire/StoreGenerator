import re, fileinput, sys
import utilities as u
import os
import ast

block_id = 0

def build_blocks(user_input, block_id):
    list_of_blocks = []
    title_block = build_title_block(user_input['store_name'], user_input['store_description'], user_input['store_backstory'], user_input['store_reputation'])
    block_id = block_id + 1
    list_of_blocks.append(title_block)
    store_image_block = build_image_block(user_input['storefront_sd_prompt'], block_id)
    block_id = block_id + 1
    list_of_blocks.append(store_image_block)
    store_properties_block = build_store_properties_block(store_type= user_input['store_type'],
                                                          store_size= user_input['store_size'],
                                                          store_hours= user_input['store_hours'],
                                                          store_location= user_input['store_location'],
                                                          store_owners= user_input['store_owners'],
                                                          store_employees= user_input['store_employees'],
                                                          store_services= user_input['store_services'],
                                                          store_specialties= user_input['store_specialties'],
                                                          store_reputation= user_input['store_reputation'],
                                                          store_rumors= user_input['store_rumors'],
                                                          block_id= block_id)
    block_id = block_id + 1
    list_of_blocks.append(store_properties_block)
    # Iterate over owners and generate owner image and details block
    for owner in user_input['store_owners']:
        owner_block = build_owner_block(owner, block_id)
        block_id = block_id + 1
        list_of_blocks.append(owner_block)
    
    
    

    return list_of_blocks
def process_iterable_into_html(iterable_type, iterable, block_id):
    iterable_html = f""""""
    for item in iterable:
        item_html = f"""<tr>
                <td align="left"><strong>{iterable_type}</strong></td>
                <td align="right"><textarea class="string-action-description-textarea" id="user-store-owners-{block_id}"
                hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-owners-{block_id}t" hx-swap="outerHTML"
                title="Store Size">{item['name']}</textarea></td>
            </tr>"""
        iterable_html += item_html
    return iterable_html

def build_title_block(title,description,backstory,reputation):
     title_block_html = f"""<div class="block-item" data-block-id = {block_id}><h1><textarea class="title-textarea" id="user-store-title" hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-name" hx-swap="outerHTML" title="Name of store">{title}</textarea></h1><div contenteditable="true" class="description-textarea" id="user-store-description"
         hx-post="/update-stats" hx-trigger="change"
         hx-target="#user-monster-description" hx-swap="outerHTML"
         title="Any amount or style of description">
        <p>{f"{description} {backstory} {reputation}"}</p>
    </div> """
     
     return title_block_html

def build_image_block(sd_prompt, block_id):
    image_block_html = f"""
    <div class="block-item" data-block-id="{block_id}">
        <textarea class="string-action-description-textarea" id="user-storefront-prompt-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-sd-prompt" hx-swap="outerHTML"
                  title="Storefront image description">{sd_prompt}</textarea>
        <button class="generate-image-button" data-block-id="{block_id}">Generate Image</button>
        <img id="generated-image-{block_id}" alt="" style="display: none; cursor: pointer;">
    </div>
    """

    return image_block_html
# Break each part of properties into segments, add to list, loop over possible multiple owners, servies, specialties, employees, and rumors
def build_store_properties_block(store_type,
                                 store_size,
                                 store_hours,
                                 store_location,
                                 store_owners,
                                 store_employees,
                                 store_services,
                                 store_specialties,
                                 store_reputation,
                                 store_rumors,
                                 block_id):
    
    store_properties_base_html = f"""
    <div class="block-item" data-block-id="{block_id}">
    <div class="block classTable frame decoration">
        <table>
            <thead>
                <tr>
                    <th align="left"></th>
                    <th align="center"></th>
                    <th align="center"></th>
                </tr>
            </thead>
            <tbody>
                <tr> 
                    <td align="left"><strong>Size</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-size-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-size-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{store_size}</textarea></td>
                </tr>
                <tr>
                    <td align="left"><strong>Town</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-town-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-town-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{store_location['town']}</textarea></td>
                </tr>
                <tr>
                    <td align="left"><strong>District</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-district-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-district-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{store_location['district']}</textarea></</td>
                </tr>
                <tr>
                    <td align="left"><strong>Street</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-street-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-street-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{store_location['street']}</textarea></</td>
                </tr>
                <tr>
                    <td align="left"><strong>Type</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-type-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-type-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{store_type}</textarea></</td>
                </tr>
                <tr>
                 <tr>
                    <td align="left"><strong>Store Hours</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-hours-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-hours-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{store_hours}</textarea></td>
                </tr> """
    store_owners = []
    store_employees = []

 
    def process_rumors_into_html(rumors, block_id):
        rumors_html = f""""""
        for rumor in rumors:
            rumor_html = f"""<tr>
                    <td align="left"><strong>Store Rumors</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-rumors-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-rumors-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{rumor}</textarea></td>
                </tr>"""
            rumors_html += rumor_html
        return rumors_html
    
    owners_html = process_iterable_into_html('Store Owners', store_owners, block_id)
    employees_html = process_iterable_into_html('Store Employees', store_employees, block_id)
    store_specialties_html = process_iterable_into_html('Store Specialties', store_specialties, block_id)
    store_services_html = process_iterable_into_html('Store Services', store_services, block_id)
    def process_secrets_into_html(secrets, block_id):
        secrets_html = f""""""
        for secret in secrets:
            secret_html = f"""<tr>
                    <td align="left"><strong>Secrets</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-rumors-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-rumors-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{secret}</textarea></td>
                </tr>"""
            secrets_html += secret_html
        return secrets_html
         
    store_iterables_html = f"""
                {owners_html}
                {employees_html}
                {store_services_html}
                {store_specialties_html}
                {store_rumors_html}
                """
    store_end_html = f"""
                <tr>
                    <td align="left"><strong>Store Reputation</strong></td>
                    <td align="right"><textarea class="string-action-description-textarea" id="user-store-reputation-{block_id}"
                  hx-post="/update-stats" hx-trigger="change" hx-target="#user-store-reputation-{block_id}t" hx-swap="outerHTML"
                  title="Store Size">{store_reputation}</textarea></td>
                </tr>
            </tbody>
        </table>
    </div>
    </div>
    """
    store_properties_block_html = f"""{store_properties_base_html}
                {store_iterables_html}
                {store_end_html}"""
    return store_properties_block_html

def build_owner_block(owner, owner_id,block_id):
     # Owner block with values : Name, Race, Class, Description, Personality, Secrets, sd-prompt
    owner_name_html = process_iterable_into_html('Owner', [owner['name']], block_id)
    owner_race_html = process_iterable_into_html('Race', [owner['race']], block_id)
    owner_class_html = process_iterable_into_html('Class', [owner['class']], block_id)
    owner_description_html = process_iterable_into_html('Description', [owner['description']], block_id)
    owner_personality_html = process_iterable_into_html('Personality', [owner['personality']], block_id)
    owner_secrets_html = process_iterable_into_html('Secrets', [owner['secrets']], block_id)
    owner_block_html = f"""
    <div class="block-item" data-block-id="{block_id}">
                            <h3 id="owner_{owner_id}">F{owner['name']}</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th align="center"></th>
                                        <th align="center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td align="center"><strong>Species</strong></td>
                                        <td align="right">{owner['species']}</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Class</strong></td>
                                        <td align="right">{owner['class']}</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Description</strong></td>
                                        <td align="left">{}</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Personality</strong></td>
                                        <td align="left">Joyful, playful, and a tad mischievous.</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Secrets</strong></td>
                                        <td align="left">Fizzwidget once performed a jester act for the Queen of Faerun.<br> He has a hidden collection of practical jokes for special customers.</td>
                                    </tr>
                                </tbody>
                            </table>
                            </div>
    """
def list_names_to_str(data):  
        list_of_names = []
        for i in data:
            list_of_names.append(i['name'])
        str_of_names = ', '.join(list_of_names)
        return str_of_names

def list_to_str(list):  
        str_of_list = ', '.join(list)
        return str_of_list
def build_owners_section(owners_list):
    owner_s = 'Owner'
    if len(owners_list) > 1 :
        owner_s = 'Owners'
    owner_section_html = f"""<h2 id="owner">{owner_s}</h2> """
    # iterating through list of owners, each is a dictionary with descriptive qualities
    for owner in range(len(owners_list)) :
        secrets = '<br> '.join(owners_list[owner - 1]['secrets'])
        owner_section_html += f"""
                            <h3 id="owner_{owner}">{owners_list[owner - 1]['name']}</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th align="center"></th>
                                        <th align="center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td align="center"><strong>Species</strong></td>
                                        <td align="right">{owners_list[owner - 1]['species']}</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Class</strong></td>
                                        <td align="right">{owners_list[owner - 1]['class']}</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Description</strong></td>
                                        <td align="left">{owners_list[owner - 1]['description']}.</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Personality</strong></td>
                                        <td align="left">{owners_list[owner - 1]['personality']}</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Secrets</strong></td>
                                        <td align="left">{secrets}</td>
                                    </tr>
                                </tbody>
                            </table>
                            """
    return owner_section_html



store_image_url = ""

    
# Assigning strings to variables for replacing location of dependencies for the webpage to local static folders
# Path is ../../ for the html files location in output/dated_folder/

def build_html_base(store_dict) : 

    base_dir = os.path.dirname(os.path.abspath(__file__))
    dependencies_path = os.path.relpath(os.path.join(base_dir, "dependencies"), os.path.join(base_dir, "output", "test"))
   
        
    # Template for the page
    html_file_as_text = f"""<!DOCTYPE html>
<html>
    <head>
        <link href="{dependencies_path}/all.css" rel="stylesheet" />
        <link href="{dependencies_path}/css.css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
        <link href="{dependencies_path}/bundle.css" rel="stylesheet" />
        <link rel="icon" href="{dependencies_path}/favicon.ico" type="image/x-icon" />
        <link href="{dependencies_path}/style.css" rel="stylesheet" />
        <link href="{dependencies_path}/5ePHBstyle.css" rel="stylesheet" />
        <title>{store_dict['store_name']}</title>
    </head>
<body>
    <div>
        <div class="brewRenderer" style="height: 692px;">  
            <div class="pages" lang="en">
                    <div class="page" id="p1">
                        <div class="columnWrapper">
                            <h1 id="store_name">{store_dict['store_name']}</h1>
                            <p>{store_dict['store_description']}</p>
                            <p>{store_dict['store_backstory']}</p>
                            <p>{store_dict['store_reputation']}</p>
                            <!-- Generated Image of Shop -->
                            <p><img class="" style="width:300px; mix-blend-mode:multiply;" src="{store_image_url}" alt="{store_dict['store_name']}"></p>
                              <div class="block classTable frame decoration">
                                <table>
                                    <thead>
                                        <tr>
                                            <th align="left"></th>
                                            <th align="center"></th>
                                            <th align="center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td align="left"><strong>Size</strong></td>
                                            <td align="right">{store_dict['store_size']}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Town</strong></td>
                                            <td align="right">{store_dict['store_location']['town']}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>District</strong></td>
                                            <td align="right">{store_dict['store_location']['district']}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Street</strong></td>
                                            <td align="right">{store_dict['store_location']['street']}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Type</strong></td>
                                            <td align="right">{store_dict['store_type']}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Owners</strong></td>
                                            <td align="right">{list_names_to_str(store_dict['store_owners'])}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Employees</strong></td>
                                            <td align="right">{list_names_to_str(store_dict['store_employees'])}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Store Hours</strong></td>
                                            <td align="right">{store_dict['store_hours']}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Services</strong></td>
                                            <td align="right">{list_names_to_str(store_dict['store_services'])}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Specialties</strong></td>
                                            <td align="right">{list_names_to_str(store_dict['store_specialties'])}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Reputation</strong></td>
                                            <td align="right">{store_dict['store_reputation']}</td>
                                        </tr>
                                        <tr>
                                            <td align="left"><strong>Rumors</strong></td>
                                            <td align="right">{list_to_str(store_dict['store_rumors'])}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p><img class="" style="width:300px; mix-blend-mode:multiply;" src="https://media.githubusercontent.com/media/Drakosfire/StoreGenerator/master/galleries/test_images/Morgor_bloodclaw.png" alt="{store_dict['store_owners'][0]['name']}"></p>
                            {build_owners_section(store_dict['store_owners'])}
                            
                            
                            <p>&nbsp;</p>
                            <div class="columnSplit"></div>
                            <p>&nbsp;</p>
                        </div>
                    </div>
                    <div class="page" id="p2">
                        <div class="columnWrapper">
                            <div class="blank"></div>
                            <h2 id="employees">Employees</h2>
                            
                            <h3 id="brega">Brega</h3>
                            <p><img class="" style="width:150px; mix-blend-mode:multiply;" src="https://media.githubusercontent.com/media/Drakosfire/StoreGenerator/master/galleries/test_images/Brega.png" alt="Brega"></p>

                            <table>
                                <thead>
                                    <tr>
                                        <th align="center"></th>
                                        <th align="center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td align="center"><strong>Species</strong></td>
                                        <td align="center">Half-Orc</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Class</strong></td>
                                        <td align="center">Assistant Butcher</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Description</strong></td>
                                        <td align="center">A burly half-orc with a kind face and a perpetual smudge of blood on his cheek. Brega handles the heavy lifting and cutting of larger beasts.</td>
                                    </tr>
                                    <tr>
                                        <td align="center"><strong>Personality</strong></td>
                                        <td align="center">Soft-spoken and gentle despite his imposing appearance, Brega is loyal to Morgor and respects his cunning. He has a soft spot for stray animals.</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div class="block">
                                <h1 id="notable-customers">Notable Customers</h1>
                                <div class="block note">
                                    <h3 id="lord-vittorio-blackthorn">Lord Vittorio Blackthorn</h3>
                                    <p>An eccentric noble known for his extravagant feasts featuring rare and exotic meats.</p>
                                    <p>Lord Blackthorn’s patronage lends an air of mystery and prestige to Morgor’s shop, attracting curious gourmands and shady characters alike.</p>
                                </div>
                                <h1 id="related-quests">Related Quests</h1>
                                <h3 id="the-basilisk-bounty">The Basilisk Bounty</h3>
                                <p>Morgor needs fresh basilisk meat and offers a handsome reward for those brave enough to hunt one.</p>
                                <p>500 gold coins and choice cuts of meat.</p>
                            </div>
                        
                        
                        <div class="columnSplit"></div>
                            <div class="block">
                                <h1 id="services-and-specialties">Services and Specialties</h1>
                                <div class="blank"></div>
                                <h2 id="services">Services</h2>
                                <h3 id="custom-slaughtering">Custom Slaughtering</h3>
                                <p>Bring your own beasts, and Morgor will prepare the meat to your specifications.
                                50 gold coins per beast.</p>
                                <div class="blank"></div>
                                <h2 id="specialties">Specialties</h2>
                                <div class="blank"></div>
                                <h3 id="basilisk-cutlets">Basilisk Cutlets</h3>
                                <p>Tender and marbled with a unique flavor, perfect for those seeking a truly rare dining experience.</p>
                                <h3 id="subterranean-lizard-tail">Subterranean Lizard Tail</h3>
                                <p>A delicacy prized for its unique texture and earthy taste, enchanted to enhance its natural flavor.</p>
                                <h1 id="security">Security</h1>
                                <div class="blank"></div>
                                <h3 id="bewitched-meat-hooks">Bewitched Meat Hooks</h3>
                                <p>These enchanted meat hooks animate and attack intruders who try to take meat without paying. 200 gold coins per pound.</p>
                                <div class="blank"></div>
                                <p>Attack: +5 to hit, 1d8+3 piercing damage.</p>
                                <h3 id="shadow-ward">Shadow Ward</h3>
                                <p>A magical barrier that alerts Morgor if someone enters the shop after hours. 150 gold coins per pound.</p>
                                <div class="blank"></div>
                                <p>Detection radius of 60 feet, triggers an audible alarm.</p>
                            </div> <!-- Close Block -->
                        </div> <!-- close columnWrapper-->
                    </div> <!-- close page 2 -->       
                        
                    <div class="page" id="p3">
                        <div class="columnWrapper">        
                          
                            <div class="block classTable frame decoration">
                                <h5 id="inventory">Inventory</h5>
                                <table>
                                    <thead>
                                        <tr>
                                            <th align="center">Name</th>
                                            <th align="center">Type</th>
                                            <th align="left">Cost</th>
                                            <th align="center">Properties</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td align="center">Poultry Drumsticks</td>
                                            <td align="center">Meat</td>
                                            <td align="left">1 gp per lbs</td>
                                            <td align="center"></td>
                                        </tr>
                                        <tr>
                                            <td align="center">Ground Beef</td>
                                            <td align="center">Meat</td>
                                            <td align="left">1 gp per lbs</td>
                                            <td align="center"></td>
                                        </tr>
                                        <tr>
                                            <td align="center">Pork Chops</td>
                                            <td align="center">Meat</td>
                                            <td align="left">1 gp per lbs</td>
                                            <td align="center"></td>
                                        </tr>
                                        <tr>
                                            <td align="center">Bacon Strips</td>
                                            <td align="center">Meat</td>
                                            <td align="left">1 gp per lbs</td>
                                            <td align="center"></td>
                                        </tr>
                                        <tr>
                                            <td align="center">Sausage Links</td>
                                            <td align="center">Meat</td>
                                            <td align="left">1 gp per lbs</td>
                                            <td align="center"></td>
                                        </tr>
                                        <tr>
                                            <td align="center">Mystic Minotaur Steak</td>
                                            <td align="center">Exotic Meat</td>
                                            <td align="left">25 gold per pound</td>
                                            <td align="center">Grants temporary strength boost when consumed, Requires fine culinary skills to cook properly</td>
                                        </tr>
                                        <tr>
                                            <td align="center">Quantum Quail</td>
                                            <td align="center">Exotic Poultry</td>
                                            <td align="left">15 gold each</td>
                                            <td align="center">“Phases in and out of existence”, “Can enhance one’s agility”</td>
                                        </tr>
                                        <tr>
                                            <td align="center">Invisible Bacon</td>
                                            <td align="center">Mystical Meat</td>
                                            <td align="left">10 gold per slice</td>
                                            <td align="center">“Invisible to the naked eye”, “Tastes incredibly savory”, “Can only be seen with a special spell”</td>
                                        </tr>
                                        <tr>
                                            <td align="center">Hydra Sausage</td>
                                            <td align="center">Mythical Meat</td>
                                            <td align="left">50 gold per link</td>
                                            <td align="center">“Each bite regenerates after a while”, “Consuming too much may cause mild hallucinations”</td>
                                        </tr>
                                        <tr>
                                            <td align="center">Cursed Cleaver</td>
                                            <td align="center">Kitchen Equipment</td>
                                            <td align="left">100 gold</td>
                                            <td align="center">“Cuts through any meat effortlessly”, “Occasionally whispers in a long-forgotten language”, “Rumored to be haunted”</td>
                                        </tr>
                                        <tr>
                                            <td align="center">Vampire Spice Mix</td>
                                            <td align="center">Cooking Ingredient</td>
                                            <td align="left">20 gold per pouch</td>
                                            <td align="center">“Adds a distinct flavor”, “Enhances blood flow in the consumer”, “Leaves a lingering aftertaste of garlic”</td>
                                        </tr>
                                        <tr>
                                            <td align="center">Phoenix Feather Skewers</td>
                                            <td align="center">Cooking Utensil</td>
                                            <td align="left">75 gold per set</td>
                                            <td align="center">“Prevents meat from overcooking”, “Gives a slight warmth to cooked items”, “Reusable endlessly”</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p>&nbsp;</p>
                        </div><!-- Close Column Wrapper-->
                    </div> <!-- Close Page 3-->
                </div> <!-- Close pages-->
            </div> <!--Close brew renderer-->
        </div><!-- Close Div housing body-->
    </body>
</html>"""
     # Open a file path that will receive the processed text 
    store_file_path = f"output/test/{store_dict['store_name'].replace(' ', '_')}.html"
    with open(store_file_path, 'w') as clean_html:
        clean_html.write(html_file_as_text)
    clean_html.close()
   
    return store_file_path

dict_template = {
  "store_name": "The Mirage Emporium",
  "store_description": "A peculiar shop filled with the odd and the useless, where each corner hides a laugh and a mystery.",
  "store_reputation": "Locally famous for its bizarre and delightful inventory, though not particularly useful.",
  "store_backstory": "The Mirage Emporium was founded by a retired jester known for his love of the whimsical and the curious. He traveled the world collecting oddball items that struck his fancy, and upon amassing a considerable collection, opened a shop to share his treasures with the world.",
  "store_sd_prompt": "A highly detailed fantasy illustration of a middle-aged full body male gnome in an eclectic shop. The gnome is wearing a colorful patchwork vest and a jaunty hat. The shop is filled with quirky items like broken clocks, mismatched shoes, and joke books. The gnome has distinct fantasy features, such as pointed ears and a small, sturdy build. The background is a vibrant mix of colors and textures, giving the impression of organized chaos.",
  "store_type": "Curiosity Shop",
  "store_size": "Small",
  "store_hours": "From dawn until the moonlight dances.",
  "store_location": {
    "town": "Bramblebrook",
    "district": "Harlequin Quarter",
    "street": "Twilight Alley"
  },
  "store_owners": [
    {
      "name": "Fizzwidget Funsquirrel",
      "species": "Gnome",
      "class": "Bard",
      "description": "A lively gnome with a perpetual twinkle in his eye and a knack for making people smile.",
      "personality": "Joyful, playful, and a tad mischievous.",
      "secrets": ["Fizzwidget once performed a jester act for the Queen of Faerun.", "He has a hidden collection of practical jokes for special customers."],
      "sd_prompt": "A highly detailed fantasy illustration of a cheerful full body male gnome in an eclectic shop. The gnome is wearing a colorful patchwork vest and a jaunty hat, with a playful expression and sparkling eyes. The shop is filled with quirky items and the background is a chaotic mix of vibrant colors and textures."
    }
  ],
  "store_employees": [
    {
      "name": "Marigold Merryleaf",
      "role": "Shop Assistant",
      "species": "Halfling",
      "description": "A spry halfling with a knack for finding peculiar trinkets buried under heaps of clutter.",
      "personality": "Curious, quirky, and always up for a laugh.",
      "sd_prompt": "A highly detailed fantasy illustration of a spry full body female halfling in an eclectic shop. The halfling is wearing a colorful apron and has a curious expression. The shop is filled with quirky items, and the background is a chaotic mix of vibrant colors and textures."
    }
  ],
  "store_quests": [
    {
      "name": "The Great Sock Hunt",
      "description": "Help Fizzwidget locate a rare pair of mismatched socks rumored to bring joy and luck, hidden somewhere in the town of Bramblebrook.",
      "reward": "A pair of enchanted socks that make the wearer extraordinarily lucky in games of chance."
    }
  ],
  "store_customers": [
    {
      "name": "Lord Twiddleton",
      "description": "An eccentric noble who collects oddities and revels in the unusual.",
      "influence": "High, due to his noble status and wealth."
    }
  ],
  "store_rumors": [
    "It's said that Fizzwidget once outwitted a dragon using only a rubber chicken and a whoopee cushion.",
    "Marigold can find lost items using her 'half-sense' for where things hide."
  ],
  "store_security": [
    {
      "name": "Gizmo Gearshaft",
      "description": "An ingenious contraption that includes clockwork gears, springs, and enchanted runes.",
      "mechanics": "Gizmo Gearshaft patrols the shop, alert for intruders and mischief-makers, and can deploy harmless yet startling pranks to deter trouble."
    }
  ],
  "store_services": [
    {
      "name": "Laughter Therapy",
      "description": "A session with Fizzwidget who tells jokes and performs tricks to brighten your day.",
      "price": "1 gold coin per session"
    }
  ],
  "store_specialties": [
    {
      "name": "Mystery Mounds",
      "description": "A pile of assorted oddities bundled together; you never know what you'll get, but it'll always be a conversation starter!",
      "price": "5 silver per bundle"
    }
  ]
}
