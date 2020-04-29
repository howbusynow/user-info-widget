import { css, keyframes } from 'emotion';

const spin= keyframes`
    0% {transform: rotate(0deg);}
    100% {transform: rotate(360deg);}
`;
  
// Icons
export const fa = {
    icon: css`
      display: inline-block;
      fill: currentColor;
    `,
    flip_horizontal: css`
      transform: scale(-1, 1);
      `,
    flip_vertical: css`
      transform: scale(1, -1);
      `,
    spin: css`
      animation: ${spin} 1s 0s infinite linear;
    `,
    inverse: css`
      color: #fff;
    `,
    pulse: css`
      animation: ${spin} 1s infinite steps(8);
    `
  };
  
 