<script>
    import { button } from './util/Css.js';
    import {themed} from './stylestore.js';
	import Tile from './Tile.svelte';
	
	export let auth;

</script>


	<button
		class="{button} {$themed.button} mt-2 "
		on:click={() => auth.signOut()}>
		Sign Out
	</button>

