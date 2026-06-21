export type SizeOption = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "ONE SIZE";

export type ColorOption = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "Women" | "Men" | "Accessories" | "Footwear" | "Outerwear";
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: ColorOption[];
  sizes: SizeOption[];
  badge?: "New" | "Bestseller" | "Limited" | "Sustainable";
  description: string;
  shortDescription: string;
  materials: { label: string; value: string }[];
  craftsmanship: string;
  care: string;
  origin: string;
  sustainability: string;
  fit: string;
  features: string[];
  sku: string;
  inStock: number;
};

// Curated Unsplash photography — fashion model / product shots
const img = {
  // Hero / lifestyle
  hero1: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  hero2: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
  hero3: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1600&q=80",

  // Women — Apparel
  woolCoat1: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80",
  woolCoat2: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
  silkDress1: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
  silkDress2: "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=900&q=80",
  cashSweater1: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
  cashSweater2: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80",
  linenShirt1: "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=900&q=80",
  linenShirt2: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=900&q=80",
  leatherBag1: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  leatherBag2: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80",

  // Men — Apparel
  woolSuit1: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
  woolSuit2: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=900&q=80",
  oxfordShirt1: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
  oxfordShirt2: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
  mensKnit1: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=80",
  mensKnit2: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&w=900&q=80",
  mensJeans1: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
  mensJeans2: "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=900&q=80",

  // Footwear
  leatherBoot1: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80",
  leatherBoot2: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80",
  sneakers1: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
  sneakers2: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80",
  heels1: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
  heels2: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=900&q=80",

  // Accessories
  sunglasses1: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80",
  sunglasses2: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=900&q=80",
  watch1: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  watch2: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
  scarf1: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80",
  scarf2: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=900&q=80",
  wallet1: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",

  // Editorial
  editorial1: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1600&q=80",
  editorial2: "https://images.unsplash.com/photo-1485231183945-fffde7cc051e?auto=format&fit=crop&w=1600&q=80",
  editorial3: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80",
};

