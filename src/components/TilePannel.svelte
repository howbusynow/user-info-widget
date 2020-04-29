<script>
import { flex_container, f1 } from './util/Css.js';
import Tile from './Tile.svelte';

export let tiles = [];

</script>

<div class={flex_container}>

	{#each tiles as { help, icon, handler, value, flex}, i}
		<Tile ordinal={i + 1} {icon} {help} class={flex || f1} on:click={handler}>
			<center>
				{@html value || ''}
			</center>
		</Tile>
	{/each}

</div>