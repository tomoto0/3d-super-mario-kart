export const ITEM_TYPES = [
  { id: "green_shell", label: "Green Shell", color: "#57d66f" },
  { id: "red_shell", label: "Red Shell", color: "#ff4d6d" },
  { id: "banana", label: "Banana", color: "#ffe24a" },
  { id: "oil", label: "Oil", color: "#4f3f3a" },
  { id: "mushroom", label: "Mushroom", color: "#ff7a59" },
  { id: "star", label: "Star", color: "#ffd93d" },
];

export const getRandomItem = () => {
  const index = Math.floor(Math.random() * ITEM_TYPES.length);
  return ITEM_TYPES[index];
};

export const getItemById = (id) => ITEM_TYPES.find((item) => item.id === id);
