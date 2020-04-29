<script>
	import { fade, fly } from 'svelte/transition';
	import { themed } from './stylestore.js';
	import {
		flex_container,
		flex_item,
		f1,
		f5,
		input_icons,
		input_icon,
		input_field,
		button,
		link,
		alert,
		success,
		danger,
		closebtn,
	} from './util/Css.js';
	import { Icon, faEnvelope}  from './util/icons.js';
	import Spinner from './Spinner.svelte';

	import { actionCodeSettings } from '../constants';

	export let auth;
	export let toggleSignUp;

	let email = '';
	let sent = null;

	function handleSubmit(event) {
		console.log(event);
		console.log(event.target);
		console.log(event.target.email.value);
		sent = auth.sendSignInLinkToEmail(email, actionCodeSettings);
	}

	function reset() {
		sent = null;
		email = null;
	}
</script>

{#if sent == null}
	<form
		on:submit|preventDefault={handleSubmit}
		in:fly={{ x: -20, duration: 1000 }}>

		<div class={flex_container}>
			<div class="{flex_item} {f5} {input_icons} ">
				<Icon class="{input_icon} {$themed.input_icon}" data={faEnvelope} />
				<input
					class="{input_field} {$themed.input_field}"
					type="email"
					name="email"
					bind:value={email}
					placeholder="Email.." />
			</div>
			<button class="{flex_item} {f1} {button} {$themed.button}">
				Join in
			</button>
		</div>
		<p class={link} on:click={toggleSignUp}>
			Already helping out? Sign in instead.
		</p>
	</form>
{:else}
	<div in:fly={{ x: -20, duration: 1000 }}>

		{#await sent}
			<Spinner  />
		{:then result}
			<div class="{alert} {success}" in:fade>
				<span on:click={reset} class={closebtn}>&times;</span>
				<strong>Thanks!</strong>
				We've sent an email to {email} with further instructions ...
			</div>
		{:catch error}
			<div class="{alert} " in:fade>
				<span on:click={reset} class={closebtn}>&times;</span>
				<strong>Oh no!</strong>
				Somthing went wrong - {error.message}
			</div>
		{/await}
	</div>
{/if}
