// ─── PIRATE MAP THEME ─────────────────────────────────────────────
export const PIRATE_MAP_STYLE = [
  { elementType:"geometry", stylers:[{color:"#1a1a2e"}] },
  { elementType:"labels.text.fill", stylers:[{color:"#D4A96A"}] },
  { elementType:"labels.text.stroke", stylers:[{color:"#1a1a2e"}] },
  { featureType:"administrative", elementType:"geometry", stylers:[{color:"#2d2d4e"}] },
  { featureType:"administrative.country", elementType:"labels.text.fill", stylers:[{color:"#D4A96A"}] },
  { featureType:"administrative.locality", elementType:"labels.text.fill", stylers:[{color:"#f0d090"}] },
  { featureType:"poi", elementType:"labels.text.fill", stylers:[{color:"#D4A96A"}] },
  { featureType:"poi.park", elementType:"geometry", stylers:[{color:"#162535"}] },
  { featureType:"poi.park", elementType:"labels.text.fill", stylers:[{color:"#3C7A3C"}] },
  { featureType:"road", elementType:"geometry", stylers:[{color:"#2d2d4e"}] },
  { featureType:"road", elementType:"geometry.stroke", stylers:[{color:"#0F2747"}] },
  { featureType:"road", elementType:"labels.text.fill", stylers:[{color:"#9ca5b3"}] },
  { featureType:"road.highway", elementType:"geometry", stylers:[{color:"#0F2747"}] },
  { featureType:"road.highway", elementType:"geometry.stroke", stylers:[{color:"#D4A96A"}] },
  { featureType:"road.highway", elementType:"labels.text.fill", stylers:[{color:"#f3d19c"}] },
  { featureType:"transit", elementType:"geometry", stylers:[{color:"#2f3948"}] },
  { featureType:"transit.station", elementType:"labels.text.fill", stylers:[{color:"#D4A96A"}] },
  { featureType:"water", elementType:"geometry", stylers:[{color:"#0F2747"}] },
  { featureType:"water", elementType:"labels.text.fill", stylers:[{color:"#4e6d70"}] },
  { featureType:"water", elementType:"labels.text.stroke", stylers:[{color:"#17263c"}] },
];

export const BARRIOS = [
  { name: "Surprise Me", lat: 40.4168, lng: -3.7038, surprise: true },
  { name: "Malasaña", lat: 40.4270, lng: -3.7030 },
  { name: "Chueca", lat: 40.4243, lng: -3.6957 },
  { name: "La Latina", lat: 40.4130, lng: -3.7110 },
  { name: "Lavapiés", lat: 40.4085, lng: -3.7020 },
  { name: "Sol / Centro", lat: 40.4168, lng: -3.7038 },
  { name: "Salamanca", lat: 40.4280, lng: -3.6820 },
  { name: "Retiro", lat: 40.4115, lng: -3.6820 },
  { name: "Castellana", lat: 40.4500, lng: -3.6924 },
  { name: "Chamberí", lat: 40.4340, lng: -3.7060 },
];

export const CREW_ROLES = [
  { id: "broke", label: "The Broke One", desc: "Needs it cheap" },
  { id: "foodie", label: "The Foodie", desc: "Lives to eat" },
  { id: "nightowl", label: "The Night Owl", desc: "Goes all night" },
  { id: "explorer", label: "The Explorer", desc: "Hates tourists" },
  { id: "romantic", label: "The Romantic", desc: "Sets the mood" },
  { id: "culture", label: "The Culture Vulture", desc: "Wants character" },
];

export const CHEST_OPTIONS = [
  {
    id: "restaurants_bars",
    variant: "feast",
    title: "Feast & Grog",
    subtitle: "Restaurants & bars",
    accent: "#F0C040",
  },
  {
    id: "museums",
    variant: "culture",
    title: "Captain's Culture",
    subtitle: "Museums & culture",
    accent: "#6ab4c4",
  },
  {
    id: "clubs",
    variant: "moonlight",
    title: "Moonlight Raid",
    subtitle: "Clubs & late nights",
    accent: "#b894d4",
  },
  {
    id: "surprise",
    variant: "surprise",
    title: "Surprise Me",
    subtitle: "Gemini picks everything",
    accent: "#00D4AA",
  },
];

