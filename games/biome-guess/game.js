const IMAGE_BASE = "../../Photos/Biomes/";

const BIOME_DETAILS = [
  {
    name: "Xeric Hammock",
    image: "Xeric Hammock.png",
    description:
      "On the dry, ancient dunes where fire has been kept at bay, a shady forest of sand live oaks establishes a “green silence.” The closed canopy creates a cool, leaf-littered refuge that holds moisture in the soil, offering a respite from the “bone-dry” heat of the surrounding scrub.",
    whereHtml:
      "Explore the oak domes within the Citrus Tract of the <a href=\"https://www.floridastateparks.org/parks-and-trails/withlacoochee-state-forest\">Withlacoochee State Forest</a> to the north, or the ridges of <a href=\"https://www.floridastateparks.org/parks-and-trails/highlands-hammock-state-park\">Highlands Hammock State Park</a> to the east."
  },
  {
    name: "Wet Prairie",
    image: "Wet Prairie.png",
    description:
      "This is an open, sun-filled expanse where the pines thin out and the ground remains soggy, though rarely flooded. It is a landscape of intense diversity, where carnivorous pitcher plants and orchids thrive in the nutrient-poor, fire-swept soil, waiting for the “pulse” of the rainy season.",
    whereHtml:
      "Witness the sheet flow across the landscape at <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a> or the vast flats of <a href=\"https://www.floridastateparks.org/parks-and-trails/kissimmee-prairie-preserve-state-park\">Kissimmee Prairie Preserve State Park</a>."
  },
  {
    name: "Wet Flatwoods",
    image: "Wet Flatwoods.png",
    description:
      "A pine forest with wet feet, where the water table sits just below the surface, supporting a canopy of slash or pond pine. Here, the vegetation must tolerate both the soak of the wet season and the scorch of the dry, fostering a rich groundcover of wiregrass and fetterbush.",
    whereHtml:
      "Wander the pine islands at <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a> or the <a href=\"https://www.pascocountyfl.net/parksrec/page/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a> to the north."
  },
  {
    name: "Upland Pine",
    image: "Upland Pine.png",
    description:
      "On the rolling red-clay hills, widely spaced longleaf pines stand over a diverse carpet of wiregrass and wildflowers. This high ground is maintained by the regular “cleansing” of fire, which prevents hardwoods from choking out the light and maintains the open savanna.",
    whereHtml:
      "This community is rare this far south; travel north to the <a href=\"https://www.floridastateparks.org/parks-and-trails/withlacoochee-state-forest\">Withlacoochee State Forest</a> or the <a href=\"https://www.fdacs.gov/Forest-Wildfire/Our-Forests/State-Forests/Goethe-State-Forest\">Goethe State Forest</a> to walk these clay-hill cathedrals."
  },
  {
    name: "Upland Mixed Woodland",
    image: "Upland Mixed Woodland.png",
    description:
      "A sun-dappled woodland where longleaf pines and southern red oaks share the canopy in an open, park-like setting. It is a landscape of balance, maintained by frequent fires that keep the understory clear and allow the grasses and legumes to flourish in the transition between hill and hammock.",
    whereHtml:
      "Visit the ecotones between sandhills and hardwoods at <a href=\"https://www.floridastateparks.org/parks-and-trails/san-felasco-hammock-preserve-state-park\">San Felasco Hammock Preserve State Park</a> (north of the region) for the best example of this transitional landscape."
  },
  {
    name: "Upland Hardwood Forest",
    image: "Upland Hardwood.png",
    description:
      "A stately, closed-canopy forest where diverse hardwoods like southern magnolia and pignut hickory create deep shade and rich leaf litter. Protected from fire, the trees grow tall in the fertile soil, creating a cool, mesic environment that feels older and more permanent than the shifting pine lands.",
    whereHtml:
      "Walk the shaded trails of the <a href=\"https://www.floridastateparks.org/parks-and-trails/withlacoochee-state-forest\">Withlacoochee State Forest</a> to experience this climax community."
  },
  {
    name: "Shell Mound",
    image: "Shell Mound.png",
    description:
      "These hills are the echoes of ancient civilizations, built entirely of discarded shells that now support a unique forest of calcium-loving plants. Rising from the coast, they offer a tropical refuge on a substrate created by human hands centuries ago.",
    whereHtml:
      "Climb the ancient refuse of history at the <a href=\"https://www.floridastateparks.org/parks-and-trails/madira-bickel-mound-state-archaeological-site\">Madira Bickel Mound State Archaeological Site</a> overlooking Terra Ceia Bay."
  },
  {
    name: "Scrubby Flatwoods",
    image: "Scrubby Flatwoods.png",
    description:
      "A tension zone between the moist flatwoods and the dry scrub, where scattered pines stand over a thicket of scrub oaks and saw palmetto. Here, the plants must tolerate both the wet and the dry, existing on the sandy rises of the flatlands.",
    whereHtml:
      "Explore the transition zones at the <a href=\"https://www.pascocountyfl.net/parksrec/page/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a> or the <a href=\"https://www.hillsboroughcounty.org/en/locations/balm-boyette-scrub-preserve\">Balm-Boyette Scrub Preserve</a> in Hillsborough County."
  },
  {
    name: "Scrub",
    image: "Scrub Final.png",
    description:
      "On these ancient, bone-dry dunes, life is stunted and twisted by the scarcity of water and nutrients. It is a harsh, “elfin” forest of scrub oaks and Florida rosemary that endures long periods of silence before being renewed by intense, stand-replacing fire.",
    whereHtml:
      "See the ancient sand dunes at the <a href=\"https://www.hillsboroughcounty.org/en/locations/balm-boyette-scrub-preserve\">Balm-Boyette Scrub Preserve</a>, the <a href=\"https://www.pascocountyfl.net/parksrec/page/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a>, or the <a href=\"https://www.floridastateparks.org/parks-and-trails/cedar-key-scrub-state-reserve\">Cedar Key Scrub State Reserve</a> to the north."
  },
  {
    name: "Sandhill",
    image: "Sandhill Final.png",
    description:
      "Rolling hills of deep, ancient sand support widely spaced longleaf pines and turkey oaks. It is a sun-washed savanna kept open by frequent fire, where the wiregrass holds the sugar-sand in place.",
    whereHtml:
      "Visit the rolling high ground of the Citrus Tract in the <a href=\"https://www.floridastateparks.org/parks-and-trails/withlacoochee-state-forest\">Withlacoochee State Forest</a> to see the longleaf pines standing over wiregrass."
  },
  {
    name: "Salt Marsh",
    image: "Salt Marsh.png",
    description:
      "A vast, open expanse of cordgrass and needle rush that drinks the tide twice a day. This is the “liquid land” where the boundary between earth and ocean dissolves, fueling the estuary with the energy of decomposition.",
    whereHtml:
      "While much was lost to development, fringes remain along <a href=\"https://myfwc.com/research/habitat/coastal-wetlands/salt-marsh/\">Tampa Bay</a>, or visit the vast expanses at the <a href=\"https://www.fws.gov/refuge/lower-suwannee\">Lower Suwannee National Wildlife Refuge</a> to the north."
  },
  {
    name: "Pine Rockland",
    image: "Pine Rockland.png",
    description:
      "A jagged, rocky terrain where South Florida slash pines root directly into the eroded limestone. This is a fire-dependent garden of tropical shrubs and wildflowers, thriving on the sun-baked rock where few other forests could survive.",
    whereHtml:
      "You will not find this rock-bound forest near Tampa; you must travel south to <a href=\"https://www.nps.gov/ever/planyourvisit/long-pine-key.htm\">Long Pine Key</a> in the Everglades or <a href=\"https://www.floridastateparks.org/parks-and-trails/bahia-honda-state-park\">Big Pine Key</a> to see the slash pines rooting in limestone."
  },
  {
    name: "Mesic Hammock",
    image: "Mesic Hammock.png",
    description:
      "Islands of cool shade in a landscape of sun, these forests of live oak and cabbage palm develop where fire cannot reach. The dense canopy retains moisture, creating a stable, evergreen sanctuary for ferns and air plants.",
    whereHtml:
      "Walk beneath the closed canopy at <a href=\"https://www.floridastateparks.org/parks-and-trails/highlands-hammock-state-park\">Highlands Hammock State Park</a> to the east or the <a href=\"https://www.fdacs.gov/Forest-Wildfire/Our-Forests/State-Forests/Little-Big-Econ-State-Forest\">Little Big Econ State Forest</a>."
  },
  {
    name: "Mesic Flatwoods",
    image: "Mesic Flatwoods.png",
    description:
      "The quintessential Florida landscape, where tall pines cast long shadows over a floor of saw palmetto and wiregrass. It is a system built on fire; without the cleansing flames, the open, sun-drenched diversity would be lost to the shadows of encroaching hardwoods.",
    whereHtml:
      "Wander the open pine savannas of the <a href=\"https://www.pascocountyfl.net/parksrec/page/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a> or <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a>."
  },
  {
    name: "Maritime Hammock",
    image: "Maritime Hammock Final.png",
    description:
      "On old, stabilized dunes protected from the immediate salt spray, a canopy of live oak and cabbage palm creates a cool, shady refuge. This forest is sculpted by the wind, its low profile a testament to the shaping power of the sea breeze.",
    whereHtml:
      "Accessible only by boat, the wind-pruned trees of <a href=\"https://www.floridastateparks.org/parks-and-trails/cayo-costa-state-park\">Cayo Costa State Park</a> or <a href=\"https://www.floridastateparks.org/parks-and-trails/anclote-key-preserve-state-park\">Anclote Key Preserve State Park</a> guard the barrier islands."
  },
  {
    name: "Mangrove Swamp",
    image: "Mangrove Swamp Final.png",
    description:
      "A “walking forest” that straddles the boundary between land and sea, trapping sediments in a tangle of prop roots. It is a quiet, horizontal world where falling leaves fuel a rich aquatic soup, protecting the coast by absorbing the energy of the tides.",
    whereHtml:
      "Paddle through the “walking trees” at <a href=\"https://www.floridastateparks.org/parks-and-trails/charlotte-harbor-preserve-state-park\">Charlotte Harbor Preserve State Park</a> to the south or along the protected fringes of <a href=\"https://myfwc.com/research/habitat/coastal-wetlands/mangroves/\">Tampa Bay</a>."
  },
  {
    name: "Hydric Hammock",
    image: "Hydric Hammock.png",
    description:
      "A shady, humid forest of oaks and cabbage palms where the limestone lies just beneath the surface. It occupies the wet margins, surviving occasional floods and protecting the interior with a dense, evergreen canopy that rarely burns.",
    whereHtml:
      "Experience this wet forest along the <a href=\"https://www.sfwmd.gov/our-work/lower-hillsborough\">Lower Hillsborough River Flood Detention Area</a> or at <a href=\"https://www.floridastateparks.org/parks-and-trails/waccasassa-bay-preserve-state-park\">Waccasassa Bay Preserve State Park</a>."
  },
  {
    name: "Floodplain Swamp",
    image: "Floodplain Swamp.png",
    description:
      "In the dark, flooded backwaters of the river, buttressed cypress and tupelo trees stand in the tea-colored current. This is a water-bound forest that thrives on the nutrient pulse of the flood, a slow-moving filter for the river system.",
    whereHtml:
      "Drift through the dark waters of the <a href=\"https://www.floridastateparks.org/learn/withlacoochee-river\">Withlacoochee River</a> to see the buttressed cypress knees."
  },
  {
    name: "Floodplain Marsh",
    image: "Floodplain Marsh.png",
    description:
      "Along the river’s edge, the forest gives way to open ribbons of sawgrass and cordgrass that rise and fall with the flowing water. These marshes are the river’s breathing room, absorbing the floods and offering a rich, shifting mosaic of habitat for wading birds.",
    whereHtml:
      "Watch the river of grass expand at <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a>."
  },
  {
    name: "Dry Prairie",
    image: "Dry Prairie.png",
    description:
      "A vast, sweeping horizon of wiregrass and saw palmetto where the sky touches the earth without interruption. It is a landscape maintained by the twin forces of fire and flood, too wet for pines but too dry for the marsh, existing in a perpetual state of renewal.",
    whereHtml:
      "The vast, treeless horizons of <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a> offer one of the last glimpses of this sweeping landscape."
  },
  {
    name: "Dome Swamp",
    image: "Dome Swamp.png",
    description:
      "A circular cathedral of cypress trees, growing taller toward the center where the peat is deep and the water still. It is a reservoir for the landscape, surviving on the delicate balance between the flood that feeds it and the fire that keeps it open.",
    whereHtml:
      "Look for these cypress circles in the flatwoods of the <a href=\"https://www.floridastateparks.org/parks-and-trails/withlacoochee-state-forest\">Withlacoochee State Forest</a> or <a href=\"https://myfwc.com/recreation/lead/three-lakes/\">Three Lakes Wildlife Management Area</a>."
  },
  {
    name: "Depression Marsh",
    image: "Depression Marsh.png",
    description:
      "A small, rounded window into the water table, where concentric rings of grasses mark the slow retreat of the water. These shallow ephemeral ponds are the “gator holes” of the flatwoods, fostering a burst of aquatic life before drying down to wait for the rain.",
    whereHtml:
      "Visit <a href=\"https://archbold-station.org/\">Archbold Biological Station</a> to the southeast to see these ephemeral ponds dotting the scrub."
  },
  {
    name: "Coastal Strand",
    image: "Coastal Strand.png",
    description:
      "Smoothed by the salt spray, this community of tough shrubs acts as a living windbreak along the coast. It survives by bending to the breeze, a dense, evergreen buffer protecting the interior from the sea’s breath.",
    whereHtml:
      "Walk the dunes of <a href=\"https://www.floridastateparks.org/parks-and-trails/cayo-costa-state-park\">Cayo Costa State Park</a> to see where the saw palmetto meets the sea."
  },
  {
    name: "Coastal Berm",
    image: "Coastal Berm.png",
    description:
      "A ridge of loose shell and debris cast up by the violence of storms, now a quiet refuge for tropical shrubs. It is a testament to the ocean’s power to create new land, offering a foothold for life just above the reach of the tides.",
    whereHtml:
      "Explore the shell ridges at <a href=\"https://www.floridastateparks.org/parks-and-trails/cayo-costa-state-park\">Cayo Costa State Park</a> or the <a href=\"https://www.fws.gov/refuge/ten_thousand_islands\">Ten Thousand Islands National Wildlife Refuge</a> to the south."
  },
  {
    name: "Bottomland Forest",
    image: "Bottomland Forest.png",
    description:
      "Situated on the high terraces of the floodplain, this forest exists in the lull between the river’s floods. It is a place of transition, where the water recedes enough for a diversity of oaks and pines to stand tall in the rich, alluvial soil.",
    whereHtml:
      "Wander the high terraces of the river at <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a>."
  }
];

