<script>
	import {fa} from '../faCss.js';

	let className;
	export { className as class };
	export let width;
	export let height;
	export let box;
	export let spin = false;
	export let inverse = false;
	export let pulse = false;
	export let flip = null;
	// optionals
	export let x = undefined;
	export let y = undefined;
	export let style = undefined;
	export let label = undefined;

	let classes =
		`${fa.icon} ${className}` +
		(spin ? ` ${fa.spin}` : '') +
		(pulse ? ` ${fa.pulse}` : '') +
		(inverse ? ` ${fa.inverse}` : '') +
		(flip === 'horizontal' ? ` ${fa.flip_horizontal}` : '') +
		(flip === 'vertical' ? ` ${fa.flip_vertical}` : '');
</script>

<svg
	version="1.1"
	class={classes}
	{x}
	{y}
	{width}
	{height}
	aria-label={label}
	role={label ? 'img' : 'presentation'}
	viewBox={box}
	{style}>
	<slot />
</svg>