// ─── MOMENT OF THE DAY ────────────────────────────────────────────
// Drives both the Gemini prompt and the SeaShader palette. `sceneValue`
// maps 0..2 onto the shader's uScene uniform (home=0, explore=1, hunt=2)
// so a "lunch" hunt renders on an open-daylight sea and "late" on a storm.
export const MOMENT_OPTIONS = [
  { id: "breakfast", label: "Breakfast",  es: "Desayuno",   hours: "06–11", sceneValue: 0.0 },
  { id: "lunch",     label: "Lunch",      es: "Comida",     hours: "11–16", sceneValue: 0.4 },
  { id: "tapas",     label: "Tapas",      es: "Tapeo",      hours: "16–19", sceneValue: 0.8 },
  { id: "cena",      label: "Dinner",     es: "Cena",       hours: "19–23", sceneValue: 1.2 },
  { id: "copas",     label: "Drinks",     es: "Copas",      hours: "23–02", sceneValue: 1.7 },
  { id: "late",      label: "Late night", es: "Madrugada",  hours: "02–06", sceneValue: 2.0 },
];

export function momentFromHour(h) {
  if (h < 6)  return "late";
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 19) return "tapas";
  if (h < 23) return "cena";
  return "copas";
}

export function momentSceneValue(id) {
  const m = MOMENT_OPTIONS.find((x) => x.id === id);
  return m ? m.sceneValue : 1.2;
}

export const SORT_OPTIONS = [
  { id: "popularity", label: "Most Popular" },
  { id: "price", label: "Best Price" },
  { id: "location", label: "Closest" },
];

export const CLUB_DAY_OPTIONS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const CLUB_AGE_OPTIONS = [
  { id: "18-20", label: "18–20" },
  { id: "21-25", label: "21–25" },
  { id: "25-35", label: "25–35" },
  { id: "35+", label: "+35" },
];

export const HUNT_STAGES = [
  { icon: "⚓", text: "Setting sail from your coordinates..." },
  { icon: "🗺️", text: "Consulting the ancient charts of Madrid..." },
  { icon: "☠️", text: "Avoiding tourist traps and chain taverns..." },
  { icon: "🔭", text: "Gemini scanning for hidden gems..." },
  { icon: "💰", text: "Treasure located. Pulling up the bounty..." },
];

export const MADRID_CENTER = { lat: 40.4168, lng: -3.7038 };

