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

const nature = [];
for(let i=1; i<=30; i++) {
  nature.push({
    id: `nature_${i}`,
    type: 'image',
    value: `https://loremflickr.com/500/500/nature,scenery,landscape/all?lock=${i}`,
    title: `Nature ${i}`,
    overlay: 'rgba(0,0,0,0.3)',
    textColor: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
  });
}

const pets = [];
for(let i=1; i<=30; i++) {
  pets.push({
    id: `pet_${i}`,
    type: 'image',
    value: `https://loremflickr.com/500/500/dog,cat,puppy,kitten/all?lock=${i}`,
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
for(let i=1; i<=28; i++) {
  tech.push({
    id: `tech_${i}`,
    type: 'image',
    value: `https://loremflickr.com/500/500/technology,neon,cyber,matrix/all?lock=${i}`,
    title: `Tech ${i}`,
    overlay: 'rgba(0,0,0,0.5)',
    textColor: '#fff',
    textShadow: '0 0 15px rgba(0,255,255,0.8)'
  });
}

const lifestyle = [];
for(let i=1; i<=30; i++) {
  lifestyle.push({
    id: `life_${i}`,
    type: 'image',
    value: `https://loremflickr.com/500/500/coffee,cafe,cozy,book/all?lock=${i}`,
    title: `Lifestyle ${i}`,
    overlay: 'rgba(0,0,0,0.3)',
    textColor: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
  });
}

export const BACKGROUND_CATEGORIES = {
  'Colors': colors,
  'Nature': nature,
  'Pets': pets,
  'Tech': tech,
  'Lifestyle': lifestyle
};
