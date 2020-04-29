<script>
	import { theme } from './theme.js';
	import { FirebaseApp, User } from 'sveltefire';
	import Joiner from './Joiner.svelte';
	import UserInfo from './UserInfo.svelte';
	import { getContext } from 'svelte';
	import {key} from './firebase.js';

	let firebase = getContext(key).getFirebase();
	
</script>
	<div >

		<!-- 1. 🔥 Firebase App -->
		<FirebaseApp {firebase}>

			<!-- 2. 😀 Get the current user -->
			<User let:user let:auth>
				<div slot="signed-out">
					<Joiner {auth} signUp={true}/>				
				</div>
				
				<UserInfo {user} {auth} />

			</User>
		</FirebaseApp>

	</div>
<!-- Styles -->