const BIOMES = BIOME_DETAILS.map((biome) => ({
  name: biome.name,
  image: `${IMAGE_BASE}${biome.image}`
}));

const BIOME_INFO = BIOME_DETAILS.reduce((acc, biome) => {
  acc[biome.name] = {
    ...biome,
    image: `${IMAGE_BASE}${biome.image}`
  };
  return acc;
}, {});

const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const biomeImage = document.getElementById("biome-image");
const nameChoicesEl = document.getElementById("name-choices");
const feedback = document.getElementById("feedback");
const nameFeedbackEl = document.getElementById("name-feedback");
const nameStepTitle = document.getElementById("name-step-title");
const nameStep = document.getElementById("step-name");
const nextWrap = document.querySelector(".next-wrap");
const biomeInfoEl = document.getElementById("biome-info");
const biomeInfoTitle = document.getElementById("biome-info-title");
const biomeInfoDescription = document.getElementById("biome-info-description");
const biomeInfoWhere = document.getElementById("biome-info-where");

let nameChoices = [];
let correctBiome = null;
let selectedName = null;
let gameActive = false;
let inputLocked = false;
let roundEvaluated = false;
let nameFeedback = "";
let nameCorrectThisRound = false;
let biomeOrder = [];
let currentBiomeIndex = 0;

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const setFeedback = (message) => {
  feedback.textContent = message;
};

