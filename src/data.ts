import { Plant, QuizQuestion } from "./types";

export const PRELOADED_PLANTS: Plant[] = [
  {
    id: "tomato",
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    description: "A garden staple and one of the most rewarding crops to grow. Tomatoes thrive in warm weather and can produce abundant fruits throughout the summer when properly staked and supported.",
    sunlight: "High",
    water: "Medium",
    difficulty: "Medium",
    soil: "Rich, well-draining loamy soil with a slightly acidic pH (6.2 - 6.8).",
    category: "vegetable",
    instructions: [
      "Step 1: Plant tomato seedlings deep in the soil, up to their first set of true leaves, to encourage strong root development.",
      "Step 2: Install a stake, cage, or trellis immediately to support the heavy branches as they grow.",
      "Step 3: Water deeply at the base of the plant once or twice a week, keeping the foliage dry to prevent fungal diseases.",
      "Step 4: Pinch off 'suckers' (tiny shoots growing in the crotch between the main stem and branches) to direct energy into fruit production."
    ],
    funFact: "Botanically speaking, tomatoes are fruits, but they were legally declared vegetables by the US Supreme Court in 1893 for tariff purposes!",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "strawberry",
    name: "Strawberry",
    scientificName: "Fragaria x ananassa",
    description: "Sweet, juicy, and highly decorative, strawberries are perfect for garden beds, hanging baskets, or patio containers. They return year after year as perennials, rewarding you with fresh spring berries.",
    sunlight: "High",
    water: "Medium",
    difficulty: "Medium",
    soil: "Rich, sandy-loam, well-drained soil rich in organic matter.",
    category: "fruit",
    instructions: [
      "Step 1: Plant strawberries so the central 'crown' sits right at the soil surface. Planting too deep rots the crown, and too shallow dries it out.",
      "Step 2: Mulch around the plants with straw or pine needles to keep the berries off the damp soil, suppressing weeds and retaining moisture.",
      "Step 3: Water consistently, providing about 1 inch of water per week, especially during fruit development.",
      "Step 4: Snip off runners (creeping stems) during the first year to force the mother plant to focus on building a strong root system."
    ],
    funFact: "Strawberries are the only fruit that wear their seeds on the outside—about 200 of them on an average berry!",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "carrot",
    name: "Carrot",
    scientificName: "Daucus carota subsp. sativus",
    description: "An excellent cool-season root vegetable that is fun to harvest. Growing carrots from seeds teaches patience, and pulling them fresh from loose soil is one of gardening's greatest simple pleasures.",
    sunlight: "High",
    water: "Medium",
    difficulty: "Easy",
    soil: "Deep, stone-free, extremely loose, sandy soil that allows the taproot to grow straight down.",
    category: "vegetable",
    instructions: [
      "Step 1: Sow seeds directly into the garden (do not transplant) about 1/4 inch deep. Keep the soil constantly damp during the 2-week germination.",
      "Step 2: Once seedlings are 2 inches tall, thin them out so plants are spaced 2 to 3 inches apart. Otherwise, they will twist and tangle.",
      "Step 3: Water regularly but deeply. Shallow watering results in short, hairy, stunted carrots.",
      "Step 4: Harvest when the top of the carrot crown reaches about 1/2 to 1 inch in diameter and is visible protruding slightly from the soil."
    ],
    funFact: "The first cultivated carrots weren't orange—they were purple and yellow! Orange carrots were bred by Dutch growers in the 17th century.",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "mint",
    name: "Mint",
    scientificName: "Mentha",
    description: "A fast-growing, incredibly aromatic herb that is virtually indestructible. Known for its refreshing scent, mint is fantastic for teas, cocktails, and culinary garnishes, but its aggressive growth needs management.",
    sunlight: "Medium",
    water: "Medium",
    difficulty: "Easy",
    soil: "Moist, fertile, well-drained soil. Tolerates light shade well.",
    category: "herb",
    instructions: [
      "Step 1: ALWAYS plant mint in a container or pot, even if you sink that pot into the ground. If planted freely, it will take over your garden.",
      "Step 2: Keep the soil consistently damp. Mint loves moisture but should not sit in stagnant, muddy water.",
      "Step 3: Harvest leaves regularly by pinching the tips. This encourages the plant to bush out instead of growing tall and leggy.",
      "Step 4: Cut the entire plant back to the ground in late autumn to encourage a fresh, dense crop in the spring."
    ],
    funFact: "Mint has been found in Egyptian tombs dating back to 1000 BC, demonstrating its long, valued history in herbal medicine.",
    image: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "basil",
    name: "Basil",
    scientificName: "Ocimum basilicum",
    description: "The undisputed king of summer herbs. Basil is highly aromatic, warm-loving, and pairs beautifully with fresh tomatoes. It grows incredibly fast in sunny windowsills or warm garden beds.",
    sunlight: "High",
    water: "Medium",
    difficulty: "Easy",
    soil: "Moist, nutrient-rich, well-draining soil with good compost integration.",
    category: "herb",
    instructions: [
      "Step 1: Plant in a warm, sheltered spot that receives at least 6 to 8 hours of direct, baking sunlight daily.",
      "Step 2: Water at the root level early in the morning. Basil leaves are sensitive to cold water and damp night air.",
      "Step 3: Prune the central stems once the plant is 6 inches tall, cutting just above a leaf node. This doubles the stems and doubles your yield!",
      "Step 4: Pinch off any flowering spikes immediately. Once basil flowers, the leaves become bitter and lose their rich aromatic oils."
    ],
    funFact: "In ancient Greece, basil was associated with royalty (basileus means king), and in Italy, presenting a sprig of basil was a traditional symbol of love.",
    image: "https://images.unsplash.com/photo-1618375511414-4fb394cc576f?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "spinach",
    name: "Spinach",
    scientificName: "Spinacia oleracea",
    description: "A superfood vegetable that loves the crisp air of spring and autumn. Extremely fast-growing, it can be harvested repeatedly as a 'cut-and-come-again' leaf crop.",
    sunlight: "Medium",
    water: "Medium",
    difficulty: "Easy",
    soil: "Rich, moist, nitrogen-heavy soil that retains moisture well.",
    category: "vegetable",
    instructions: [
      "Step 1: Sow seeds directly outdoors 4 to 6 weeks before the last spring frost. Spinach loves cool air and dislikes hot summer sun.",
      "Step 2: Thin seedlings to 3-4 inches apart once they have several leaves to ensure good airflow and large, healthy heads.",
      "Step 3: Keep the soil consistently moist. Drought stress triggers 'bolting' (flowering and setting seed), which makes the leaves tough and bitter.",
      "Step 4: Harvest by snipping the outer leaves first, allowing the inner, younger leaves to continue growing for a continuous harvest."
    ],
    funFact: "In the 1930s, the cartoon character Popeye was credited with boosting US spinach consumption by a whopping 33%!",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600"
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What do the three numbers on a fertilizer bag (e.g., 10-20-10) stand for?",
    options: [
      "Nitrogen, Phosphorus, Potassium (N-P-K ratio)",
      "Nickel, Phosphorus, Krypton compound",
      "Sodium, Potassium, Calcium minerals",
      "Nitrogen, Phosphate, Carbon organic solids"
    ],
    correctIndex: 0,
    explanation: "NPK stands for Nitrogen (for leafy green growth), Phosphorus (for healthy roots and flower/fruit development), and Potassium (for general plant vigor and disease resistance)."
  },
  {
    id: 2,
    question: "Most home-grown vegetables grow best in soil with which pH range?",
    options: [
      "Highly acidic (3.0 - 4.5)",
      "Slightly acidic to neutral (6.0 - 7.0)",
      "Highly alkaline (8.5 - 10.0)",
      "Strictly pure neutral (exactly 7.0)"
    ],
    correctIndex: 1,
    explanation: "A slightly acidic to neutral pH (6.0 to 7.0) is ideal because key plant nutrients are highly soluble and easily absorbed by root systems in this specific range."
  },
  {
    id: 3,
    question: "What is the most reliable way to check if a potted plant needs watering?",
    options: [
      "Watering it on a strict, automated daily schedule",
      "Checking if the top 1-2 inches of soil feel dry to the touch",
      "Waiting until the leaves turn completely yellow and wilt",
      "Watering only when the soil begins to crack and pull away"
    ],
    correctIndex: 1,
    explanation: "Inserting your finger 1-2 inches into the soil is the golden rule. Rigid calendar schedules lead to overwatering, while wilting signifies dangerous cellular drought."
  },
  {
    id: 4,
    question: "What is the primary cause of 'root rot' in container plants?",
    options: [
      "Insufficient direct sunlight",
      "Overwatering coupled with poor container drainage",
      "Microscopic insects eating root hairs",
      "Watering with cold tap water instead of rainwater"
    ],
    correctIndex: 1,
    explanation: "Saturated, waterlogged soil fills the air pockets. Deprived of oxygen, root cells die and rot, preventing them from absorbing water and leading, paradoxically, to a wilting plant."
  },
  {
    id: 5,
    question: "Which of the following organic materials should NOT be added to a home compost pile?",
    options: [
      "Crushed eggshells and raw vegetable scraps",
      "Used coffee grounds and unbleached paper filters",
      "Meat, grease, bones, or dairy leftovers",
      "Dry autumn leaves and clean grass clippings"
    ],
    correctIndex: 2,
    explanation: "Meat, grease, and dairy decompose slowly, create terrible odors, and attract pests like rodents. Stick to green (nitrogen-rich) and brown (carbon-rich) plant matter."
  },
  {
    id: 6,
    question: "Why do experienced gardeners often plant Marigolds alongside Tomatoes?",
    options: [
      "Marigolds shade the soil surface to keep tomato roots cool",
      "Their scent and root compounds repel insect pests and nematodes",
      "They absorb excess heavy metals from the soil",
      "Their flowers attract unique bees that make tomato fruit sweeter"
    ],
    correctIndex: 1,
    explanation: "Marigolds are famous companion plants. Their roots exude toxic compounds that repel harmful nematodes, and their scented foliage repels beetles, hornworms, and whiteflies."
  },
  {
    id: 7,
    question: "What three critical factors do almost all seeds need to initiate germination?",
    options: [
      "Fertilizer, deep darkness, and pruning",
      "Oxygen, moisture (water), and appropriate temperature",
      "Direct baking sunlight, clay soil, and high nitrogen",
      "Compost, heavy air currents, and altitude"
    ],
    correctIndex: 1,
    explanation: "Seeds need moisture to swell and split their coats, oxygen to kickstart cellular respiration, and the right warmth (temperature) to activate growth enzymes. Light is only needed after leaves emerge."
  },
  {
    id: 8,
    question: "Which soil texture holds moisture and nutrients the longest but is hardest to work when dry?",
    options: [
      "Sandy soil",
      "Silty soil",
      "Clay soil",
      "Loamy soil"
    ],
    correctIndex: 2,
    explanation: "Clay soil has tiny, closely-packed plate-like particles. It holds onto water and minerals incredibly well, but it drains very slowly and bakes into rock-hard bricks when dried."
  }
];
