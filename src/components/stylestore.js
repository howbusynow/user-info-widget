import {
  derived
} from 'svelte/store';
import {
  theme
} from './theme';
import {
  css
} from 'emotion';

export const themed = derived(theme, $theme => {
  return {
    title: css `
	color: ${$theme.primary};
	
`,

    input_icon: css `
  color: ${$theme.primary};
`,

    input_field: css `
    border: 2px solid ${$theme.primary};
`,


    button: css `
  background-color: ${$theme.primary};
  color: ${$theme.text};
`,

    bg_primary: css ` background-color: ${$theme.primary};`,
    bg_palate1: css ` background-color: ${$theme.scale[1]};`,
    bg_palate2: css ` background-color: ${$theme.scale[2]};`,
    bg_palate3: css ` background-color: ${$theme.scale[3]};`,
    bg_palate4: css ` background-color: ${$theme.scale[4]};`,
    bg_palate5: css ` background-color: ${$theme.scale[5]};`,
    bg_palate6: css ` background-color: ${$theme.scale[6]};`,
    bg_palate7: css ` background-color: ${$theme.scale[7]};`,
    bg_secondary: css ` background-color: ${$theme.secondary};`,
  
  };
});