const setNameFeedback = (message) => {
  nameFeedback = message;
  nameFeedbackEl.textContent = nameFeedback;
};

const hideBiomeInfo = () => {
  biomeInfoEl.classList.add("is-hidden");
  biomeInfoTitle.textContent = "";
  biomeInfoDescription.textContent = "";
  biomeInfoWhere.innerHTML = "";
};

const showBiomeInfo = () => {
  if (!correctBiome) {
    hideBiomeInfo();
    return;
  }
  const info = BIOME_INFO[correctBiome.name];
  if (!info) {
    hideBiomeInfo();
    return;
  }
  biomeInfoTitle.textContent = info.name;
  biomeInfoDescription.textContent = info.description;
  biomeInfoWhere.innerHTML = `<strong>Where to see it:</strong> ${info.whereHtml}`;
  biomeInfoEl.classList.remove("is-hidden");
};

const updateNameButtons = () => {
  const buttons = Array.from(nameChoicesEl.querySelectorAll("button"));
  buttons.forEach((button, index) => {
    const biome = nameChoices[index];
    const isSelected = selectedName && biome && selectedName.name === biome.name;
    button.classList.toggle("is-selected", Boolean(isSelected));
    if (roundEvaluated) {
      button.disabled = !isSelected;
    }
  });
};

