export const taskBank = {
  diet: [
    "Drink 1 glass of warm water after waking up",
    "Add 1 seasonal fruit to your breakfast",
    "Eat a handful of soaked almonds/walnuts",
    "Replace one fried snack with fruit or sprouts",
    "Have a glass of buttermilk/curd with lunch",
    "Reduce sugar in tea/coffee by half today",
    "Include dal/lentils at lunch/dinner",
    "Eat 1 small bowl of salad before your meal",
    "Use less oil in cooking today",
    "Add green leafy vegetables to at least one meal"
  ],
  
  posture: [
    "Sit with back fully supported for 30 minutes",
    "Keep both feet flat on floor while working",
    "Sit upright during staff meeting",
    "Keep laptop/PC screen at eye level",
    "Avoid crossing legs for 1 hour",
    "Sit with hips at back of chair",
    "Relax shoulders while typing",
    "Avoid leaning forward while reading",
    "Take 2 minutes to stretch neck side-to-side",
    "Stand up after every 1 hour of sitting"
  ],
  
  exercise: [
    "Walk 500 steps after lunch",
    "Do 10 sit-to-stand movements from chair",
    "Stretch arms overhead for 1 min",
    "Rotate shoulders backward 10 times",
    "Stretch legs under desk for 1 min",
    "Do ankle circles 10 times",
    "Walk around staff room for 3 minutes",
    "Do 10 calf raises",
    "Do gentle neck rotations",
    "Stretch wrists for 30s"
  ],
  
  water: [
    "Drink 1 glass right after waking up",
    "Drink 1 glass before breakfast",
    "Drink 1 glass after breakfast",
    "Drink 1 glass before lunch",
    "Drink 2 glasses mid-morning",
    "Drink 2 glasses mid-afternoon",
    "Carry a bottle today and finish it twice",
    "Drink 8 glasses total today",
    "Replace one tea/coffee with water",
    "Add lemon to one glass"
  ],
  
  sunlight: [
    "Step outside for 10 minutes",
    "Sit near a window with sunlight for 10 minutes",
    "Take a sunlight break after lunch",
    "Drink water in sunlight",
    "Do deep breathing in sunlight for 5 min",
    "Walk outdoors for 10 minutes",
    "Stand on ground for 5 minutes",
    "Observe trees/birds outdoors for 5 minutes",
    "Sit quietly in sunlight for 10 minutes",
    "Take 20 deep breaths in sunlight"
  ]
};

export const getRandomTasks = () => {
  const categories = Object.keys(taskBank);
  const dailyTasks = [];
  
  categories.forEach(category => {
    const tasks = taskBank[category];
    const randomIndex = Math.floor(Math.random() * tasks.length);
    dailyTasks.push({
      id: `${category}-${Date.now()}`,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      instruction: tasks[randomIndex],
      completed: false
    });
  });
  
  return dailyTasks;
};
