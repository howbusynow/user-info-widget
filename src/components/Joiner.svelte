<script>
	import SignUp from './SignUp.svelte';
	import SignIn from './SignIn.svelte';
	export let signUp = true;
	export let auth;

	function toggleSignUp() {
		signUp = !signUp;
	}
</script>

<div>
	<div>
		<div >
			{#if signUp}
				<SignUp {auth} {toggleSignUp} />
			{:else}
				<SignIn {auth} {toggleSignUp} />
			{/if}
		</div>
	</div>
</div>