const renderNameChoices = () => {
  nameChoicesEl.innerHTML = "";
  nameChoices.forEach((biome, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = biome.name;
    button.addEventListener("click", () => selectName(index));
    nameChoicesEl.appendChild(button);
  });
  updateNameButtons();
};

const pickDistractors = (biome, count) => {
  const candidates = BIOMES.filter((option) => option.name !== biome.name);
  return shuffle(candidates).slice(0, count);
};

const startRound = () => {
  if (BIOMES.length < 4) {
    setFeedback("Add at least 4 biomes to play.");
    return;
  }

  inputLocked = false;
  roundEvaluated = false;
  selectedName = null;
  nameCorrectThisRound = false;
  setFeedback("");
  setNameFeedback("");
  hideBiomeInfo();
  nextButton.disabled = true;

  if (biomeOrder.length === 0 || currentBiomeIndex >= biomeOrder.length) {
    biomeOrder = shuffle(BIOMES);
    currentBiomeIndex = 0;
  }

  correctBiome = biomeOrder[currentBiomeIndex];
  nameChoices = shuffle([correctBiome, ...pickDistractors(correctBiome, 3)]);

  biomeImage.src = correctBiome.image;
  biomeImage.alt = correctBiome.name;

  renderNameChoices();
};

const evaluateRound = () => {
  if (!selectedName || !correctBiome) {
    return;
  }

  roundEvaluated = true;
  inputLocked = true;
  nextButton.disabled = false;
  setFeedback("");
  showBiomeInfo();
};

