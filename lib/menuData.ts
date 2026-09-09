// Master 60+ Dish Menu Catalog for Aapno Khaano (आपणो खाणो)
// All food images sized at exact 1000x1000 pixel HD square format

export const MASTER_AAPNO_KHANO_CATEGORIES = [
  {
    id: 'cat-to-begin-with-green',
    name: 'To Begin With Green',
    slug: 'to-begin-with-green',
    description: 'Fresh crispy chats and tangy starters',
    icon: 'Salad',
    isVegCategory: true,
    displayOrder: 1,
    products: [
      { id: 'p-1', name: 'Sweet Corn Chat', basePrice: 69, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-1-sweet-corn-chat.png', description: 'Steamed sweet corn seasoned with chat masala and lime.' },
      { id: 'p-2', name: 'Chana Chat', basePrice: 79, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-2-chana-chat.png', description: 'Protein-rich boiled chickpeas tossed with onions, tomatoes and spicy chutney.' },
      { id: 'p-3', name: 'Sprouts Chat', basePrice: 99, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-3-sprouts-chat.png', description: 'Nutritious green gram sprouts with pomegranate, coriander and tangy lemon dressing.' },
      { id: 'p-4', name: 'Fruit Chat', basePrice: 109, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-4-fruit-chat.png', description: 'Assorted seasonal fresh fruits tossed with roasted cumin and royal spices.' },
      { id: 'p-5', name: 'Pineapple Chat', basePrice: 129, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-5-pineapple-chat.png', description: 'Juicy pineapple chunks dusted with mint, black salt and mild chili.' },
      { id: 'p-6', name: 'Sirka Onion Rings', basePrice: 79, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-6-sirka-onion-rings.png', description: 'Crispy vinegar-pickled shallots with green chillies and beet essence.' },
    ],
  },
  {
    id: 'cat-salad',
    name: 'Salad',
    slug: 'salad',
    description: 'Garden fresh salads and tandoori roasted greens',
    icon: 'Utensils',
    isVegCategory: true,
    displayOrder: 2,
    products: [
      { id: 'p-7', name: 'Green Salad', basePrice: 99, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-7-green-salad.png', description: 'Classic crisp cucumber, tomato, carrot and radish platter.' },
      { id: 'p-8', name: 'Special Lettuce Salad', basePrice: 149, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-8-special-lettuce-salad.png', description: 'Fresh iceberg lettuce with black olives, bell peppers and herb olive oil.' },
      { id: 'p-9', name: 'Cream Kachumber Salad', basePrice: 149, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-9-cream-kachumber-salad.jpg', description: 'Finely diced vegetables tossed in rich spiced cream dressing.' },
      { id: 'p-10', name: 'Tandoori Honey Cauliflower', basePrice: 179, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-10-tandoori-honey-cauliflower.png', description: 'Charcoal-glazed florets tossed in organic honey and crushed peppercorns.' },
      { id: 'p-11', name: 'Tandoori Pineapple', basePrice: 249, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-11-tandoori-pineapple.png', description: 'Spiced pineapple skewers charred to caramelized perfection in clay oven.' },
    ],
  },
  {
    id: 'cat-first-course',
    name: 'First Course',
    slug: 'first-course',
    description: 'Crunchy papads and royal masala baskets',
    icon: 'Layers',
    isVegCategory: true,
    displayOrder: 3,
    products: [
      { id: 'p-12', name: 'Tandoori Papad (2 Pieces)', basePrice: 49, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-12-tandoori-papad-2-pieces.png', description: 'Crisp roasted urad dal papads from clay tandoor.' },
      { id: 'p-13', name: 'Fried Papad (2 Pieces)', basePrice: 69, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-13-fried-papad-2-pieces.png', description: 'Golden fried crunchy lentil papads.' },
      { id: 'p-14', name: 'Masala Papad', basePrice: 99, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-14-masala-papad.png', description: 'Topped with spicy onion, tomato, coriander and sev.' },
      { id: 'p-15', name: 'Papad Basket', basePrice: 189, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-15-papad-basket.png', description: 'Assorted basket of spiced, roasted, fried and masala papads with mint dip.' },
    ],
  },
  {
    id: 'cat-malai-and-crispy',
    name: 'To Begin With Malai and Crispy',
    slug: 'malai-and-crispy',
    description: 'Golden fried crispy appetizers & cheesy bites',
    icon: 'Sparkles',
    isVegCategory: true,
    displayOrder: 4,
    products: [
      { id: 'p-16', name: 'Malai Sweet Corn', basePrice: 69, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-16-malai-sweet-corn.png', description: 'Creamy malai tossed butter corn.' },
      { id: 'p-17', name: 'French Fries', basePrice: 99, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-17-french-fries.png', description: 'Crispy salted potato fries.' },
      { id: 'p-18', name: 'Roasted Mix Nuts', basePrice: 109, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-18-roasted-mix-nuts.png', description: 'Ghee-roasted cashew, almond and peanut blend.' },
      { id: 'p-19', name: 'Crispy Corn', basePrice: 189, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-19-crispy-corn.png', description: 'Golden fried corn kernels with garlic and bell peppers.' },
      { id: 'p-20', name: 'Mushroom Duplex', basePrice: 199, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-20-mushroom-duplex.png', description: 'Stuffed cheese mushroom caps crumbed and crisp fried.' },
      { id: 'p-21', name: 'Cheese Corn Ball', basePrice: 219, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-21-cheese-corn-ball.png', description: 'Melt-in-mouth mozzarella and sweet corn balls.' },
      { id: 'p-22', name: 'Paneer Nuggets', basePrice: 219, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-22-paneer-nuggets.png', description: 'Crispy golden paneer bites with herb seasoning.' },
      { id: 'p-23', name: 'Chilly Paneer Dry', basePrice: 219, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-23-chilly-paneer-dry.png', description: 'Wok tossed paneer cubes with peppers and hot garlic soya.' },
      { id: 'p-24', name: 'Chilly Mushroom Dry', basePrice: 219, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-24-chilly-mushroom-dry.png', description: 'Crispy button mushrooms wok tossed with scallions.' },
      { id: 'p-25', name: 'Dahi Ke Solay', basePrice: 249, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-25-dahi-ke-solay.jpg', description: 'Hung curd & crushed dry fruit bread rolls fried golden.' },
      { id: 'p-26', name: 'Dahi Kabab', basePrice: 269, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-26-dahi-kabab.png', description: 'Velvety curd patties infused with green cardamom and saffron.' },
      { id: 'p-27', name: 'Crispy Platter', basePrice: 399, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-27-crispy-platter.png', description: 'Grand platter of Mushroom Duplex, Cheese Corn Ball, Paneer Nuggets, Dahi Ke Solay & Dahi Kabab.' },
    ],
  },
  {
    id: 'cat-veg-tandoor-bites',
    name: 'Veg Bites From the Tandoor',
    slug: 'veg-tandoor-bites',
    description: 'Clay oven charred tikkas and succulent chaaps',
    icon: 'Flame',
    isVegCategory: true,
    displayOrder: 5,
    products: [
      { id: 'p-28', name: 'Masala Chaap', basePrice: 219, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-28-masala-chaap.png', description: 'Soya chaap marinated in robust tandoori masala and mustard oil.' },
      { id: 'p-29', name: 'Lemon Chaap', basePrice: 229, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-29-lemon-chaap.png', description: 'Tangy lemon and black pepper spiced soya skewers.' },
      { id: 'p-30', name: 'Malai Chaap', basePrice: 239, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-30-malai-chaap.png', description: 'Rich cashew and cream marinated soya grilled over live coals.' },
      { id: 'p-31', name: 'Afghani Kali Mirch Chaap', basePrice: 249, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-31-afghani-kali-mirch-chaap.png', description: 'Smoky crushed black peppercorn cream chaap.' },
      { id: 'p-32', name: 'Veg Seekh Kabab', basePrice: 249, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-32-veg-seekh-kabab.png', description: 'Minced spiced vegetable skewers roasted over glowing charcoal.' },
      { id: 'p-33', name: 'Paneer Tikka', basePrice: 249, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-33-paneer-tikka.png', description: 'Fresh malai paneer cubes in royal tandoori marinade with peppers.' },
      { id: 'p-34', name: 'Paneer Malai Tikka', basePrice: 259, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-34-paneer-malai-tikka.png', description: 'Cardamom and cashew cream coated soft cottage cheese.' },
      { id: 'p-35', name: 'Mushroom Tikka', basePrice: 259, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-35-mushroom-tikka.png', description: 'Marinated button mushrooms skewered and roasted.' },
      { id: 'p-36', name: 'Tandoori Veg Platter', basePrice: 599, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-36-tandoori-veg-platter.png', description: 'Assorted Lemon Chaap, Malai Chaap, Veg Seekh Kabab, Paneer Tikka & Mushroom Tikka.' },
    ],
  },
  {
    id: 'cat-main-course-veg',
    name: 'The Main Affair From the Wok and Handi — Veg',
    slug: 'main-course-veg',
    description: 'Rich slow-cooked daals, paneer curries and handi biryani',
    icon: 'Soup',
    isVegCategory: true,
    displayOrder: 6,
    products: [
      { id: 'p-37', name: 'Dal Tadka', basePrice: 199, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-37-dal-tadka.png', description: 'Yellow lentils tempered with cumin, garlic, dry red chilies and pure desi ghee.' },
      { id: 'p-38', name: 'Dal Makhani', basePrice: 219, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-38-dal-makhani.png', description: 'Signature black lentils slow-simmered overnight with white butter and rich cream.' },
      { id: 'p-39', name: 'Chana Masala', basePrice: 219, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-39-chana-masala.jpg', description: 'Tender chickpeas cooked in traditional Amritsari pomegranate-spiced gravy.' },
      { id: 'p-40', name: 'Mix Veg Handi', basePrice: 229, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-40-mix-veg-handi.png', description: 'Seasonal garden vegetables tossed in thick onion-tomato handi masala.' },
      { id: 'p-41', name: 'Dum Aloo Kashmiri', basePrice: 229, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-41-dum-aloo-kashmiri.jpg', description: 'Baby potatoes stuffed with paneer and simmered in aromatic fennel and ginger gravy.' },
      { id: 'p-42', name: 'Mushroom Do Pyaza', basePrice: 249, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-42-mushroom-do-pyaza.jpg', description: 'Fresh button mushrooms cooked with caramelized baby onions and crushed spices.' },
      { id: 'p-43', name: 'Matar Paneer', basePrice: 249, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-43-matar-paneer.jpg', description: 'Soft paneer and sweet green peas in home-style spiced curry.' },
      { id: 'p-44', name: 'Kadhai Paneer', basePrice: 269, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-44-kadhai-paneer.png', description: 'Cottage cheese wok-tossed with crushed coriander seeds, bell peppers and spicy gravy.' },
      { id: 'p-45', name: 'Paneer Butter Masala', basePrice: 279, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-45-paneer-butter-masala.jpg', description: 'Silky smooth tomato and cashew nut makhani gravy enriched with butter.' },
      { id: 'p-46', name: 'Shahi Paneer', basePrice: 289, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-46-shahi-paneer.png', description: 'Royal Mughlai preparation of paneer in aromatic white cashew cream sauce.' },
    ],
  },
  {
    id: 'cat-red-and-white-snacks',
    name: 'To Begin With Red and White Snacks (Egg)',
    slug: 'red-and-white-snacks',
    description: 'Golden fried egg appetizers and spicy snacks',
    icon: 'Flame',
    isVegCategory: false,
    displayOrder: 7,
    products: [
      { id: 'p-47', name: 'Boiled Eggs (2 Eggs)', basePrice: 49, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-47-boiled-eggs-2-eggs.png', description: 'Farm fresh hard-boiled eggs served with black pepper and chaat masala.' },
      { id: 'p-48', name: 'Fried Egg (2 Eggs)', basePrice: 69, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-48-fried-egg-2-eggs.jpg', description: 'Sunny-side up or double-fried farm eggs with butter.' },
      { id: 'p-49', name: 'Plain Omelette (2 Eggs)', basePrice: 79, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-49-plain-omelette-2-eggs.jpg', description: 'Fluffy two-egg omelette with light seasoning.' },
      { id: 'p-50', name: 'Masala Omelette (2 Eggs)', basePrice: 99, isVeg: false, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-50-masala-omelette-2-eggs.jpg', description: 'Loaded with chopped onions, green chilies, tomatoes and fresh coriander.' },
      { id: 'p-51', name: 'Egg Bhurji (3 Eggs)', basePrice: 119, isVeg: false, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-51-egg-bhurji-3-eggs.png', description: 'Spiced scrambled farm eggs with butter, onions and aromatic spices.' },
      { id: 'p-52', name: 'Cheese Omelette (2 Eggs)', basePrice: 129, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-52-cheese-omelette-2-eggs.jpg', description: 'Folded fluffy omelette stuffed with melted mozzarella.' },
      { id: 'p-53', name: 'Egg Pakoda (6 Pieces)', basePrice: 149, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-53-egg-pakoda-6-pieces.jpg', description: 'Boiled egg halves batter-dipped in spiced gram flour and fried crisp.' },
    ],
  },
  {
    id: 'cat-non-veg-tandoor',
    name: 'Non-Veg Bites From the Tandoor',
    slug: 'non-veg-tandoor',
    description: 'Charcoal-grilled chicken tikkas, seekh kababs and tandoori roasts',
    icon: 'Flame',
    isVegCategory: false,
    displayOrder: 8,
    products: [
      { id: 'p-54', name: 'Tandoori Chicken', basePrice: 299, isVeg: false, isBestseller: true, hasVariations: true, priceSmallHalf: 299, priceLargeFull: 499, imageUrl: '/images/menu/p-54-tandoori-chicken.jpg', description: 'Whole bone-in chicken marinated in yogurt, Kashmiri red chili and roasted in clay oven.' },
      { id: 'p-55', name: 'Afghani Chicken', basePrice: 329, isVeg: false, isBestseller: true, hasVariations: true, priceSmallHalf: 329, priceLargeFull: 549, imageUrl: '/images/menu/p-55-afghani-chicken.jpg', description: 'Rich cashew paste, white pepper and cream glazed charcoal-roasted chicken.' },
      { id: 'p-56', name: 'Chicken Tikka (6 Pieces)', basePrice: 299, isVeg: false, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-56-chicken-tikka-6-pieces.png', description: 'Boneless chicken morsels in classic spicy tandoori marinade with mint chutney.' },
      { id: 'p-57', name: 'Chicken Malai Tikka (6 Pieces)', basePrice: 329, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-57-chicken-malai-tikka-6-pieces.png', description: 'Melt-in-mouth chicken chunks in cardamom cream and roasted cheese marinade.' },
      { id: 'p-58', name: 'Chicken Seekh Kabab', basePrice: 299, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-58-chicken-seekh-kabab.png', description: 'Minced chicken skewers seasoned with herbs, mint, and tandoori spices.' },
      { id: 'p-59', name: 'Chicken Kali Mirch Tikka', basePrice: 319, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-59-chicken-kali-mirch-tikka.png', description: 'Pungent crushed black peppercorn crusted grilled chicken.' },
      { id: 'p-60', name: 'Chicken Tangri Kabab (4 Pieces)', basePrice: 349, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-60-chicken-tangri-kabab-4-pieces.jpg', description: 'Stuffed succulent chicken drumsticks roasted in clay tandoor.' },
      { id: 'p-61', name: 'Tandoori Non-Veg Platter', basePrice: 699, isVeg: false, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-61-tandoori-non-veg-platter.png', description: 'Assorted platter of Tandoori Chicken, Chicken Tikka, Malai Tikka & Chicken Seekh Kabab.' },
    ],
  },
  {
    id: 'cat-main-course-non-veg',
    name: 'The Main Affair From the Wok and Handi — Non-Veg',
    slug: 'main-course-non-veg',
    description: 'Rich slow-cooked chicken curries, butter chicken and biryanis',
    icon: 'Soup',
    isVegCategory: false,
    displayOrder: 9,
    products: [
      { id: 'p-62', name: 'Egg Curry (2 Eggs)', basePrice: 199, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-62-egg-curry-2-eggs.jpg', description: 'Boiled and shallow-fried eggs in spicy dhaba-style onion tomato gravy.' },
      { id: 'p-63', name: 'Chicken Curry (Home Style)', basePrice: 319, isVeg: false, isBestseller: true, hasVariations: true, priceSmallHalf: 319, priceLargeFull: 529, imageUrl: '/images/menu/p-63-chicken-curry-home-style.png', description: 'Home-style slow cooked country chicken in whole spice gravy.' },
      { id: 'p-64', name: 'Kadhai Chicken', basePrice: 339, isVeg: false, isBestseller: true, hasVariations: true, priceSmallHalf: 339, priceLargeFull: 559, imageUrl: '/images/menu/p-64-kadhai-chicken.png', description: 'Tender chicken tossed with capsicum, onion flakes and freshly ground coriander spices.' },
      { id: 'p-65', name: 'Butter Chicken (Murgh Makhani)', basePrice: 349, isVeg: false, isBestseller: true, hasVariations: true, priceSmallHalf: 349, priceLargeFull: 579, imageUrl: '/images/menu/p-65-butter-chicken-murgh-makhani.png', description: 'Iconic Delhi style tandoori chicken simmered in rich creamy tomato and butter gravy.' },
      { id: 'p-66', name: 'Chicken Handi (Aapno Special)', basePrice: 349, isVeg: false, isBestseller: true, hasVariations: true, priceSmallHalf: 349, priceLargeFull: 579, imageUrl: '/images/menu/p-66-chicken-handi-aapno-special.png', description: 'Specialty earthenware pot cooked chicken enriched with desi ghee and secret spices.' },
      { id: 'p-67', name: 'Chicken Rara', basePrice: 369, isVeg: false, isBestseller: true, hasVariations: true, priceSmallHalf: 369, priceLargeFull: 599, imageUrl: '/images/menu/p-67-chicken-rara.jpg', description: 'Chicken pieces cooked in rich, spicy minced chicken (keema) gravy.' },
      { id: 'p-68', name: 'Chicken Tikka Masala', basePrice: 349, isVeg: false, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-68-chicken-tikka-masala.png', description: 'Boneless grilled chicken tikka tossed in spicy and tangy masala gravy.' },
      { id: 'p-69', name: 'Chicken Kali Mirch Gravy', basePrice: 349, isVeg: false, isBestseller: false, hasVariations: true, priceSmallHalf: 349, priceLargeFull: 579, imageUrl: '/images/menu/p-69-chicken-kali-mirch-gravy.jpg', description: 'Creamy cashew and black pepper gravy with succulent chicken chunks.' },
      { id: 'p-70', name: 'Chicken Dum Biryani (With Raita)', basePrice: 299, isVeg: false, isBestseller: true, hasVariations: true, priceSmallHalf: 299, priceLargeFull: 499, imageUrl: '/images/menu/p-70-chicken-dum-biryani-with-raita.png', description: 'Aromatic aged Basmati rice layered with spiced chicken and sealed in clay pot.' },
      { id: 'p-71', name: 'Mutton Curry (Seasonal Special)', basePrice: 449, isVeg: false, isBestseller: false, hasVariations: true, priceSmallHalf: 449, priceLargeFull: 799, imageUrl: '/images/menu/p-71-mutton-curry-seasonal-special.png', description: 'Slow cooked tender mutton pieces in spicy traditional Rajasthani Laal Maas gravy.' },
    ],
  },
  {
    id: 'cat-indian-breads',
    name: 'Indian Breads &amp; Sides',
    slug: 'indian-breads',
    description: 'Hot clay oven rotis, butter naans, parathas and rice',
    icon: 'Utensils',
    isVegCategory: true,
    displayOrder: 10,
    products: [
      { id: 'p-72', name: 'Tandoori Roti Plain', basePrice: 15, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-72-tandoori-roti-plain.png', description: 'Whole wheat bread baked in clay tandoor.' },
      { id: 'p-73', name: 'Tandoori Butter Roti', basePrice: 20, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-73-tandoori-butter-roti.png', description: 'Whole wheat roti brushed with pure desi ghee or Amul butter.' },
      { id: 'p-74', name: 'Plain Naan', basePrice: 40, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-74-plain-naan.jpg', description: 'Soft leavened refined flour flatbread.' },
      { id: 'p-75', name: 'Butter Naan', basePrice: 50, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-75-butter-naan.jpg', description: 'Layered soft naan brushed with salted butter.' },
      { id: 'p-76', name: 'Garlic Butter Naan', basePrice: 65, isVeg: true, isBestseller: true, hasVariations: false, imageUrl: '/images/menu/p-76-garlic-butter-naan.jpg', description: 'Topped with minced garlic and coriander.' },
      { id: 'p-77', name: 'Lachha Paratha', basePrice: 55, isVeg: true, isBestseller: false, hasVariations: false, imageUrl: '/images/menu/p-77-lachha-paratha.png', description: 'Multi-layered crispy whole wheat paratha.' },
    ],
  },
];

// Runtime Live Product Overrides Map (synchronizes across all API routes & components)
const globalOverrides = (global as any).__PRODUCT_OVERRIDES || new Map<string, any>();
(global as any).__PRODUCT_OVERRIDES = globalOverrides;

export const RUNTIME_PRODUCT_OVERRIDES = globalOverrides;

export function updateProductOverride(id: string, updates: any) {
  const existing = globalOverrides.get(id) || {};
  const merged = { ...existing, ...updates, isAvailable: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : true };
  globalOverrides.set(id, merged);
  if (updates.name) {
    globalOverrides.set(updates.name, merged);
  }
}

export function getMergedCategories(baseCategories: any[] = MASTER_AAPNO_KHANO_CATEGORIES) {
  return (baseCategories || MASTER_AAPNO_KHANO_CATEGORIES).map((cat) => ({
    ...cat,
    products: (cat.products || []).map((prod: any) => {
      const override = globalOverrides.get(prod.id) || globalOverrides.get(prod.name);
      const res = override ? { ...prod, ...override } : { ...prod };
      if (res.isAvailable === undefined) res.isAvailable = true;
      return res;
    }),
  }));
}
