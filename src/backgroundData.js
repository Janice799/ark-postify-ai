export const BACKGROUND_CATEGORIES = {
  'Premium Nature': [
    { id: 'apple-nature-leaf', type: 'image', value: "url('/themes/nature_leaf.png')", title: 'Dewy Leaf', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
    { id: 'apple-nature-moss', type: 'image', value: "url('/themes/nature_moss.png')", title: 'Soft Moss', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
    { id: 'apple-nature-blossoms', type: 'image', value: "url('/themes/nature_blossoms.png')", title: 'Cherry Blossoms', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
  ],
  'Premium Landscape': [
    { id: 'apple-landscape-mountain', type: 'image', value: "url('/themes/landscape_mountain.png')", title: 'Sunset Mountain', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
    { id: 'apple-landscape-coastline', type: 'image', value: "url('/themes/landscape_coastline.png')", title: 'Moody Coastline', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
    { id: 'apple-landscape-forest', type: 'image', value: "url('/themes/landscape_forest.png')", title: 'Misty Forest', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
  ],
  'Premium Lifestyle': [
    { id: 'apple-lifestyle-workspace', type: 'image', value: "url('/themes/lifestyle_workspace.png')", title: 'Cozy Workspace', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
    { id: 'apple-lifestyle-coffee', type: 'image', value: "url('/themes/lifestyle_coffee.png')", title: 'Warm Latte', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
    { id: 'apple-lifestyle-architecture', type: 'image', value: "url('/themes/lifestyle_architecture.png')", title: 'Minimal Architecture', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
  ],
  'Premium Gradients': [
    { id: 'mesh-sunset', type: 'gradient', value: 'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%)', bgColor: '#fff', title: 'Sunset Mesh', textColor: '#1a1a1a', textShadow: 'none' },
    { id: 'mesh-ocean', type: 'gradient', value: 'radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%)', bgColor: '#fff', title: 'Ocean Mesh', textColor: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' },
    { id: 'mesh-dark', type: 'gradient', value: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)', bgColor: '#111', title: 'Dark Aurora', textColor: '#fff', textShadow: 'none' },
    { id: 'linear-silver', type: 'gradient', value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', bgColor: '#f5f7fa', title: 'Silver', textColor: '#111', textShadow: 'none' },
    { id: 'linear-plum', type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', bgColor: '#667eea', title: 'Plum Plate', textColor: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    { id: 'linear-deepspace', type: 'gradient', value: 'linear-gradient(135deg, #000000 0%, #434343 100%)', bgColor: '#000', title: 'Deep Space', textColor: '#fff', textShadow: 'none' },
    { id: 'linear-peach', type: 'gradient', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', bgColor: '#ff9a9e', title: 'Peach', textColor: '#111', textShadow: 'none' },
    { id: 'linear-emerald', type: 'gradient', value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', bgColor: '#0ba360', title: 'Emerald', textColor: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' },
    { id: 'linear-sky', type: 'gradient', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', bgColor: '#89f7fe', title: 'Clear Sky', textColor: '#111', textShadow: 'none' },
    { id: 'linear-midnight', type: 'gradient', value: 'linear-gradient(135deg, #3023AE 0%, #53A0FD 100%)', bgColor: '#3023AE', title: 'Midnight', textColor: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }
  ],
  'Minimal Solid': [
    { id: 'solid-black', type: 'solid', value: '#111111', title: 'Pitch Black', textColor: '#f4f4f5', textShadow: 'none' },
    { id: 'solid-white', type: 'solid', value: '#fafafa', title: 'Off White', textColor: '#111111', textShadow: 'none' },
    { id: 'solid-graphite', type: 'solid', value: '#1a1a1a', title: 'Graphite', textColor: '#ededed', textShadow: 'none' },
    { id: 'solid-zinc', type: 'solid', value: '#f4f4f5', title: 'Zinc Light', textColor: '#18181b', textShadow: 'none' },
    { id: 'solid-royal', type: 'solid', value: '#0f172a', title: 'Royal Navy', textColor: '#fff', textShadow: 'none' },
    { id: 'solid-forest', type: 'solid', value: '#064e3b', title: 'Forest Green', textColor: '#fff', textShadow: 'none' },
    { id: 'solid-crimson', type: 'solid', value: '#7f1d1d', title: 'Crimson', textColor: '#fff', textShadow: 'none' },
    { id: 'solid-beige', type: 'solid', value: '#fdfbf7', title: 'Warm Beige', textColor: '#111', textShadow: 'none' },
    { id: 'solid-slate', type: 'solid', value: '#334155', title: 'Slate Blue', textColor: '#fff', textShadow: 'none' },
    { id: 'solid-purple', type: 'solid', value: '#3b0764', title: 'Deep Purple', textColor: '#fff', textShadow: 'none' }
  ],
  'Textures': [
    { id: 'pattern-dots', type: 'texture', value: 'radial-gradient(#333 1px, #111 1px)', bgColor: '#111', bgSize: '20px 20px', title: 'Dots Dark', textColor: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
    { id: 'pattern-dots-light', type: 'texture', value: 'radial-gradient(#ddd 1px, #fafafa 1px)', bgColor: '#fafafa', bgSize: '20px 20px', title: 'Dots Light', textColor: '#111', textShadow: 'none' },
    { id: 'grid-dark', type: 'texture', value: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', bgColor: '#111', bgSize: '20px 20px', title: 'Grid Dark', textColor: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
    { id: 'grid-light', type: 'texture', value: 'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)', bgColor: '#fafafa', bgSize: '20px 20px', title: 'Grid Light', textColor: '#111', textShadow: 'none' },
    { id: 'lines-h-dark', type: 'texture', value: 'linear-gradient(#333 1px, transparent 1px)', bgColor: '#111', bgSize: '20px 20px', title: 'Lines H Dark', textColor: '#fff', textShadow: 'none' },
    { id: 'lines-h-light', type: 'texture', value: 'linear-gradient(#eee 1px, transparent 1px)', bgColor: '#fafafa', bgSize: '20px 20px', title: 'Lines H Light', textColor: '#111', textShadow: 'none' },
    { id: 'lines-v-dark', type: 'texture', value: 'linear-gradient(90deg, #333 1px, transparent 1px)', bgColor: '#111', bgSize: '20px 20px', title: 'Lines V Dark', textColor: '#fff', textShadow: 'none' },
    { id: 'lines-v-light', type: 'texture', value: 'linear-gradient(90deg, #eee 1px, transparent 1px)', bgColor: '#fafafa', bgSize: '20px 20px', title: 'Lines V Light', textColor: '#111', textShadow: 'none' },
    { id: 'crosshatch-dark', type: 'texture', value: 'linear-gradient(45deg, #333 1px, transparent 1px), linear-gradient(-45deg, #333 1px, transparent 1px)', bgColor: '#111', bgSize: '20px 20px', title: 'Crosshatch Dark', textColor: '#fff', textShadow: 'none' },
    { id: 'crosshatch-light', type: 'texture', value: 'linear-gradient(45deg, #eee 1px, transparent 1px), linear-gradient(-45deg, #eee 1px, transparent 1px)', bgColor: '#fafafa', bgSize: '20px 20px', title: 'Crosshatch Light', textColor: '#111', textShadow: 'none' }
  ],
  'Premium Photography': [
    { id: 'photo-glass-orb', type: 'image', value: "url('/backgrounds/apple_glass_orb_1783185570034.png')", title: 'Glass Orb', textColor: '#2d3748', textShadow: 'none' },
    { id: 'photo-liquid-metal', type: 'image', value: "url('/backgrounds/apple_liquid_metal_1783185604890.png')", title: 'Liquid Metal', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' },
    { id: 'photo-architecture', type: 'image', value: "url('/backgrounds/apple_architecture_1783185623060.png')", title: 'Minimal Architecture', textColor: '#1a202c', textShadow: 'none' },
    { id: 'photo-frosted-glass', type: 'image', value: "url('/backgrounds/apple_frosted_glass_1783185641848.png')", title: 'Frosted Glass', textColor: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' },
    { id: 'photo-white-feather', type: 'image', value: "url('/backgrounds/apple_white_feather_1783185578375.png')", title: 'White Feather', textColor: '#2d3748', textShadow: 'none' },
    { id: 'photo-majestic-cat', type: 'image', value: "url('/backgrounds/apple_majestic_cat_1783185587198.png')", title: 'Majestic Cat', textColor: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' },
    { id: 'photo-serene-swan', type: 'image', value: "url('/backgrounds/apple_serene_swan_1783185596043.png')", title: 'Serene Swan', textColor: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' },
    { id: 'photo-minimalist-bird', type: 'image', value: "url('/backgrounds/apple_minimalist_bird_1783185631921.png')", title: 'Minimalist Bird', textColor: '#2d3748', textShadow: 'none' },
    { id: 'photo-shiba-inu', type: 'image', value: "url('/backgrounds/apple_shiba_inu_1783185614436.png')", title: 'Shiba Inu', textColor: '#4a5568', textShadow: 'none' },
    { id: 'photo-snow-fox', type: 'image', value: "url('/backgrounds/apple_snow_fox_1783185650317.png')", title: 'Snow Fox', textColor: '#2d3748', textShadow: 'none' }
  ],
  'Pet Photography': [
    { id: 'pet-golden-retriever', type: 'image', value: "url('/backgrounds/pet_golden_retriever_1783186552390.png')", title: 'Golden Retriever', textColor: '#4a5568', textShadow: 'none' },
    { id: 'pet-siamese-cat', type: 'image', value: "url('/backgrounds/pet_siamese_cat_1783186561072.png')", title: 'Siamese Cat', textColor: '#2d3748', textShadow: 'none' },
    { id: 'pet-corgi', type: 'image', value: "url('/backgrounds/pet_corgi_1783186570079.png')", title: 'Corgi', textColor: '#2d3748', textShadow: 'none' },
    { id: 'pet-persian-cat', type: 'image', value: "url('/backgrounds/pet_persian_cat_1783186578926.png')", title: 'Persian Cat', textColor: '#4a5568', textShadow: 'none' },
    { id: 'pet-pug', type: 'image', value: "url('/backgrounds/pet_pug_1783186587490.png')", title: 'Pug', textColor: '#2d3748', textShadow: 'none' },
    { id: 'pet-beagle', type: 'image', value: "url('/backgrounds/pet_beagle_1783186595490.png')", title: 'Beagle', textColor: '#2d3748', textShadow: 'none' },
    { id: 'pet-ragdoll-cat', type: 'image', value: "url('/backgrounds/pet_ragdoll_cat_1783186605130.png')", title: 'Ragdoll Cat', textColor: '#1a202c', textShadow: 'none' },
    { id: 'pet-husky', type: 'image', value: "url('/backgrounds/pet_husky_1783186613291.png')", title: 'Siberian Husky', textColor: '#2d3748', textShadow: 'none' },
    { id: 'pet-dachshund', type: 'image', value: "url('/backgrounds/pet_dachshund_1783186621942.png')", title: 'Dachshund', textColor: '#1a202c', textShadow: 'none' },
    { id: 'pet-scottish-fold', type: 'image', value: "url('/backgrounds/pet_scottish_fold_1783186630022.png')", title: 'Scottish Fold', textColor: '#1a202c', textShadow: 'none' }
  ]
};

/**
 * Returns a proper inline style object for any background entry.
 * This avoids CSS shorthand issues in React by using explicit longhand properties.
 */
export function getBgStyle(bgObj, position = 'center') {
  if (!bgObj) return { backgroundColor: '#111' };

  // Map single keywords to two-dimensional values for robust browser/SVG rendering compatibility
  let resolvedPosition = 'center center';
  if (position === 'top') resolvedPosition = 'center top';
  else if (position === 'bottom') resolvedPosition = 'center bottom';

  switch (bgObj.type) {
    case 'image':
      return {
        backgroundImage: bgObj.value,
        backgroundColor: '#111',
        backgroundSize: 'cover',
        backgroundPosition: resolvedPosition,
        backgroundRepeat: 'no-repeat',
      };

    case 'texture':
      return {
        backgroundImage: bgObj.value,
        backgroundColor: bgObj.bgColor || '#111',
        backgroundSize: bgObj.bgSize || '20px 20px',
        backgroundRepeat: 'repeat',
      };

    case 'gradient':
      return {
        backgroundImage: bgObj.value,
        backgroundColor: bgObj.bgColor || '#fff',
      };

    case 'solid':
      return {
        backgroundColor: bgObj.value,
      };

    default:
      // Fallback for any legacy entries
      return {
        backgroundColor: bgObj.value || '#111',
      };
  }
}
