import re
import json

mapping = {
    "p-11": "/images/menu/p-11-tandoori-pineapple.png",
    "p-31": "/images/menu/p-31-afghani-kali-mirch-chaap.jpg",
    "p-43": "/images/menu/p-43-matar-paneer.png",
    "p-47": "/images/menu/p-47-paneer-butter-masala.jpeg",
    "p-48": "/images/menu/p-48-paneer-do-pyaja.jpeg",
    "p-49": "/images/menu/p-49-veg-biryani-handi.jpeg",
    "p-56": "/images/menu/p-56-butter-nan.png",
    "p-57": "/images/menu/p-57-garlic-nan.png",
    "p-58": "/images/menu/p-58-dahi.jpeg",
    "p-59": "/images/menu/p-59-namkin-lassi.jpeg",
    "p-60": "/images/menu/p-60-mithi-lassi.jpeg",
    "p-61": "/images/menu/p-61-raita.jpeg",
    "p-62": "/images/menu/p-62-aapno-special-raita.jpeg",
    "p-72": "/images/menu/p-72-tandoori-leg-chest.png",
    "p-80": "/images/menu/p-80-kadhai-chicken.jpeg",
    "p-90": "/images/menu/p-90-coke-250-ml.jpeg",
    "p-91": "/images/menu/p-91-coke-500-ml.jpg",
    "p-92": "/images/menu/p-92-coke-750-ml.jpg",
    "p-94": "/images/menu/p-94-coke-2-litres.jpeg",
    "p-95": "/images/menu/p-95-sprite-250-ml.webp",
    "p-97": "/images/menu/p-97-sprite-750-ml.jpg",
    "p-98": "/images/menu/p-98-sprite-1-litre.jpg",
    "p-100": "/images/menu/p-100-limca-250-ml.png",
    "p-103": "/images/menu/p-103-limca-1-litre.jpeg",
    "p-104": "/images/menu/p-104-limca-2-litres.jpeg",
    "p-105": "/images/menu/p-105-coke-can.jpg",
    "p-106": "/images/menu/p-106-diet-coke-can.jpg",
    "p-107": "/images/menu/p-107-hell-can.webp",
    "p-108": "/images/menu/p-108-predator-can.jpg",
    "p-110": "/images/menu/p-110-vedica-water.webp",
    "p-111": "/images/menu/p-111-kinley-soda.jpeg",
    "p-112": "/images/menu/p-112-bisleri-soda.jpeg",
    "p-113": "/images/menu/p-113-ice-cubes.jpg",
}

with open("lib/menuData.ts", "r") as f:
    lines = f.readlines()

current_pid = None
updated_count = 0
new_lines = []

for line in lines:
    id_match = re.search(r'"id":\s*"(p-\d+)"', line)
    if id_match:
        current_pid = id_match.group(1)
    
    img_match = re.search(r'"imageUrl":\s*"([^"]+)"', line)
    if img_match and current_pid in mapping:
        new_url = mapping[current_pid]
        old_url = img_match.group(1)
        line = line.replace(old_url, new_url)
        print(f"Updated {current_pid}: {old_url} -> {new_url}")
        updated_count += 1
        current_pid = None
        
    new_lines.append(line)

with open("lib/menuData.ts", "w") as f:
    f.writelines(new_lines)

print(f"\nSuccessfully updated {updated_count} image URLs in lib/menuData.ts!")
