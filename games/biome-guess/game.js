const IMAGE_BASE = "/assets/images/biomes/";

const BIOME_DETAILS = [
  {
    name: "Xeric Hammock",
    image: "Xeric-Hammock.png",
    description:
      "On ancient dunes where fire has been forgotten, sand live oaks weave a closed canopy that locks in moisture and silence. The deep leaf litter creates a cool refuge from the surrounding heat, a place where the soil slowly builds itself up from the decay of the canopy.",
    whereHtml:
      "The shaded oak domes of <a href=\"https://hcfl.gov/locations/lithia-springs-park\">Lithia Springs Conservation Park</a> or the high ground at <a href=\"https://www.floridastateparks.org/parks-and-trails/little-manatee-river-state-park\">Little Manatee River State Park</a>."
  },
  {
    name: "Wet Prairie",
    image: "Wet-Prairie.png",
    description:
      "These sun-filled expanses exist in the delicate balance between the flood and the drought, where the ground remains soggy but rarely drowns. It is a shifting garden of wiregrass and wildflowers that waits for the water to recede to bloom, supporting a diversity that rivals the tropical forests.",
    whereHtml:
      "The vast, open flats of <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a> or the soggy margins at <a href=\"https://www.swfwmd.state.fl.us/recreation/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a>."
  },
  {
    name: "Wet Flatwoods",
    image: "Wet-Flatwoods.png",
    description:
      "A pine forest with wet feet, where the water table hovers just below the surface to support a canopy of slash or pond pine. This landscape is shaped by the tension between the soak of the summer rains and the scorch of the dry season fire.",
    whereHtml:
      "The low pine islands of <a href=\"https://www.swfwmd.state.fl.us/recreation/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a> or the hydric pine flatwoods of <a href=\"https://pinellas.gov/parks/brooker-creek-preserve/\">Brooker Creek Preserve</a>."
  },
  {
    name: "Upland Pine",
    image: "Upland-Pine.png",
    description:
      "On rolling hills, widely spaced longleaf pines stand over a diverse carpet of wiregrass, maintained by the frequent cleansing of fire. This is a landscape of light and air, where the canopy remains open to the sky.",
    whereHtml:
      "Rare in Tampa; visit the <a href=\"https://floridabirdingtrail.com/site/withlacoochee-state-forest/\">Withlacoochee State Forest (Citrus Tract)</a> to the north to see the rolling clay hills."
  },
  {
    name: "Upland Mixed Woodland",
    image: "Upland-Mixed-Woodland.png",
    description:
      "A transition zone where pines and southern red oaks share the canopy in an open, park-like setting. It is a landscape of balance, where fire keeps the understory clear and allows grasses to flourish between the hill and the hammock.",
    whereHtml:
      "The ecotones of <a href=\"https://floridabirdingtrail.com/site/withlacoochee-state-forest/\">Withlacoochee State Forest</a> offer the nearest glimpse of this transitional community."
  },
  {
    name: "Upland Hardwood Forest",
    image: "Upland-Hardwood.png",
    description:
      "A stately, closed-canopy forest where hardwoods like magnolia and hickory create deep shade and rich soil. Protected from fire, these trees grow tall and permanent, holding the earth in place with deep roots.",
    whereHtml:
      "The shaded ravines of <a href=\"https://floridabirdingtrail.com/site/withlacoochee-state-forest/\">Withlacoochee State Forest</a>."
  },
  {
    name: "Upland Glade",
    image: "Upland-Glade.png",
    description:
      "Small, grassy openings where the limestone bedrock breaks the surface, creating a harsh, sun-baked environment. These rare patches support delicate herbs that thrive on the calcium-rich rock, existing only where the soil is too thin for trees.",
    whereHtml:
      "This community is found primarily in the Florida Panhandle and is not present in the Tampa Bay area."
  },
  {
    name: "Strand Swamp",
    image: "Strand-Swamp.png",
    description:
      "A linear forest of cypress growing in a limestone trough, where water flows imperceptibly through the shadows. This flowing swamp connects the landscape, acting as a slow-moving river of trees that filters the water before it reaches the coast.",
    whereHtml:
      "The headwaters of the Withlacoochee River in the <a href=\"https://www.swfwmd.state.fl.us/recreation/green-swamp-wilderness-preserve\">Green Swamp</a>."
  },
  {
    name: "Slough Marsh",
    image: "Slough-Marsh.png",
    description:
      "A broad channel of grass moving water slowly through the flat landscape, shifting from dry meadow to flowing wetland with the seasons. It acts as the landscape’s drain, collecting rainfall and guiding it gently toward the river.",
    whereHtml:
      "The grassy drainages within <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a>."
  },
  {
    name: "Slough",
    image: "Slough-Final.png",
    description:
      "The deepest veins of the wetland, where water moves so slowly it seems to stand still, lined by pop ash or pond apple. These open avenues are the lifeblood of the swamp, offering a final refuge for fish and alligators when the surrounding marsh dries to dust.",
    whereHtml:
      "Along the floodplain of the Hillsborough River."
  },
  {
    name: "Slope Forest",
    image: "Slope-Forest.png",
    description:
      "In deep, shaded ravines, cool microclimates allow northern hardwoods to mix with southern evergreens on steep inclines. It is a landscape of steep refuge, preserving biological diversity in the shadows.",
    whereHtml:
      "Restricted to the Apalachicola River region; not found near Tampa."
  },
  {
    name: "Sinkhole",
    image: "Sinkhole-Final.png",
    description:
      "A window into the earth’s aquifer, where the ground has collapsed to reveal a cool, shaded microclimate. These limestone depressions shelter delicate ferns from the drying sun, creating a humid oasis in the forest floor.",
    whereHtml:
      "The karst features within the <a href=\"https://www.swfwmd.state.fl.us/recreation/lower-hillsborough-wilderness-preserve\">Lower Hillsborough Wilderness Preserve</a>."
  },
  {
    name: "Shrub Bog",
    image: "Shrub-Bog.png",
    description:
      "A dense, impenetrable thicket of titi and fetterbush rooted in deep, mucky peat. It is a place of stillness and saturation, where shrubs aggressively reclaim the land in the absence of fire.",
    whereHtml:
      "Rare in this region; look to the <a href=\"https://www.swfwmd.state.fl.us/recreation/green-swamp-wilderness-preserve\">Green Swamp</a> for similar shrub-dominated wetlands."
  },
  {
    name: "Shell Mound",
    image: "Shell-Mound.png",
    description:
      "Hills built by ancient hands from discarded shells, now supporting a unique forest of calcium-loving plants. These anthropogenic ridges rise from the coast, a testament to civilizations that lived in rhythm with the estuary.",
    whereHtml:
      "The ancient mounds at <a href=\"https://www.floridastateparks.org/parks-and-trails/madira-bickel-mound-state-archaeological-site\">Madira Bickel Mound State Archaeological Site</a> or <a href=\"https://www.mymanatee.org/connect/locations/location-details/emerson-point-preserve\">Emerson Point Preserve</a>."
  },
  {
    name: "Seepage Slope",
    image: "Seepage-Slope.png",
    description:
      "On steep hillsides, groundwater trickles to the surface, creating a boggy oasis in the dry uplands. This constant seep supports carnivorous plants that depend on the water’s unceasing flow.",
    whereHtml:
      "Mostly in the Panhandle; rare examples may exist in the <a href=\"https://www.swfwmd.state.fl.us/recreation/green-swamp-wilderness-preserve\">Green Swamp</a>."
  },
  {
    name: "Scrubby Flatwoods",
    image: "Scrubby-Flatwoods.png",
    description:
      "A tension zone between the moist flatwoods and the dry scrub, where scattered pines stand over a thicket of scrub oaks and saw palmetto. Here, plants must tolerate both the wet and the dry, existing on the sandy rises of the flatlands.",
    whereHtml:
      "The sandy ridges of <a href=\"https://www.swfwmd.state.fl.us/recreation/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a> or <a href=\"https://hcfl.gov/locations/balm-boyette-nature-preserve\">Balm-Boyette Scrub</a>."
  },
  {
    name: "Scrub",
    image: "Scrub-Final.png",
    description:
      "On ancient, bone-dry dunes, life is stunted and twisted by the scarcity of water. It is a harsh forest of scrub oaks and rosemary that endures long periods of silence before being renewed by intense fire.",
    whereHtml:
      "The ancient dunes at <a href=\"https://hcfl.gov/locations/golden-aster-scrub-nature-preserve\">Golden Aster Scrub Nature Preserve</a> or <a href=\"https://hcfl.gov/locations/balm-boyette-nature-preserve\">Balm-Boyette Scrub</a>."
  },
  {
    name: "Sandhill",
    image: "Sandhill-Final.png",
    description:
      "Rolling hills of deep sand support widely spaced longleaf pines and turkey oaks. It is a sun-washed savanna kept open by fire, where wiregrass holds the sugar-sand in place.",
    whereHtml:
      "The high ground of <a href=\"https://pinellas.gov/parks/brooker-creek-preserve/\">Brooker Creek Preserve</a> or the <a href=\"https://floridabirdingtrail.com/site/withlacoochee-state-forest/\">Withlacoochee State Forest</a>."
  },
  {
    name: "Salt Marsh",
    image: "Salt-Marsh.png",
    description:
      "A vast expanse of cordgrass and needle rush that drinks the tide twice a day. This is the liquid land where the boundary between earth and ocean dissolves, fueling the estuary with the energy of decay.",
    whereHtml:
      "The tidal fringes of <a href=\"https://hcfl.gov/locations/upper-tampa-bay-conservation-park\">Upper Tampa Bay Park</a> or <a href=\"https://www.floridastateparks.org/parks-and-trails/cockroach-bay-preserve-state-park\">Cockroach Bay Preserve</a>."
  },
  {
    name: "Rockland Hammock",
    image: "Rockland-Hammock.png",
    description:
      "A tropical hardwood forest growing on a thin veneer of soil over limestone rock. Inside, the air is still and humid, a green silence protected from the sun and fire.",
    whereHtml:
      "Found in Miami-Dade and the Keys; not present in Tampa."
  },
  {
    name: "Pine Rockland",
    image: "Pine-Rockland.png",
    description:
      "A jagged, rocky terrain where South Florida slash pines root directly into eroded limestone. This fire-dependent garden thrives on sun-baked rock where few other forests could survive.",
    whereHtml:
      "Restricted to South Florida and the Keys."
  },
  {
    name: "Mesic Hammock",
    image: "Mesic-Hammock.png",
    description:
      "Islands of cool shade in a landscape of sun, these forests of live oak and cabbage palm develop where fire cannot reach. The dense canopy retains moisture, creating a stable sanctuary for ferns and air plants.",
    whereHtml:
      "The deep woods of <a href=\"https://www.floridastateparks.org/parks-and-trails/hillsborough-river-state-park\">Hillsborough River State Park</a> or <a href=\"https://pinellas.gov/parks/philippe-park/\">Philippe Park</a>."
  },
  {
    name: "Mesic Flatwoods",
    image: "Mesic-Flatwoods.png",
    description:
      "The quintessential landscape where tall pines cast long shadows over a floor of saw palmetto and wiregrass. It is a system built on fire; without the flames, the open, sun-drenched diversity is lost to the shadows.",
    whereHtml:
      "The vast pine lands of <a href=\"https://hcfl.gov/locations/morris-bridge-conservation-park\">Morris Bridge Wilderness Park</a> or <a href=\"https://www.swfwmd.state.fl.us/recreation/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a>."
  },
  {
    name: "Marl Prairie",
    image: "Marl-Prairie.png",
    description:
      "A carpet of grasses growing on a thin layer of calcareous mud that seals off the limestone below. This landscape dries down annually, allowing wildflowers to bloom before the water returns.",
    whereHtml:
      "Found in the Everglades; not present in Tampa."
  },
  {
    name: "Maritime Hammock",
    image: "Maritime-Hammock-Final.png",
    description:
      "On old dunes protected from the salt spray, a canopy of live oak and cabbage palm creates a cool refuge. This forest is sculpted by the wind, its low profile a testament to the power of the sea breeze.",
    whereHtml:
      "The interior of <a href=\"https://www.floridastateparks.org/Anclote-Key\">Anclote Key</a> or remnants at <a href=\"https://pinellas.gov/parks/fort-de-soto-park/\">Fort De Soto Park</a>."
  },
  {
    name: "Mangrove Swamp",
    image: "Mangrove-Swamp-Final.png",
    description:
      "A forest that walks into the sea, trapping sediments in a tangle of prop roots. It is a quiet, horizontal world where falling leaves fuel the aquatic food web and protect the coast from the tides.",
    whereHtml:
      "The tunnels of <a href=\"https://pinellas.gov/parks/weedon-island-preserve/\">Weedon Island Preserve</a> or <a href=\"https://hcfl.gov/locations/upper-tampa-bay-conservation-park\">Upper Tampa Bay Park</a>."
  },
  {
    name: "Limestone Outcrop",
    image: "Limestone-Outcrop-Final.png",
    description:
      "Where the bones of the earth break through the soil, delicate ferns and mosses cling to the cool rock faces. These fragile outcrops offer a moist microclimate protected from the drying sun.",
    whereHtml:
      "The rock exposures in <a href=\"https://floridabirdingtrail.com/site/withlacoochee-state-forest/\">Withlacoochee State Forest</a>."
  },
  {
    name: "Keys Tidal Rock Barren",
    image: "Keys-Tidal-Rock-Barren.png",
    description:
      "A stark platform of eroded limestone just above the daily tide, washed only by storms. Here, only the hardiest plants persist in the pockets of marl between the white rock.",
    whereHtml:
      "Found only in the Florida Keys."
  },
  {
    name: "Keys Cactus Barren",
    image: "Keys-Cactus-Barren.png",
    description:
      "On the sun-baked limestone where soil is scarce, life strips down to its essentials. Cacti and agave cling to the bare rock, thriving in the harsh heat.",
    whereHtml:
      "Found only in the Florida Keys."
  },
  {
    name: "Hydric Hammock",
    image: "Hydric-Hammock.png",
    description:
      "A shady forest of oaks and cabbage palms where the limestone lies just beneath the wet soil. It occupies the margins between swamp and upland, surviving occasional floods with a dense canopy that rarely burns.",
    whereHtml:
      "The floodplain of the <a href=\"https://www.floridastateparks.org/parks-and-trails/little-manatee-river-state-park\">Little Manatee River</a> or <a href=\"https://www.floridastateparks.org/parks-and-trails/hillsborough-river-state-park\">Hillsborough River State Park</a>."
  },
  {
    name: "Glades Marsh",
    image: "Glades-Marsh.png",
    description:
      "The true River of Grass, a boundless sheet of water moving imperceptibly over peat and limestone. Here, sawgrass and sky merge, dependent on the slow flow of water to keep the landscape alive.",
    whereHtml:
      "The Everglades; not present in Tampa."
  },
  {
    name: "Floodplain Swamp",
    image: "Floodplain-Swamp.png",
    description:
      "In the dark backwaters of the river, buttressed cypress and tupelo trees stand in the tea-colored current. This water-bound forest thrives on the nutrient pulse of the flood, filtering the river system.",
    whereHtml:
      "Along the banks of the Hillsborough River or <a href=\"https://www.floridastateparks.org/parks-and-trails/little-manatee-river-state-park\">Little Manatee River</a>."
  },
  {
    name: "Floodplain Marsh",
    image: "Floodplain-Marsh.png",
    description:
      "Along the river’s edge, the forest gives way to open ribbons of sawgrass and cordgrass that rise and fall with the flowing water. These marshes are the river’s breathing room, shifting with the floods.",
    whereHtml:
      "The marshes along the <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River</a>."
  },
  {
    name: "Dry Prairie",
    image: "Dry-Prairie.png",
    description:
      "A sweeping horizon of wiregrass and saw palmetto where the sky touches the earth without interruption. It is maintained by fire and flood, existing in a perpetual state of renewal.",
    whereHtml:
      "The treeless expanses of <a href=\"https://www.floridastateparks.org/parks-and-trails/myakka-river-state-park\">Myakka River State Park</a>."
  },
  {
    name: "Dome Swamp",
    image: "Dome-Swamp.png",
    description:
      "A circular cathedral of cypress trees, growing taller toward the center where the peat is deep. It is a reservoir for the landscape, surviving on the delicate balance between the flood that feeds it and the fire that keeps it open.",
    whereHtml:
      "The cypress heads at <a href=\"https://www.swfwmd.state.fl.us/recreation/jay-b-starkey-wilderness-park\">Starkey Wilderness Park</a> or the <a href=\"https://www.swfwmd.state.fl.us/recreation/green-swamp-wilderness-preserve\">Green Swamp</a>."
  },
  {
    name: "Depression Marsh",
    image: "Depression-Marsh.png",
    description:
      "A small, rounded window into the water table, where rings of grasses mark the slow retreat of the water. These shallow ponds foster a burst of aquatic life before drying down to wait for the rain.",
    whereHtml:
      "Scattered throughout <a href=\"https://pinellas.gov/parks/brooker-creek-preserve/\">Brooker Creek Preserve</a>."
  },
  {
    name: "Coastal Strand",
    image: "Coastal-Strand.png",
    description:
      "Smoothed by salt spray, this community of tough shrubs acts as a living windbreak along the coast. It survives by bending to the breeze, protecting the interior from the sea’s breath.",
    whereHtml:
      "The dunes of <a href=\"https://www.floridastateparks.org/honeymoonisland\">Honeymoon Island State Park</a> or <a href=\"https://pinellas.gov/parks/fort-de-soto-park/\">Fort De Soto Park</a>."
  },
  {
    name: "Coastal Interdunal Swale",
    image: "Coastal-Interdunal.png",
    description:
      "In the low troughs between dune ridges, rainwater gathers to create fleeting linear wetlands. These slender marshes shift with the seasons, offering fresh water in a landscape defined by salt.",
    whereHtml:
      "Between the dunes at <a href=\"https://pinellas.gov/parks/fort-de-soto-park/\">Fort De Soto Park</a> or <a href=\"https://www.floridastateparks.org/Anclote-Key\">Anclote Key</a>."
  },
  {
    name: "Coastal Grassland",
    image: "Coastal-Grassland.png",
    description:
      "Behind the dunes, the wind softens, allowing a meadow of grasses to settle the shifting sands. It is a landscape of pause between the ocean’s fury and the inland scrub.",
    whereHtml:
      "The back dunes of <a href=\"https://www.floridastateparks.org/parks-and-trails/caladesi-island-state-park\">Caladesi Island State Park</a>."
  },
  {
    name: "Coastal Berm",
    image: "Coastal-Berm.png",
    description:
      "A ridge of loose shell and debris cast up by storms, now a quiet refuge for tropical shrubs. It is a testament to the ocean’s power to create new land, offering a foothold just above the tides.",
    whereHtml:
      "The shell ridges on <a href=\"https://www.floridastateparks.org/parks-and-trails/cayo-costa-state-park\">Cayo Costa</a> or <a href=\"https://www.floridastateparks.org/parks-and-trails/egmont-key-state-park\">Egmont Key</a>."
  },
  {
    name: "Bottomland Forest",
    image: "Bottomland-Forest.png",
    description:
      "On the high terraces of the floodplain, this forest exists in the lull between the river’s floods. It is a place of transition, where the water recedes enough for a diversity of oaks to stand tall in the rich soil.",
    whereHtml:
      "The high banks of the <a href=\"https://www.floridastateparks.org/parks-and-trails/hillsborough-river-state-park\">Hillsborough River State Park</a>."
  },
  {
    name: "Beach Dune",
    image: "Beach-Dune.png",
    description:
      "A restless edge where the sea gives up its sand to the wind, built and rebuilt by storms. Life here clings to a landscape that is always in motion, finding stability in the shifting grains.",
    whereHtml:
      "The shores of <a href=\"https://pinellas.gov/parks/fort-de-soto-park/\">Fort De Soto Park</a> or <a href=\"https://www.floridastateparks.org/parks-and-trails/caladesi-island-state-park\">Caladesi Island</a>."
  },
  {
    name: "Baygall",
    image: "Baygall-Final-2.png",
    description:
      "A dense tangle fed by the slow bleed of groundwater, where the air hangs heavy and humid. The deep peat floor supports a green silence of bay trees that thrives in the absence of fire.",
    whereHtml:
      "The seepage areas of <a href=\"https://www.floridastateparks.org/parks-and-trails/little-manatee-river-state-park\">Little Manatee River State Park</a>."
  },
  {
    name: "Basin Swamp",
    image: "Basin-Swamp.png",
    description:
      "In these deep basins, time slows down, allowing peat to gather beneath a canopy of ancient cypress. It is a dark refuge that holds the rain, releasing it slowly back to the earth only when the season turns.",
    whereHtml:
      "The vast expanse of the <a href=\"https://www.swfwmd.state.fl.us/recreation/green-swamp-wilderness-preserve\">Green Swamp Wilderness Preserve</a>."
  },
  {
    name: "Basin Marsh",
    image: "Basin-Marsh.png",
    description:
      "A vast, shallow expanse where water rests before moving on, shifting between lake and meadow. It is a grassy bowl where the sky reflects on the water, hosting a quiet succession of life.",
    whereHtml:
      "The headwaters of the Myakka at <a href=\"https://www.swfwmd.state.fl.us/recreation/myakka-river-flatford-swamp\">Flatford Swamp</a>."
  },
  {
    name: "Alluvial Forest",
    image: "Alluvial-Forest.png",
    description:
      "A forest born of the river’s restlessness, where floodwaters sculpt ridges and swales from the shifting earth. Here, the land breathes with the rise and fall of the season, feeding the estuary with the richness of its own decay.",
    whereHtml:
      "The floodplain of the <a href=\"https://www.floridastateparks.org/parks-and-trails/little-manatee-river-state-park\">Little Manatee River</a>."
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
    setFeedback("Add at least 4 ecological communities to play.");
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

nameStepTitle.textContent = "Step 1: Select the ecological community name.";