// ─── VIBE THEMES ──────────────────────────────────────────────────
export const VIBE_THEMES = {
  wild: {
    label: "Wild Night",
    icon: "💀",
    skyGradient: "linear-gradient(180deg, #0a0418 0%, #1a0630 35%, #2d0a4e 60%, #1a0a20 100%)",
    accentColor: "#e040fb",
    accentGlow: "rgba(224,64,251,0.25)",
    cardBg: "rgba(20,6,40,0.92)",
    cardBorder: "rgba(224,64,251,0.25)",
    textPrimary: "#f0e0ff",
    textMuted: "rgba(200,160,240,0.65)",
    goldColor: "#e040fb",
    particles: "stars+neon",
    mapFilter: "saturate(0.4) brightness(0.6) hue-rotate(270deg)",
    tagline: "The night has no limits, Captain.",
    numberBadgeBg: "#e040fb",
  },
  romantic: {
    label: "Romantic Evening",
    icon: "🌹",
    skyGradient: "linear-gradient(180deg, #0d1a2e 0%, #1a1030 30%, #2d1440 55%, #1a0820 80%, #0d0510 100%)",
    accentColor: "#f48fb1",
    accentGlow: "rgba(244,143,177,0.2)",
    cardBg: "rgba(18,8,28,0.92)",
    cardBorder: "rgba(244,143,177,0.2)",
    textPrimary: "#ffe8f0",
    textMuted: "rgba(255,180,200,0.6)",
    goldColor: "#f48fb1",
    particles: "stars+rose",
    mapFilter: "saturate(0.5) brightness(0.55) hue-rotate(300deg)",
    tagline: "A treasure worthy of the occasion.",
    numberBadgeBg: "#c2185b",
  },
  cultural: {
    label: "Cultural Discovery",
    icon: "📜",
    skyGradient: "linear-gradient(180deg, #0f1b2d 0%, #162540 30%, #1e3050 55%, #162030 100%)",
    accentColor: "#80cbc4",
    accentGlow: "rgba(128,203,196,0.2)",
    cardBg: "rgba(10,20,35,0.92)",
    cardBorder: "rgba(128,203,196,0.2)",
    textPrimary: "#e0f5f3",
    textMuted: "rgba(160,220,210,0.6)",
    goldColor: "#80cbc4",
    particles: "stars+soft",
    mapFilter: "saturate(0.45) brightness(0.55) hue-rotate(180deg)",
    tagline: "Every corner holds a story, Navigator.",
    numberBadgeBg: "#00796b",
  },
  foodie: {
    label: "Foodie Hunt",
    icon: "🍖",
    skyGradient: "linear-gradient(180deg, #120800 0%, #231200 30%, #180e00 60%, #0c0800 100%)",
    accentColor: "#ff9a3c",
    accentGlow: "rgba(255,154,60,0.22)",
    cardBg: "rgba(20,10,2,0.93)",
    cardBorder: "rgba(255,154,60,0.22)",
    textPrimary: "#fff5e0",
    textMuted: "rgba(255,200,120,0.6)",
    goldColor: "#ff9a3c",
    particles: "stars+gold",
    mapFilter: "saturate(0.45) brightness(0.5) hue-rotate(18deg)",
    tagline: "The finest hidden tables await your crew.",
    numberBadgeBg: "#b35c00",
  },
  adventure: {
    label: "Adventure Mode",
    icon: "⚔️",
    skyGradient: "linear-gradient(180deg, #0a1520 0%, #102030 30%, #1a3040 55%, #102028 100%)",
    accentColor: "#ffd54f",
    accentGlow: "rgba(255,213,79,0.2)",
    cardBg: "rgba(8,18,28,0.93)",
    cardBorder: "rgba(255,213,79,0.2)",
    textPrimary: "#fffde7",
    textMuted: "rgba(240,220,140,0.6)",
    goldColor: "#ffd54f",
    particles: "stars+gold",
    mapFilter: "saturate(0.5) brightness(0.55) hue-rotate(30deg)",
    tagline: "Chart the unknown, Captain. Fortune favours the bold.",
    numberBadgeBg: "#f57f17",
  },
  chill: {
    label: "Chill Vibes",
    icon: "🌙",
    skyGradient: "linear-gradient(180deg, #100a04 0%, #221408 35%, #181008 60%, #0e0c08 100%)",
    accentColor: "#D4A96A",
    accentGlow: "rgba(212,169,106,0.22)",
    cardBg: "rgba(16,10,4,0.93)",
    cardBorder: "rgba(212,169,106,0.28)",
    textPrimary: "#f7e8c8",
    textMuted: "rgba(220,180,110,0.65)",
    goldColor: "#D4A96A",
    particles: "stars+soft",
    mapFilter: "saturate(0.65) brightness(0.7) sepia(0.25)",
    tagline: "The perfect spot for a lazy afternoon.",
    numberBadgeBg: "#5c3d0a",
  },
};

