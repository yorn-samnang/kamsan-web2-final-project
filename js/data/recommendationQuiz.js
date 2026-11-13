export const recommendationQuestions = [
  {
    id: 'setting',
    prompt: 'What kind of place are you in the mood for?',
    options: [
      { value: 'city', label: 'City & local culture' },
      { value: 'temples', label: 'Ancient temples' },
      { value: 'coast', label: 'Coast & islands' },
      { value: 'nature', label: 'Mountains & nature' },
      { value: 'mix', label: 'A mix of everything' },
    ],
  },
  {
    id: 'activity',
    prompt: 'What would you most like to do?',
    options: [
      { value: 'culture', label: 'Explore culture & history' },
      { value: 'temples', label: 'Visit temples' },
      { value: 'nature', label: 'Get out into nature' },
      { value: 'islands', label: 'Relax around islands' },
      { value: 'city', label: 'Enjoy city food & nightlife' },
    ],
  },
  {
    id: 'food',
    prompt: 'What kind of food sounds good?',
    options: [
      { value: 'noodles', label: 'Noodles & soups' },
      { value: 'mains', label: 'Khmer main dishes' },
      { value: 'snacks', label: 'Street snacks' },
      { value: 'sweets', label: 'Drinks & sweets' },
      { value: 'surprise', label: 'Surprise me' },
    ],
  },
];

const destinations = {
  'Phnom Penh': {
    image: 'images/destinations/royal-palace.png',
    href: 'destination-phnom-penh.html',
  },
  'Siem Reap': { image: 'images/travel-guide/angkorwat.jpg' },
  'Preah Sihanouk': { image: 'images/destinations/sihanoukville.png' },
  Battambang: { image: 'images/destinations/battambang.png' },
  Kampot: { image: 'images/destinations/kompot.png' },
  Kep: { image: 'images/destinations/kep.png' },
  Mondulkiri: { image: 'images/destinations/mondulkiri.png' },
  Ratanakiri: { image: 'images/destinations/ratanakkiri.png' },
  Kratie: { image: 'images/destinations/kratie.png' },
  'Koh Kong': { image: 'images/destinations/kohkong.png' },
  'Preah Vihear': { image: 'images/destinations/preahvihear.png' },
};

const destinationPicks = {
  city: ['Phnom Penh', 'Battambang', 'Kratie'],
  temples: ['Siem Reap', 'Preah Vihear', 'Phnom Penh'],
  coast: ['Preah Sihanouk', 'Kep', 'Kampot'],
  nature: ['Mondulkiri', 'Ratanakiri', 'Koh Kong'],
  mix: ['Phnom Penh', 'Siem Reap', 'Kampot'],
};

const activityItems = {
  culture: [
    { name: 'Royal Palace', image: 'images/things-to-do/royal-palace.png' },
    { name: 'National Museum of Cambodia', image: 'images/things-to-do/national-museum.png' },
    { name: 'Choeung Ek Killing Fields', image: 'images/things-to-do/choeung-ek.png' },
  ],
  temples: [
    { name: 'Angkor Wat', image: 'images/things-to-do/angkor-wat.png' },
    { name: 'Bayon Temple', image: 'images/things-to-do/bayon-temple.png' },
    { name: 'Ta Prohm Temple', image: 'images/things-to-do/ta-prohm-temple.png' },
  ],
  nature: [
    { name: 'Phnom Kulen Waterfall', image: 'images/things-to-do/phnom-kulen-waterfall.png' },
    { name: 'Chi Phat Ecotourism', image: 'images/things-to-do/chi-phat.png' },
    { name: 'Cardamom Mountains', image: 'images/things-to-do/cardamom-mountains.png' },
  ],
  islands: [
    { name: 'Koh Rong', image: 'images/things-to-do/koh-rong.png' },
    { name: 'Koh Rong Sanloem', image: 'images/things-to-do/koh-rong-sanloem.png' },
    { name: 'Koh Tonsay', image: 'images/things-to-do/koh-tonsay.png' },
  ],
  city: [
    { name: 'Wat Phnom', image: 'images/things-to-do/wat-phnom.png' },
    { name: 'Mekong River Night Cruise', image: 'images/things-to-do/night-cruise.png' },
    { name: 'Bassac Lane, Phnom Penh', image: 'images/things-to-do/bassac-lane.png' },
  ],
};

const foodItems = {
  noodles: [
    { name: 'Kuy Teav', image: 'images/food/kuy-teav.jpg' },
    { name: 'Nom Banh Chok', image: 'images/food/nom-banh-chok.jpg' },
    { name: 'Lort Cha', image: 'images/food/lort-cha.jpg' },
  ],
  mains: [
    { name: 'Fish Amok', image: 'images/food/fish-amok.jpg' },
    { name: 'Beef Lok Lak', image: 'images/food/lok-lak.jpg' },
    { name: 'Bai Sach Chrouk', image: 'images/food/bai-sach-chrouk.jpg' },
  ],
  snacks: [
    { name: 'Banh Chao', image: 'images/food/banh-chao.jpg' },
    { name: 'Num Krok', image: 'images/food/nom-krok.jpg' },
    { name: 'Grilled Salted Fish', image: 'images/food/grilled-salted-fish.jpg' },
  ],
  sweets: [
    { name: 'Sugarcane Juice', image: 'images/food/sugarcane-juice.jpg' },
    { name: 'Num Plae Ai', image: 'images/food/palm-sugar-dessert.jpg' },
    { name: 'Fresh Coconut Water', image: 'images/food/fresh-coconut-water.jpg' },
  ],
  surprise: [
    { name: 'Fish Amok', image: 'images/food/fish-amok.jpg' },
    { name: 'Kuy Teav', image: 'images/food/kuy-teav.jpg' },
    { name: 'Crab with Kampot Pepper', image: 'images/food/crab-kampot-pepper.jpg' },
  ],
};

export function getRecommendations(answers) {
  const requiredAnswers = ['setting', 'activity', 'food'];
  if (!requiredAnswers.every((key) => Object.hasOwn(answers, key))) {
    throw new Error('All recommendation quiz questions must be answered.');
  }

  const destinationsForSetting = destinationPicks[answers.setting];
  const activitiesForPreference = activityItems[answers.activity];
  const foodsForPreference = foodItems[answers.food];
  if (!destinationsForSetting || !activitiesForPreference || !foodsForPreference) {
    throw new Error('The recommendation quiz contains an unsupported answer.');
  }

  return {
    destinations: destinationsForSetting.map((name) => ({
      name,
      image: destinations[name].image,
      href: destinations[name].href || 'destinations.html#destinations-grid',
    })),
    activities: activitiesForPreference.map((item) => ({
      ...item,
      href: 'things-to-do.html#things-to-do-grid',
    })),
    foods: foodsForPreference.map((item) => ({ ...item, href: 'food.html#food-to-try' })),
  };
}
