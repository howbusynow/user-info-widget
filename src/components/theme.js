import {
  writable
} from 'svelte/store';
import chroma from 'chroma-js';

function createStyle() {
  const {
    subscribe,
    set,
  } = writable(style({}));

  return {
    subscribe,
    color: (colors) => set(style(colors)),
    reset: () => set(style({}))
  }
}

export const theme = createStyle();



/*
 * Available colorBrewer palates:
 *
 *  OrRd,PuBu,BuPu,Oranges,BuGn,YlOrBr,YlGn,Reds,RdPu,Greens,YlGnBu,Purples,GnBu,Greys,
 *  YlOrRd,PuRd,Blues,PuBuGn,Spectral,RdYlGn,RdBu,PiYG,PRGn,RdYlBu,BrBG,RdGy,PuOr,Set2,
 *  Accent,Set1,Set3,Dark2,Paired,Pastel2,Pastel1
 */

function style(colors) {

  let primary = chroma.valid(colors.primary) ? chroma(colors.primary) : chroma('hotpink');
  let secondary = chroma.valid(colors.secondary) ? chroma(colors.secondary) : chroma('#2A4858');
  let tertiary = chroma.valid(colors.tertiary) ? chroma(colors.tertiary) : null;
  let colorList = [primary, secondary];
  if(tertiary){
    colorList.push(tertiary);
  }
  let scale = spread(colorList);

  function palate(name) {
    switch (name) {
      case 'primary':
        return spread(['#222222', primary, '#DDDDDD']);
      case 'secondary':
        return spread(['#222222', secondary, '#DDDDDD']);
      case 'theme':
        return scale;
      case 'helix':
        return chroma.cubehelix().scale().correctLightness().colors(9);
      default:
        return chroma.scale(name).correctLightness().colors(9);
    };

  };


  let theme = {
    primary: primary.css(),
    text: blackOrWhite(primary),
    secondary: secondary.css(),
    secondary_text: blackOrWhite(secondary),
    scale: scale.sort(() => Math.random() - 0.5),
    palate: palate
  };

  return theme;
}

function spread(colors, mode = 'lab') {
  return chroma.scale(colors).mode(mode).colors(9);
}

export function brighten(c, v=1){
  let color = chroma(c);
  return color.brighten(v).css();
}

export function darken(c, v=1){
  let color = chroma(c);
  return color.darken(v).css();
}

export function blackOrWhite(c) {
let color = chroma(c);
  var r = color.get('rgb.r');
  var g = color.get('rgb.g');
  var b = color.get('rgb.b');

  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ?
    '#000' :
    '#FFF';
}