const selectName = (index) => {
  if (!gameActive || inputLocked || roundEvaluated) {
    return;
  }

  const chosen = nameChoices[index];
  if (!chosen) {
    return;
  }

  selectedName = chosen;
  nameCorrectThisRound = selectedName.name === correctBiome.name;
  if (nameCorrectThisRound) {
    setNameFeedback(`Correct — ${correctBiome.name}`);
  } else {
    setNameFeedback(`Wrong — correct name: ${correctBiome.name}`);
  }
  updateNameButtons();
  evaluateRound();
};

startButton.addEventListener("click", () => {
  if (gameActive) {
    return;
  }
  gameActive = true;
  nameStep.classList.remove("is-hidden");
  nextWrap.classList.remove("is-hidden");
  startButton.disabled = true;
  startButton.textContent = "Playing";
  biomeOrder = shuffle(BIOMES);
  currentBiomeIndex = 0;
  startRound();
});

nextButton.addEventListener("click", () => {
  if (!gameActive || !roundEvaluated) {
    return;
  }
  if (currentBiomeIndex + 1 >= biomeOrder.length) {
    biomeOrder = shuffle(BIOMES);
    currentBiomeIndex = 0;
  } else {
    currentBiomeIndex += 1;
  }
  startRound();
});

window.addEventListener("keydown", (event) => {
  if (!gameActive || inputLocked) {
    return;
  }
  const index = Number.parseInt(event.key, 10) - 1;
  if (!Number.isInteger(index) || index < 0 || index > 3) {
    return;
  }

  if (!roundEvaluated) {
    selectName(index);
  }
});

nameStepTitle.textContent = "Step 1: Select the biome name.";
