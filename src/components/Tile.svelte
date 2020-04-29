<script>
	import { derived } from 'svelte/store';
	import { theme } from './theme.js';
	import { seed } from './stores.js';
	import Icon from './awesome/Icon.svelte';
	import { css } from 'emotion';
	import { blackOrWhite, brighten, darken } from './theme.js';
	import { fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	import { media } from './stores.js';

	const responsive = derived(media, ($media) => {
		return {
			tileContainer: css`
				min-height: ${$media.small ? '40px' : '80px'};
			`,
			contentItem: css`
				margin: ${$media.small ? '0.2em' : '0.5em'};
				min-width: ${$media.small ? '40px' : '80px'};
				font-size: ${$media.small ? '0.8em': '1.5em'};
			`,
			helpCss: css`
				font-size: ${$media.small ? '0.6em' : '1.1em'};
			`,
			scale: $media.small ? 2 : 3,
		};
	});

	const dispatch = createEventDispatcher();

	export let ordinal = 0;
	let idx = (ordinal + $seed) % 9;
	let hovering = false;

	export let bgcolor = $theme.palate('theme')[idx];
	export let iconcolor = darken(bgcolor);
	export let color = blackOrWhite(bgcolor);
	export let help = null;
	export let icon = null;

	function enter(event) {
		hovering = true;
	}

	function leave(event) {
		hovering = false;
	}

	function handleClick(event) {
		dispatch('click', {
			ordinal: ordinal,
			text: 'Click! from tile ' + ordinal,
		});
	}

	function handleTap(event) {
		dispatch('click', {
			text: 'Tap! from tile ' + ordinal,
		});
	}

	const tileContainer = css`
		position: relative;
		margin: 0;
		padding: 0;
		color: ${color};
	`;

	const iconContainer = css`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin: auto;
		z-index: -1;
		color: ${iconcolor};
		overflow: hidden;
	`;

	const overlayContainer = css`
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-flow: column wrap;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		z-index: 1;
		overflow: hidden;
	`;

	const contentContainer = css`
		position: relative;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		display: flex;
		flex-flow: column wrap;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		color: ${color};
	`;

	const contentItem = css`
		position: relative;
	`;

	const helpCss = css`
		margin-top: auto;
		padding: auto;
		color: ${color};
	`;

	const ease = css`
		transition: all 0.5s ease;
	`;

	const active = css`
		background-color: ${iconcolor};
		color: ${bgcolor};
		${ease}
	`;
	const inactive = css`
		background-color: ${bgcolor};
		color: ${iconcolor};
		${ease}
	`;
	const overlay = css`
		background-color: rgba(2, 2, 2, 0.2);
		${ease}
	`;

	const visible = '';
	const hidden = css`
		visibility: hidden;
	`;

	$: classes =
		`${tileContainer} ${$responsive.tileContainer}` +
		($$props.class ? ' ' + $$props.class : '');
</script>

<div
	class={classes}
	in:fly={{ x: -20 * ordinal, duration: 500 + 100 * ordinal }}
	on:mouseenter={enter}
	on:mouseleave={leave}
	on:click={handleClick}
	on:tap={handleTap}>

	<div class="{iconContainer} {hovering ? active : inactive}">
		{#if icon}
			<Icon scale={$responsive.scale} data={icon} />
		{/if}

	</div>

	<div class={contentContainer}>
		<div class="{contentItem} {$responsive.contentItem}">
			<slot>
				<span>Tile: {ordinal}</span>
			</slot>
		</div>
	</div>

	{#if help}
		<div class="{overlayContainer} {hovering ? overlay : ''}">
			<span
				class="{helpCss}
				{$responsive.helpCss}
				{hovering ? visible : hidden}">
				{help}
			</span>
		</div>
	{/if}

</div>
