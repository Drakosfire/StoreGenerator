# Three structures to work with the LLMs strengths and weaknesses
# LLM instructions, only print populated categories. Which will require a crawl of the dictionary and some if then checks to prevent trying to retrieve keys that don't exist.
# Tabs for each subsection. Instructions, Store, Merchants, Services, Inventory 
# To save on tokens, we wont generate an SD prompt for each item, but send a request for a prompt using the item dictionary.
# Description of Store
{
  "store_name": "Ethereal Embrace",
  "store_description": "A luxury lingerie store filled with delicate silks, enchanting lace, and otherworldly designs. The air is scented with subtle perfumes and the lighting casts a warm, inviting glow.",
  "store_reputation": "Renowned for its exquisite craftsmanship and magical allure, a favorite among nobility and adventurers alike.",
  "store_backstory": "Ethereal Embrace was established centuries ago by a pioneering beholder named Zaltrix. His keen eye (or rather, eyes) for detail and fashion led him to create a haven where fantasy meets elegance.",
  "storefront_sd_prompt": "A highly detailed fantasy oil painting of a full body beholder in an opulent lingerie store. The beholder has multiple eyes each adorned with a delicate monocle, and the shop is filled with luxurious fabrics and ornate displays. The background shows an inviting, warm-lit ambiance with customers examining exquisite lingerie.",
  "store_type": "Lingerie",
  "store_size": "Medium",
  "store_hours": "10 AM to 8 PM",
  "store_location": {
    "town": "Glimmering Vale",
    "district": "Silk Quarter",
    "street": "Moonlit Avenue"
  },
  "store_owners": [{
    "name": "Zaltrix",
    "species": "Beholder",
    "class": "Artificer",
    "description": "A beholder with a penchant for fashion, each of his eyes is adorned with a tiny, fashionable monocle.",
    "personality": "Charming, meticulous, and slightly eccentric. He takes immense pride in his work.",
    "secrets": [],
    "sd_prompt": "A highly detailed fantasy painting of a full body beholder in an opulent lingerie store. The beholder has multiple eyes each adorned with a delicate monocle, and the shop is filled with luxurious fabrics and ornate displays. The background shows an inviting, warm-lit ambiance with customers examining exquisite lingerie."
  }],
  "store_employees": [{
    "name": "Fleur",
    "role": "Designer",
    "species": "Half-Elf",
    "description": "A graceful half-elf with an eye for innovative designs, often seen sketching new patterns.",
    "personality": "Creative, gentle, and always looking to experiment with new ideas.",
    "sd_prompt": "A highly detailed fantasy drawing of a graceful half-elf artist sketching lingerie designs in a luxurious shop."
  }],
  "store_quests": [{
    "name": "The Silk of the Moondrake",
    "description": "Zaltrix needs a rare type of silk known as Moondrake Silk, found only in the nests of Moondrakes. The task is to retrieve this treasured silk without harming the mystical creatures.",
    "reward": "An enchanted lingerie set that grants the wearer increased charm and charisma."
  }],
  "store_customers": [{
    "name": "Lady Seraphina",
    "description": "A well-known noblewoman who frequents Ethereal Embrace seeking the latest designs.",
    "influence": "High, she often recommends the store to other members of the nobility."
  }],
  "store_rumors": [],
  "store_security": [{
    "name": "Glimmer",
    "description": "An ever-vigilant magical orb that floats near the ceiling, observing every movement with silent efficiency.",
    "mechanics": "Detects any illicit activity and alerts Zaltrix while casting a minor hold spell on the culprit."
  }],
  "store_services": [{
    "name": "Custom Fittings",
    "description": "Personalized lingerie fittings to ensure each piece fits perfectly.",
    "price": "50 gold"
  }],
  "store_specialties": [{
    "name": "Enchanted Ensembles",
    "description": "Lingerie sets enchanted with minor charms and spells.",
    "price": "200 gold"
  }]
}