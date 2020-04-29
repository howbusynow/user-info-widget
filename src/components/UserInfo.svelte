<script>
	import { Doc, Collection } from 'sveltefire';
	import Spinner from './Spinner.svelte';

	import DashStrip from './DashStrip.svelte';
	import ProfileIncomplete from './ProfileIncomplete.svelte';

	export let user;
	export let auth;

	let profile;
</script>

<!-- 3. 📜 Get a Firestore document owned by a user -->
<Doc
	path={`queue/${user.uid}`}
	let:data={profile}
	let:ref={profileRef}
	log>

	<DashStrip {auth} {user} {profile} />

	<div slot="fallback">
		<!-- This bit if the user profile isn't complete -->
		<ProfileIncomplete {auth} {user} {profileRef} />
	</div>

	<span slot="loading">
		<Spinner />
	</span>

</Doc>
