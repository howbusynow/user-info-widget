<script>
	import {
		faUser,
		faMarker,
		faThumb,
		faHeart,
		faLink,
		faShare,
		faDonate,
		faMap,
	} from './util/icons.js';

	import { getContext } from 'svelte';
	import Suprise from './Suprrise.svelte';
	import { f4, nowrap } from './util/Css.js';

	import TilePannel from './TilePannel.svelte';
	import { buyMeACoffee, signOut } from './tiles.js';

	export let profile;

	export let auth;
	let user;

	console.log(profile.likes);
	const { open } = getContext('simple-modal');

	function handleClick(event) {
		open(Suprise, { message: event.detail.text });
	}

	function createTiles(profile) {
		return [
			{
				icon: faUser,
				handler: handleClick,
				flex: `${nowrap} ${f4}`,
				value: `<h5><strong>${profile.username}</strong></h5>`,
			},
			// { help: 'Thumb', icon: faThumb, handler: handleClick },
			{
				help: 'Likes',
				icon: faHeart,
				handler: handleClick,
				// value: `<i class="fas fa-arrow-right"></i>34<br/><i class="fas fa-arrow-left"></i>21`,
				value: profile.likes,
			},
			{
				help: 'Places',
				icon: faMarker,
				handler: handleClick,
				value: profile.places,
			},
			{
				help: 'Share',
				icon: faShare,
				handler: handleClick,
				value: profile.shares,
			},
			{ help: 'Maps', icon: faMap, handler: handleClick, value: '' },
			{
				help: 'Link',
				icon: faLink,
				handler: handleClick,
				value: '',
			},
			buyMeACoffee(),
			signOut(auth),
		];
	}
</script>

<TilePannel tiles={createTiles(profile)} />
