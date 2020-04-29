<script>
	
    import { signOut, buyMeACoffee } from './tiles.js';
    import { f4 } from './util/Css.js';
    import { faNoProfile } from './util/icons.js';
    import TilePannel from './TilePannel.svelte';
    import { responsive } from './stores.js';
    import { getContext } from 'svelte';

	import Suprise from './Suprrise.svelte';

	const { open } = getContext('simple-modal');

    export let user;
    export let auth;
    export let profileRef;

	function clickHandler(event) {
		open(Suprise, { message: event.detail.text });
	}

	let tiles = [
        {
            help: $responsive.text("Finish Profile","Do it Now!"),
            icon: faNoProfile,
            handler: () => profileRef.set({ uid: user.uid, title: 'My Profile' }),
            flex:f4,
            value: $responsive.text("Please complete your profile.", "<h5>Please complete your profile it won't take long</h5>")
        },
		
        buyMeACoffee(),
        signOut(auth),
	];
</script>

<TilePannel {tiles} />

