const colors = [
  { id: 'paper', type: 'color', value: '#e6e2d3', title: 'Paper Texture', overlay: 'none', textColor: '#2b2b2b', textShadow: 'none' },
  { id: 'dark', type: 'color', value: '#15202b', title: 'Dark Mode', overlay: 'none', textColor: '#e7e9ea', textShadow: 'none' },
];

for(let i=0; i<28; i++) {
  const h1 = (i * 15) % 360;
  const h2 = (h1 + 45) % 360;
  colors.push({
    id: `color_${i}`,
    type: 'color',
    value: `linear-gradient(135deg, hsl(${h1}, 80%, 75%), hsl(${h2}, 80%, 75%))`,
    title: `Gradient ${i+1}`,
    overlay: 'none',
    textColor: '#222',
    textShadow: 'none'
  });
}

const nature = [
  { id: 'apple_nature_leaf', type: 'image', value: '/themes/nature_leaf.png', title: 'Apple Dewy Leaf', overlay: 'rgba(0,0,0,0.2)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' },
  { id: 'apple_nature_moss', type: 'image', value: '/themes/nature_moss.png', title: 'Apple Soft Moss', overlay: 'rgba(0,0,0,0.2)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' },
  { id: 'apple_nature_blossoms', type: 'image', value: '/themes/nature_blossoms.png', title: 'Apple Cherry Blossoms', overlay: 'rgba(0,0,0,0.3)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }
];
for(let i=1; i<=15; i++) {
  nature.push({
    id: `nature_${i}`,
    type: 'image',
    value: `https://picsum.photos/seed/nature${i}/500/500`,
    title: `Nature ${i}`,
    overlay: 'rgba(0,0,0,0.3)',
    textColor: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
  });
}

const landscape = [
  { id: 'apple_landscape_mountain', type: 'image', value: '/themes/landscape_mountain.png', title: 'Apple Sunset Mountain', overlay: 'rgba(0,0,0,0.25)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' },
  { id: 'apple_landscape_coastline', type: 'image', value: '/themes/landscape_coastline.png', title: 'Apple Moody Coast', overlay: 'rgba(0,0,0,0.25)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' },
  { id: 'apple_landscape_forest', type: 'image', value: '/themes/landscape_forest.png', title: 'Apple Misty Forest', overlay: 'rgba(0,0,0,0.25)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }
];

const pets = [];
for(let i=1; i<=15; i++) {
  pets.push({
    id: `pet_${i}`,
    type: 'image',
    value: `https://picsum.photos/seed/pets${i}/500/500`,
    title: `Pet ${i}`,
    overlay: 'rgba(0,0,0,0.3)',
    textColor: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
  });
}

const tech = [
  { id: 'neon-custom', type: 'image', value: '/neon_pentagon.png', title: 'Neon Pentagon', overlay: 'rgba(0,0,0,0.5)', textColor: '#fff', textShadow: '0 0 15px rgba(0,255,255,0.8)' },
  { id: 'ai-bg', type: 'image', value: '/ai_background.png', title: 'AI Core', overlay: 'rgba(0,0,0,0.4)', textColor: '#fff', textShadow: '0 0 15px rgba(0,150,255,0.8)' }
];
for(let i=1; i<=15; i++) {
  tech.push({
    id: `tech_${i}`,
    type: 'image',
    value: `https://picsum.photos/seed/tech${i}/500/500`,
    title: `Tech ${i}`,
    overlay: 'rgba(0,0,0,0.5)',
    textColor: '#fff',
    textShadow: '0 0 15px rgba(0,255,255,0.8)'
  });
}

const lifestyle = [
  { id: 'apple_lifestyle_workspace', type: 'image', value: '/themes/lifestyle_workspace.png', title: 'Apple Cozy Workspace', overlay: 'rgba(0,0,0,0.25)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' },
  { id: 'apple_lifestyle_coffee', type: 'image', value: '/themes/lifestyle_coffee.png', title: 'Apple Warm Latte', overlay: 'rgba(0,0,0,0.2)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' },
  { id: 'apple_lifestyle_architecture', type: 'image', value: '/themes/lifestyle_architecture.png', title: 'Apple Minimal Structure', overlay: 'rgba(0,0,0,0.2)', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }
];
for(let i=1; i<=15; i++) {
  lifestyle.push({
    id: `life_${i}`,
    type: 'image',
    value: `https://picsum.photos/seed/lifestyle${i}/500/500`,
    title: `Lifestyle ${i}`,
    overlay: 'rgba(0,0,0,0.3)',
    textColor: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
  });
}

export const BACKGROUND_CATEGORIES = {
  'Colors': colors,
  'Nature': nature,
  'Landscape': landscape,
  'Pets': pets,
  'Tech': tech,
  'Lifestyle': lifestyle
};