export const ROUTES_DATA = [
  { title:"Hidden Taverns of Malasaña", badge:"Local Legend", emoji:"🍺", meta:"Malasaña · Food & Drink", barrio:"Malasaña", huntDesc:"Friends looking for hidden local taverns and bars with authentic character, avoiding tourist chains in Malasaña" },
  { title:"Moonlit Terraces of Salamanca", badge:"Night Voyage", emoji:"🌙", meta:"Salamanca · Drinks & Views", barrio:"Salamanca", huntDesc:"Friends going out for drinks on rooftop terraces and bars with night views in Salamanca" },
  { title:"Broke Crew's Feast in Chamberí", badge:"Pirate Budget", emoji:"🪙", meta:"Chamberí · Budget Feast", barrio:"Chamberí", huntDesc:"Broke students who want cheap authentic local food and drinks, no tourist spots in Chamberí" },
  { title:"Secret Port of La Latina", badge:"Date Voyage", emoji:"🌹", meta:"La Latina · Romantic", barrio:"La Latina", huntDesc:"A couple on a date wanting intimate, cozy hidden spots with atmosphere in La Latina" },
  { title:"Ancient Scrolls of Sol", badge:"Cultural Raid", emoji:"📜", meta:"Centro · Culture & History", barrio:"Sol / Centro", huntDesc:"Culture lovers looking for hidden historical spots, local galleries and character-filled places in Madrid Centro" },
  { title:"Speakeasy Run in Chueca", badge:"Secret Cove", emoji:"🍸", meta:"Chueca · Cocktails", barrio:"Chueca", huntDesc:"A group looking for secret cocktail bars and speakeasies with hidden entrances in Chueca" },
  { title:"Sky High — Rooftop Madrid", badge:"Above the Clouds", emoji:"🏙️", meta:"Madrid · Rooftop Terraces", barrio:"Sol / Centro", huntDesc:"Find the best rooftop terraces and sky bars in central Madrid with views over the city, locals-only spots" },
  { title:"Sunday Brunch in Salamanca", badge:"Slow Morning", emoji:"☕", meta:"Salamanca · Weekend Brunch", barrio:"Salamanca", huntDesc:"A relaxed Sunday brunch crawl in Salamanca, looking for hidden café-restaurant spots with good food and atmosphere" },
  { title:"Underground Lavapiés", badge:"Off the Map", emoji:"🎨", meta:"Lavapiés · Art & Craft Beer", barrio:"Lavapiés", huntDesc:"Looking for alternative bars, craft beer spots and street-art adjacent venues in Lavapiés, the most multicultural barrio in Madrid" },
];

export const FAN_FAVOURITES = [
  {
    name: "Sala Equis",
    barrio: "La Latina",
    heat: "SCENE LEGEND",
    platform: "TikTok & Instagram",
    desc: "A 1930s adult cinema transformed into a cult bar with a terrace pool. The most-filmed interior in Madrid right now.",
    tags: ["#MadridVibes", "#CineBar", "#HiddenMadrid"],
    huntDesc: "Find places near Sala Equis in La Latina with a similar cinematic, artistic underground bar atmosphere — character-filled hidden gems",
  },
  {
    name: "Bodega de los Secretos",
    barrio: "Sol / Centro",
    heat: "HIDDEN ICON",
    platform: "Instagram & TikTok",
    desc: "A restaurant built inside 17th-century underground caves. Candles, stone arches, and food that matches the setting.",
    tags: ["#UndergroundMadrid", "#DateNight", "#MadridEats"],
    huntDesc: "Find similar atmospheric underground or cave-style restaurants and bars in Madrid Centro with historical character and excellent food",
  },
  {
    name: "El Lateral – Castellana",
    barrio: "Castellana",
    heat: "LOCAL STAPLE",
    platform: "Instagram",
    desc: "The terrace that Madrid's food creators keep returning to. Montaditos done right, always packed on weekends.",
    tags: ["#MadridTerrace", "#Tapas", "#WeekendMadrid"],
    huntDesc: "Find the best terrace spots and tapas bars near Castellana in Madrid, popular with locals, hidden gems with great outdoor seating",
  },
];

export const VIBE_CARD_ANIM = {
  wild:      { hidden: "translateX(40px) rotate(2deg)", duration: "0.5s", easing: "cubic-bezier(0.34,1.56,0.64,1)" },
  romantic:  { hidden: "translateY(20px) scale(0.97)",  duration: "0.7s", easing: "ease" },
  cultural:  { hidden: "translateX(-40px)",             duration: "0.5s", easing: "ease-out" },
  foodie:    { hidden: "translateY(28px) scale(0.95)",  duration: "0.55s", easing: "cubic-bezier(0.34,1.56,0.64,1)" },
  adventure: { hidden: "translateY(-20px) scale(0.96)", duration: "0.5s", easing: "cubic-bezier(0.34,1.56,0.64,1)" },
  chill:     { hidden: "translateY(16px)",              duration: "0.8s", easing: "ease" },
};