export const heroImages = {
  primary: img.hero1,
  secondary: img.hero2,
  tertiary: img.hero3,
  editorial1: img.editorial1,
  editorial2: img.editorial2,
  editorial3: img.editorial3,
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Camille Wool-Blend Tailored Coat",
    brand: "MAISON ÉLÉGANCE",
    category: "Outerwear",
    subcategory: "Coats",
    price: 689,
    compareAtPrice: 850,
    currency: "USD",
    rating: 4.9,
    reviewCount: 247,
    images: [img.woolCoat1, img.woolCoat2, img.hero3, img.editorial1],
    colors: [
      { name: "Camel", hex: "#c19a6b" },
      { name: "Charcoal", hex: "#36454f" },
      { name: "Ivory", hex: "#fffff0" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    badge: "Bestseller",
    description:
      "An emblem of refined winter dressing, the Camille coat is cut from a luxurious Italian wool-cashmere blend and tailored to a clean, elongated silhouette. The notched lapel and concealed two-button closure lend quiet authority, while the half-lined interior ensures a fluid drape that moves with you. Hand-finished horn buttons and pick-stitch detailing along the lapel reflect the atelier savoir-faire that defines every MAISON ÉLÉGANCE outerwear piece.",
    shortDescription:
      "Italian wool-cashmere tailored coat with notched lapel and concealed closure.",
    materials: [
      { label: "Outer", value: "70% Virgin Wool, 30% Cashmere (Italian mill)" },
      { label: "Lining", value: "100% Cupro (Bemberg™)" },
      { label: "Buttons", value: "Genuine corozo nut, hand-stitched" },
    ],
    craftsmanship:
      "Each coat is constructed over 18 hours by a single master tailor in our Florence atelier. The canvas is half-fused and padded by hand to maintain structure while preserving a natural roll. Pick-stitch lapels, hand-attached buttons, and a hand-finished hem are signatures of true bespoke-grade construction.",
    care: "Dry clean only by a specialist in natural fibres. Store on a broad wooden hanger. Steam gently to refresh and remove wrinkles — never iron directly.",
    origin: "Designed in Paris, hand-tailored in Florence, Italy.",
    sustainability:
      "Crafted from RWS-certified non-mulesed wool and cashmere sourced from Mongolian cooperatives. Made in a GOTS-certified facility powered by 100% renewable energy.",
    fit: "Tailored fit. We recommend taking your usual size. Model is 178cm wearing size S. Coat length: 102cm.",
    features: [
      "Notched lapel with hand pick-stitch",
      "Concealed two-button front placket",
      "Two internal pockets, two exterior flap pockets",
      "Half-lined for fluid drape",
      "Hand-finished horn buttons",
    ],
    sku: "ME-OW-CAM-001",
    inStock: 18,
  },
  {
    id: "p2",
    name: "Aurora Silk Slip Dress",
    brand: "MAISON ÉLÉGANCE",
    category: "Women",
    subcategory: "Dresses",
    price: 395,
    currency: "USD",
    rating: 4.8,
    reviewCount: 189,
    images: [img.silkDress1, img.silkDress2, img.hero2, img.editorial2],
    colors: [
      { name: "Champagne", hex: "#f7e7ce" },
      { name: "Midnight", hex: "#191970" },
      { name: "Burgundy", hex: "#800020" },
    ],
    sizes: ["XS", "S", "M", "L"],
    badge: "New",
    description:
      "A study in restrained sensuality, the Aurora slip dress is cut on the bias from 19-momme charmeuse silk that catches the light with every movement. The cowl neckline and barely-there shoulder straps are anchored by an adjustable back, while the floor-skimming hemline traces the body's natural curve. A piece that transitions seamlessly from intimate dinners to gallery openings.",
    shortDescription:
      "19-momme bias-cut silk charmeuse slip dress with cowl neckline.",
    materials: [
      { label: "Fabric", value: "100% Mulberry Silk, 19 momme charmeuse" },
      { label: "Thread", value: "100% Silk finishing thread" },
      { label: "Care label", value: "Recycled polyester" },
    ],
    craftsmanship:
      "Bias cutting is a lost art — each dress consumes nearly 40% more fabric than a straight-cut equivalent to achieve the signature fluid drape. Our seamstresses in Como have over 25 years of experience cutting silk on the bias.",
    care: "Hand wash cold with silk-safe detergent, or dry clean. Hang to dry away from direct sunlight. Iron on silk setting through a pressing cloth.",
    origin: "Designed in Paris, sewn in Como, Italy.",
    sustainability:
      "Certified by OEKO-TEX Standard 100. Silk is dyed with low-impact, GOTS-certified dyes in a closed-loop water system that recycles 95% of process water.",
    fit: "Body-skimming bias cut. If between sizes, size up for a relaxed fit. Model is 175cm wearing size S. Dress length: 138cm.",
    features: [
      "Bias-cut for fluid drape",
      "Adjustable spaghetti straps",
      "Cowl neckline with weighted front",
      "French seams throughout",
      "Center back invisible zip",
    ],
    sku: "ME-WD-AUR-002",
    inStock: 24,
  },
  {
    id: "p3",
    name: "Edmonton Cashmere Crewneck",
    brand: "MAISON ÉLÉGANCE",
    category: "Women",
    subcategory: "Knitwear",
    price: 285,
    currency: "USD",
    rating: 4.9,
    reviewCount: 312,
    images: [img.cashSweater1, img.cashSweater2, img.editorial1, img.hero2],
    colors: [
      { name: "Oat", hex: "#d4c5a0" },
      { name: "Stone Grey", hex: "#928b7e" },
      { name: "Black", hex: "#1a1a1a" },
      { name: "Rose", hex: "#c97b7b" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    badge: "Bestseller",
    description:
      "Spun from grade-A Mongolian cashmere and knit to a precise 12-gauge, the Edmonton crewneck is the kind of sweater you'll reach for from October to April. The ribbed crew neckline, cuffs, and hem hold their shape through countless wears, while the slightly relaxed body flatters without bulk. Pre-washed for an immediate, lived-in softness.",
    shortDescription:
      "12-gauge grade-A Mongolian cashmere crewneck sweater, pre-washed.",
    materials: [
      { label: "Yarn", value: "100% Grade-A Mongolian Cashmere, 16.5 micron" },
      { label: "Weight", value: "320 g/m² (heavyweight)" },
      { label: "Dye", value: "Low-impact reactive dyes" },
    ],
    craftsmanship:
      "Knit on Shima Seiki machines in Inner Mongolia, then hand-linked at the shoulders and underarms for seamless strength. Each sweater is individually inspected and pre-washed to lock in softness.",
    care: "Hand wash cold with cashmere shampoo, or dry clean. Dry flat on a towel. Store folded with cedar blocks.",
    origin: "Knit in Inner Mongolia, finished in Italy.",
    sustainability:
      "Certified by The Good Cashmere Standard. Fibers sourced from goats grazed on regenerative pastures, supporting nomadic herder communities.",
    fit: "Relaxed fit. Take your usual size for the intended silhouette, or size down for a fitted look. Model is 173cm wearing size S.",
    features: [
      "12-gauge knit for substantial drape",
      "Hand-linked shoulders and underarms",
      "Ribbed crew neckline, cuffs, and hem",
      "Pre-washed for immediate softness",
      "Pilling-resistant finish",
    ],
    sku: "ME-WK-EDM-003",
    inStock: 56,
  },
  {
    id: "p4",
    name: "Lyon Linen Shirt",
    brand: "MAISON ÉLÉGANCE",
    category: "Men",
    subcategory: "Shirts",
    price: 165,
    currency: "USD",
    rating: 4.7,
    reviewCount: 156,
    images: [img.linenShirt1, img.linenShirt2, img.editorial3, img.hero1],
    colors: [
      { name: "Off-White", hex: "#faf5e6" },
      { name: "Sky Blue", hex: "#a3c1dc" },
      { name: "Sand", hex: "#e2c290" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Cut from European flax linen woven in Normandy, the Lyon shirt is built for the warmer months. The relaxed body and soft, garment-dyed finish give it the easy character of a shirt that's already been worn and loved. Mother-of-pearl buttons and a soft camp collar make it equally at home over swim trunks or tucked into tailored trousers.",
    shortDescription:
      "Garment-dyed European flax linen shirt with camp collar.",
    materials: [
      { label: "Fabric", value: "100% European Flax Linen, 180 g/m²" },
      { label: "Buttons", value: "Genuine mother-of-pearl" },
      { label: "Thread", value: "100% Cotton" },
    ],
    craftsmanship:
      "Woven on slow shuttle looms in Normandy — the traditional home of European linen. Garment-dyed in small batches for depth of color and a softened hand.",
    care: "Machine wash cold, gentle cycle. Hang to dry. Linen softens and improves with every wash. Iron on medium if a crisp look is desired.",
    origin: "Woven in Normandy, France. Sewn in Porto, Portugal.",
    sustainability:
      "European Flax® certified — rain-fed, non-irrigated flax grown without irrigation or GMOs. Zero-waste dyeing process. Certified by Masters of Linen.",
    fit: "Relaxed fit. Take your usual size. Model is 188cm wearing size M. Shirt length: 76cm.",
    features: [
      "Soft camp collar",
      "Mother-of-pearl buttons",
      "Garment-dyed for depth of color",
      "Single-needle stitching throughout",
      "Curved hem with side gussets",
    ],
    sku: "ME-MS-LYO-004",
    inStock: 42,
  },
  {
    id: "p5",
    name: "Mira Structured Leather Tote",
    brand: "MAISON ÉLÉGANCE",
    category: "Accessories",
    subcategory: "Bags",
    price: 525,
    compareAtPrice: 620,
    currency: "USD",
    rating: 4.8,
    reviewCount: 98,
    images: [img.leatherBag1, img.leatherBag2, img.editorial1, img.hero2],
    colors: [
      { name: "Cognac", hex: "#8a4117" },
      { name: "Black", hex: "#0d0d0d" },
      { name: "Bone", hex: "#e3dab9" },
    ],
    sizes: ["ONE SIZE"],
    badge: "Limited",
    description:
      "The Mira tote is the everyday companion that will outlast trends — and likely you. Cut from full-grain Italian vegetable-tanned leather, it softens and develops a unique patina with every wear. The structured silhouette holds its shape whether empty or full, while the suede-lined interior keeps essentials organized with a zip pocket and two slip pockets.",
    shortDescription:
      "Full-grain Italian vegetable-tanned leather structured tote.",
    materials: [
      { label: "Body", value: "Full-grain vegetable-tanned calf leather, 2.2mm" },
      { label: "Lining", value: "100% Italian split suede" },
      { label: "Hardware", value: "Solid brass with antique finish" },
    ],
    craftsmanship:
      "Hand-cut and saddle-stitched in our Florence workshop. Saddle stitching uses two needles and a single thread — unlike machine lock-stitching, a broken saddle stitch won't unravel. The edges are painted in seven layers and burnished by hand for a glass-smooth finish.",
    care: "Wipe with a soft dry cloth. Condition every 3-6 months with a neutral leather balm. Avoid prolonged exposure to direct sunlight and water. Patina will develop naturally with use.",
    origin: "Handmade in Florence, Italy.",
    sustainability:
      "Vegetable-tanned using bark extracts in a 30-day process — no chrome or heavy metals. Certified by the Genuine Italian Vegetable-Tanned Leather Consortium (Pelle Conciata al Vegetale).",
    fit: "Dimensions: 38cm W × 30cm H × 13cm D. Handle drop: 22cm. Fits a 14\" laptop.",
    features: [
      "Saddle-stitched by hand",
      "Magnetic snap closure",
      "Suede-lined interior",
      "Interior zip pocket + two slip pockets",
      "Solid brass hardware",
      "Seven-layer hand-painted edges",
    ],
    sku: "ME-AC-MIR-005",
    inStock: 12,
  },
  {
    id: "p6",
    name: "Sartorial Two-Piece Wool Suit",
    brand: "MAISON ÉLÉGANCE",
    category: "Men",
    subcategory: "Suits",
    price: 1290,
    currency: "USD",
    rating: 4.9,
    reviewCount: 78,
    images: [img.woolSuit1, img.woolSuit2, img.editorial1, img.hero3],
    colors: [
      { name: "Navy", hex: "#1b2951" },
      { name: "Charcoal", hex: "#36454f" },
      { name: "Mid-Grey", hex: "#8a8e8f" },
    ],
    sizes: ["S", "M", "L", "XL"],
    badge: "Bestseller",
    description:
      "The Sartorial suit is our masterwork — a half-canvas construction cut from Loro Piana's 4-ply wool that drapes with the gravitas of true bespoke. Soft-shouldered with natural canvas, hand-padded lapels, and a suppressed waist, it moves with you and feels broken-in from the first wear. A benchmark for what off-the-rack can aspire to be.",
    shortDescription:
      "Half-canvas Loro Piana wool two-piece suit, soft-shouldered.",
    materials: [
      { label: "Fabric", value: "100% Wool, Loro Piana 4-ply, 280 g/m²" },
      { label: "Canvas", value: "Wool + horsehair, hand-padded" },
      { label: "Lining", value: "100% Cupro (Bemberg™)" },
      { label: "Buttons", value: "Genuine water-buffalo horn" },
    ],
    craftsmanship:
      "Half-canvas construction — the canvas is hand-padded to the chest piece using 3,500+ hand stitches. This allows the jacket to mold to the wearer's body over time. Working surgeon's cuffs, hand-attached horn buttons, and pick-stitch lapels complete the bespoke-grade detailing.",
    care: "Dry clean sparingly — once per season at most. Steam between wears to refresh and kill bacteria. Store on a broad-shouldered wooden hanger. Rotate with at least one other suit.",
    origin: "Designed in Paris, hand-tailored in Naples, Italy.",
    sustainability:
      "Wool certified by Vitale Barberis Canonico's sustainability program. Made in a family-run atelier that has operated for three generations. No chemical finishing — wool is naturally odor-resistant.",
    fit: "Slim tailored fit. Half-canvas construction molds to the body with wear. Model is 188cm, 80kg, wearing size 40R. Jacket length: 76cm.",
    features: [
      "Half-canvas, hand-padded chest",
      "Soft natural shoulder",
      "Working surgeon's cuffs (4 buttons)",
      "Hand-attached horn buttons",
      "Pick-stitch lapel and pocket edges",
      "Side vents",
    ],
    sku: "ME-MS-SAR-006",
    inStock: 9,
  },
  {
    id: "p7",
    name: "Heritage Oxford Cloth Shirt",
    brand: "MAISON ÉLÉGANCE",
    category: "Men",
    subcategory: "Shirts",
    price: 145,
    currency: "USD",
    rating: 4.7,
    reviewCount: 234,
    images: [img.oxfordShirt1, img.oxfordShirt2, img.editorial2, img.hero1],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Pale Blue", hex: "#bcd4e6" },
      { name: "Pink", hex: "#f4c2c2" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "The definitive oxford cloth button-down, woven in Japan on vintage shuttle looms. The 6.5oz oxford weave has the satisfying heft of a shirt that will outlast a decade of weekly wear. A soft unlined button-down collar, real MOP buttons, and a single-needle construction throughout — the kind of shirt that quietly announces you understand the difference.",
    shortDescription:
      "6.5oz Japanese oxford cloth button-down with MOP buttons.",
    materials: [
      { label: "Fabric", value: "100% Combed Cotton, 6.5oz Japanese oxford" },
      { label: "Buttons", value: "Genuine mother-of-pearl, 2.5mm" },
      { label: "Thread", value: "Core-spun cotton" },
    ],
    craftsmanship:
      "Single-needle construction at 22 stitches per inch. The unlined collar is hand-folded and sewn, not glued — the only way to achieve the natural roll that defines a true OCBD. Side seams are felled for strength.",
    care: "Machine wash cold. Tumble dry low, then hang to finish. Light starch optional. Iron on cotton setting.",
    origin: "Woven in Okayama, Japan. Sewn in Porto, Portugal.",
    sustainability:
      "Woven on vintage shuttle looms that consume 1/10th the electricity of modern projectile looms. Cotton certified by the Better Cotton Initiative.",
    fit: "Classic fit. Take your usual size. Model is 188cm wearing size M. Shirt length: 78cm.",
    features: [
      "Soft unlined button-down collar",
      "Real mother-of-pearl buttons",
      "Single-needle stitching (22 SPI)",
      "Felled side seams",
      "Box pleat with locker loop",
      "Six-button front",
    ],
    sku: "ME-MS-HER-007",
    inStock: 64,
  },
  {
    id: "p8",
    name: "Atelier Selvedge Denim",
    brand: "MAISON ÉLÉGANCE",
    category: "Men",
    subcategory: "Denim",
    price: 245,
    currency: "USD",
    rating: 4.8,
    reviewCount: 187,
    images: [img.mensJeans1, img.mensJeans2, img.editorial3, img.hero1],
    colors: [
      { name: "Indigo", hex: "#3f51b1" },
      { name: "Black", hex: "#0d0d0d" },
    ],
    sizes: ["S", "M", "L", "XL"],
    badge: "Sustainable",
    description:
      "Cut from 14oz Kaihara selvedge denim woven on vintage shuttle looms, the Atelier jean is built to fade beautifully over years of wear. The mid-rise straight cut is neither skinny nor baggy — a timeless silhouette that flatters across decades. Chain-stitched hem, copper rivets, and a button fly reference the workwear heritage of true denim.",
    shortDescription:
      "14oz Japanese Kaihara selvedge denim, mid-rise straight cut.",
    materials: [
      { label: "Fabric", value: "100% Cotton, 14oz Kaihara selvedge denim" },
      { label: "Rivets", value: "Solid copper, vintage-finished" },
      { label: "Pocket bags", value: "100% Cotton, natural ecru" },
    ],
    craftsmanship:
      "Chain-stitched hem on a vintage Union Special 43200G — the only machine that produces the iconic 'roping' fade at the hem. All interior seams are flat-felled or overlocked for durability.",
    care: "Wear for at least 6 months before first wash to develop fade lines. Soak in cold water with mild detergent inside-out. Hang to dry. Avoid the dryer.",
    origin: "Woven in Okayama, Japan. Sewn in Los Angeles, USA.",
    sustainability:
      "Woven on shuttle looms that produce narrow (30-inch) fabric at 1/10th the speed of modern looms — slow, intentional, and built to last. Dyes are natural indigo with no synthetic shortcuts.",
    fit: "Mid-rise straight cut. Sits at the natural waist. Take your usual size — they will stretch 3-5% with wear. Model is 188cm wearing size 32.",
    features: [
      "14oz Kaihara selvedge denim",
      "Chain-stitched hem (Union Special)",
      "Solid copper rivets",
      "Button fly (donut buttons)",
      "Selvedge coin pocket",
      "Raw indigo — fades with wear",
    ],
    sku: "ME-MD-ATE-008",
    inStock: 38,
  },
  {
    id: "p9",
    name: "Verona Hand-Welted Boots",
    brand: "MAISON ÉLÉGANCE",
    category: "Footwear",
    subcategory: "Boots",
    price: 745,
    currency: "USD",
    rating: 5.0,
    reviewCount: 64,
    images: [img.leatherBoot1, img.leatherBoot2, img.editorial2, img.hero3],
    colors: [
      { name: "Walnut", hex: "#7b4a2b" },
      { name: "Black", hex: "#0d0d0d" },
      { name: "Cognac", hex: "#8a4117" },
    ],
    sizes: ["S", "M", "L", "XL"],
    badge: "Limited",
    description:
      "A boot that will outlive most of your wardrobe. The Verona is hand-welted — a 200-step process that predates the Goodyear welt — using a single rib of leather stitched directly to the insole. No canvas gemming, no shortcuts. The result is a boot that can be resoled indefinitely, becoming more comfortable with every wear. The upper is calf leather from the Tannery District of Tuscany.",
    shortDescription:
      "Hand-welted Tuscan calf leather boots, resoleable indefinitely.",
    materials: [
      { label: "Upper", value: "Full-grain Tuscan calf leather, 2.5mm" },
      { label: "Sole", value: "JR Leather sole, 5mm" },
      { label: "Insole", value: "Shoulder bend vegetable-tanned leather, 4mm" },
      { label: "Laces", value: "Waxed cotton, 2.5mm" },
    ],
    craftsmanship:
      "Hand-welted using a single leather rib — not canvas gemming as in Goodyear welt. The maker, with 35+ years of experience, spends ~30 hours on each pair. The leather sole is channel-stitched and the heel stack is hand-built from 11 layers of leather.",
    care: "Use shoe trees after every wear. Condition monthly with a neutral leather cream. Polish with a wax polish for shine. Resole every 2-3 years depending on wear. Never wear two days in a row.",
    origin: "Handmade in a 4-person workshop in Marche, Italy.",
    sustainability:
      "A pair of hand-welted boots can last 30+ years with resoling — versus 1-2 years for cemented footwear. Vegetable-tanned leather is biodegradable. Made in a small workshop with minimal machinery.",
    fit: "True to size for a D-width foot. Wide feet should size up by half. Model wears size 9US. Boot height: 18cm.",
    features: [
      "Hand-welted (no canvas gemming)",
      "Channel-stitched leather sole",
      "11-layer stacked leather heel",
      "Cork footbed molds to your foot",
      "Resoleable indefinitely",
      "Calf leather upper from Tuscany",
    ],
    sku: "ME-FB-VER-009",
    inStock: 6,
  },
  {
    id: "p10",
    name: "Court Leather Sneakers",
    brand: "MAISON ÉLÉGANCE",
    category: "Footwear",
    subcategory: "Sneakers",
    price: 295,
    currency: "USD",
    rating: 4.6,
    reviewCount: 142,
    images: [img.sneakers1, img.sneakers2, img.editorial3, img.hero1],
    colors: [
      { name: "White", hex: "#fafafa" },
      { name: "Bone", hex: "#e3dab9" },
    ],
    sizes: ["S", "M", "L", "XL"],
    badge: "New",
    description:
      "The court sneaker refined. Made from soft Italian nappa leather on a Margom Vulcanized rubber sole — the gold standard for premium sneaker construction. Hand-lasted in Portugal with a Blake-stitched construction that allows the shoe to be resoled. A minimalist silhouette that elevates everything from denim to tailored trousers.",
    shortDescription:
      "Italian nappa leather court sneakers on Margom vulcanized sole.",
    materials: [
      { label: "Upper", value: "Italian nappa calf leather, 1.4mm" },
      { label: "Sole", value: "Margom vulcanized natural rubber" },
      { label: "Lining", value: "Vegetable-tanned calf leather" },
      { label: "Laces", value: "Waxed cotton" },
    ],
    craftsmanship:
      "Blake-stitched in a family-run factory in northern Portugal. Each pair is hand-lasted over a wooden form, then finished with a hand-burnished edge. The Margom sole is the same used by the world's most respected sneaker brands.",
    care: "Wipe clean with a damp cloth. Use a leather conditioner every 2-3 months. Stuff with paper when not worn to maintain shape. Replace laces annually.",
    origin: "Handcrafted in Porto, Portugal.",
    sustainability:
      "Margom soles are made from FSC-certified natural rubber. Leather is a byproduct of the food industry, tanned without heavy metals in a LWG Gold-rated tannery.",
    fit: "True to size. Take your usual sneaker size. If between sizes, take the smaller for a snug fit (leather will stretch).",
    features: [
      "Italian nappa leather upper",
      "Margom vulcanized rubber sole",
      "Blake-stitched construction",
      "Vegetable-tanned leather lining",
      "Removable leather footbed",
      "Hand-burnished edges",
    ],
    sku: "ME-FS-COU-010",
    inStock: 28,
  },
  {
    id: "p11",
    name: "Stiletto Suede Pumps",
    brand: "MAISON ÉLÉGANCE",
    category: "Footwear",
    subcategory: "Heels",
    price: 385,
    currency: "USD",
    rating: 4.7,
    reviewCount: 89,
    images: [img.heels1, img.heels2, img.editorial2, img.hero2],
    colors: [
      { name: "Nude", hex: "#f3d9c1" },
      { name: "Black", hex: "#0d0d0d" },
      { name: "Bordeaux", hex: "#5e1f1f" },
    ],
    sizes: ["XS", "S", "M", "L"],
    description:
      "The defining pump, reimagined. Cut from Italian silk suede with a sculptural 90mm stiletto in polished steel, the Stiletto pump balances the architecture of a sharp point with the comfort of a padded leather insole. A hidden platform in the forefoot distributes weight for an unexpectedly wearable feel.",
    shortDescription:
      "Italian silk suede stiletto pumps, 90mm with hidden platform.",
    materials: [
      { label: "Upper", value: "100% Silk suede (Italian)" },
      { label: "Heel", value: "Polished stainless steel, 90mm" },
      { label: "Lining", value: "Vegetable-tanned calf leather" },
      { label: "Sole", value: "Leather, hand-stained" },
    ],
    craftsmanship:
      "Hand-lasted in a family workshop in Vigevano, Italy. The pointed toe is hand-shaped over a wooden last, and the heel is attached with a steel pin sunk 18mm into the heel breast. The suede is brushed by hand to a uniform nap.",
    care: "Brush suede regularly with a brass suede brush. Protect with a suede spray before first wear. Avoid water. Store with shoe trees.",
    origin: "Handcrafted in Vigevano, Italy.",
    sustainability:
      "Silk suede is a byproduct of textile production, minimizing waste. LWG Gold-rated tannery. Vegetable-tanned lining.",
    fit: "Pointed-toe silhouette — if between sizes, take the larger. Model is 175cm wearing size 37EU. Heel height: 90mm with 8mm hidden platform.",
    features: [
      "90mm stiletto heel",
      "Hidden 8mm platform",
      "Italian silk suede upper",
      "Padded leather insole",
      "Pointed toe silhouette",
      "Leather sole, hand-stained",
    ],
    sku: "ME-FH-STI-011",
    inStock: 22,
  },
  {
    id: "p12",
    name: "Acetate Polarized Sunglasses",
    brand: "MAISON ÉLÉGANCE",
    category: "Accessories",
    subcategory: "Eyewear",
    price: 215,
    currency: "USD",
    rating: 4.8,
    reviewCount: 167,
    images: [img.sunglasses1, img.sunglasses2, img.editorial1, img.hero1],
    colors: [
      { name: "Tortoise", hex: "#7d4f1a" },
      { name: "Black", hex: "#0d0d0d" },
      { name: "Crystal", hex: "#e8e6e1" },
    ],
    sizes: ["ONE SIZE"],
    badge: "New",
    description:
      "Hand-polished Italian acetate frames with CR-39 polarized lenses — the gold standard for optical clarity. The classic keyhole bridge and refined temple design draw from mid-century Italian cinema. Each frame is hand-polished for 72 hours to achieve the depth and luster that defines true acetate eyewear.",
    shortDescription:
      "Italian acetate frames with CR-39 polarized lenses, hand-polished.",
    materials: [
      { label: "Frame", value: "Mazzucchelli Italian acetate, 6mm" },
      { label: "Lenses", value: "CR-39 polarized, 100% UVA/UVB" },
      { label: "Hinges", value: "5-barrel stainless steel, oiled" },
    ],
    craftsmanship:
      "Cut from a single block of Mazzucchelli acetate and hand-polished for 72 hours with vegetable tallow. The temple cores are embedded steel wire for adjustment. Each frame passes through 60+ hand operations.",
    care: "Clean with the included microfiber cloth and lens spray. Store in the case when not worn. Avoid leaving in hot cars — acetate can warp above 80°C.",
    origin: "Handcrafted in Cadore, Italy — the heart of Italian eyewear.",
    sustainability:
      "Acetate is derived from cotton and wood pulp — a bio-based plastic. Lenses are made in a closed-loop water recycling facility.",
    fit: "Universal fit. Lens width: 50mm. Bridge: 22mm. Temple: 145mm.",
    features: [
      "Mazzucchelli Italian acetate",
      "CR-39 polarized lenses",
      "100% UVA/UVB protection",
      "72-hour hand-polish",
      "Adjustable steel temple cores",
      "5-barrel stainless steel hinges",
    ],
    sku: "ME-AE-ACE-012",
    inStock: 35,
  },
];

export const getProductById = (id: string) =>
  products.find((p) => p.id === id);

export const categories = [
  "All",
  "Women",
  "Men",
  "Outerwear",
  "Footwear",
  "Accessories",
] as const;

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
] as const;
