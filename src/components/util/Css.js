import {
  css
} from 'emotion';

export const nowrap = css`white-space: nowrap;`;

export const title = css `
	font-size: 1em;
	${nowrap}
`;

export const icon = css `
  width: 1em;
  height: 1em;
  padding: 0.2em;
  text-align: center;
  overflow: visible;
`;

export const input_icons = css `
  width: auto; 
  margin: 0 0.25em;
`;

export const input_icon = css `
  position: absolute;
  margin-top: 0.9em;
  margin-left: 0.7em;
  width: 1.5em;
  height: 1.5em;
  vertical-align: middle;
  & :focus {
		outline: 0 !important;
	}
`;

export const input_field = css `
    width: 100%;
    box-sizing: border-box;
    border: 2px solid;
    border-radius: 5px;
    padding: 1em 1em 1em 3em;
    border-radius: 4px;
    font-size: 16px;
    background-color: white;
    text-align: left;
    overflow:hidden
`;
export const flex_container = css `
display: flex;
flex-flow: row wrap;
align-content: space-between
padding: 0;
margin: 0;
list-style: none;
`;
export const flex_item = css `

`;
export const f1 = css `
    flex: 1 0 0;
`;
export const f2 = css `
    flex: 2 0 0;
`;
export const f3 = css `
    flex: 3 0 0;
`;
export const f4 = css `
    flex: 4 0 0;
`;
export const f5 = css `
    flex: 5 0 0;
`;

export const rounded = css`
  border-radius: 10px;
  `;

export const button = css `
  width: auto;
  ${rounded}
  border: none;
  margin: 0 0.25em;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
`;

export const alert = css `
  padding: 20px;
  background-color: #222;
  border-radius: 5px;
  color: white;
  opacity: 1;
  transition: opacity 0.6s;
  margin-bottom: 15px;
  width: 100%;
  `;

export const danger = css ` background-color: #f44336;`;
export const success = css `background-color: #4CAF50;`;
export const info = css `background-color: #2196F3;`;
export const warning = css `background-color: #ff9800;`;

export const closebtn = css `
  margin-left: 15px;
  color: white;
  font-weight: bold;
  float: right;
  font-size: 22px;
  line-height: 20px;
  cursor: pointer;
  transition: 0.3s;
&:hover {
  color: black;
}`;

export const link = css `
  cursor: pointer;
  text-decoration: underline dotted;
  font-size: smaller;
  padding: 0.2em;
`;

export const tile = css `
  width: 300px;
	border: 1px solid #aaa;
	border-radius: 2px;
	box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
	padding: 1em;
`;

export const faIcon = css `
  width: auto;
  height: auto;
  text-align: center;
  overflow: visible;`;
