export const DEFAULT_POOL = [
  { id: '1', emoji: '🪥', label: 'Brush Teeth' },
  { id: '2', emoji: '👗', label: 'Get Dressed' },
  { id: '3', emoji: '🥣', label: 'Eat Breakfast' },
  { id: '4', emoji: '🎒', label: 'Pack Backpack' },
  { id: '5', emoji: '👟', label: 'Put on Shoes' },
  { id: '6', emoji: '🛁', label: 'Take a Bath' },
  { id: '7', emoji: '📚', label: 'Read a Book' },
  { id: '8', emoji: '🧹', label: 'Clean Room' },
  { id: '9', emoji: '🌙', label: 'Get Ready for Bed' },
  { id: '10', emoji: '😴', label: 'Put on Pajamas' },
];

export const DEFAULT_TODAY = ['1', '2', '3', '4', '5'];

export const DEFAULT_SECTIONS = [
  {
    id: 'bedtime',
    title: 'Bedtime',
    emoji: '🌙',
    enabled: true,
    tasks: [
      { id: 'bt-dinner', emoji: '🍽️', label: 'Dinner' },
      { id: 'bt-brush', emoji: '🪥', label: 'Brush Teeth' },
      { id: 'bt-potty', emoji: '🚽', label: 'Potty' },
      { id: 'bt-diaper', emoji: '🧷', label: 'Diaper' },
      { id: 'bt-pajamas', emoji: '😴', label: 'Pajamas On' },
      { id: 'bt-book', emoji: '📚', label: 'Book' },
      { id: 'bt-humidifier', emoji: '💨', label: 'Humidifier On' },
      { id: 'bt-lamp', emoji: '💡', label: 'Lamp Off' },
    ],
  },
  {
    id: 'morning',
    title: 'Morning',
    emoji: '☀️',
    enabled: true,
    tasks: [
      { id: 'mo-diaper-off', emoji: '🧷', label: 'Diaper Off' },
      { id: 'mo-underwear', emoji: '🩲', label: 'Underwear On' },
      { id: 'mo-shirt', emoji: '👕', label: 'Shirt On' },
      { id: 'mo-pants', emoji: '👖', label: 'Pants On' },
      { id: 'mo-socks', emoji: '🧦', label: 'Socks On' },
      { id: 'mo-wash', emoji: '🧼', label: 'Wash Hands & Face' },
      { id: 'mo-make-breakfast', emoji: '🍳', label: 'Make Breakfast' },
      { id: 'mo-eat-breakfast', emoji: '🥣', label: 'Eat Breakfast' },
      { id: 'mo-vitamin-d', emoji: '💊', label: 'Eat Vitamin D' },
      { id: 'mo-shoes', emoji: '👟', label: 'Shoes On' },
    ],
  },
  {
    id: 'potty',
    title: 'Potty Time',
    emoji: '🚽',
    enabled: true,
    tasks: [
      { id: 'pt-dry', emoji: '✨', label: 'Pants & Underwear Dry' },
      { id: 'pt-wash', emoji: '🧼', label: 'Wash Hands' },
    ],
  },
];

export const EMOJI_OPTIONS = [
  '🪥', '👗', '🥣', '🎒', '👟', '🛁', '📚', '🧹',
  '🌙', '😴', '🎨', '🏃', '🍎', '🧸', '🦷', '👕',
  '🎵', '🌟', '💤', '🐶', '🐱', '🚀', '⚽', '🎮',
  '🍌', '🥦', '🧦', '🧤', '🎂', '🎁', '🌈', '🦄',
  '🐠', '🧩', '🪀', '🚂', '✏️', '🎪', '🥤', '🧇',
];
