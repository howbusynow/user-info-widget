<script>
	import { fade, fly } from 'svelte/transition';
	import { themed } from './stylestore.js';
	import {
		flex_container,
		flex_item,
		f1,
		f2,
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
	import {Icon, faEnvelope}  from './util/icons.js';
	
	import Input from './Input.svelte';
	import Spinner from './Spinner.svelte';

	export let auth;
	export let toggleSignUp;

	let email = '';
	let password = '';
	let sent = null;

	async function doLogin() {
		try {
			await auth.signInWithEmailAndPassword(email, password);
		} catch (err) {
			switch (err.code) {
				case 'auth/user-not-found':
				case 'auth/wrong-password':
					throw new Error(
						'the email address or password is incorrect.'
					);
				case 'auth/user-disabled':
					throw new Error('this account has been disabled.');
				case 'auth/invalid-email':
					throw new Error(
						'the email address is not ina a valid format'
					);
				default:
					throw new Error('try again in a few minutes.');
			}
		}
	}

	function handleSubmit(event) {
		sent = doLogin();
	}

	function reset() {
		sent = null;
	}
</script>

{#if sent == null}
	<form
		on:submit|preventDefault={handleSubmit}
		in:fly={{ x: -20, duration: 1000 }}>

		<div class={flex_container}>
			<div
				class="{flex_item}
				{f2}
				{input_icons} mt-2"
				style="min-width:300px">
				<Icon class="{input_icon} {$themed.input_icon}" data={faEnvelope} />
				<input
					class="{input_field} {$themed.input_field}"
					type="email"
					name="email"
					bind:value={email}
					placeholder="Email.." />
			</div>

			<Input
				type="password"
				id="password"
				bind:value={password}
				placeholder="Password.." />

			<button
				class="{flex_item} {$themed.button}
				{f1}
				{button} mt-2"
				style="min-width:300px; min-height:3.5em">
				Sign in
			</button>
		</div>
		<p class="{link} {flex_item}" on:click={toggleSignUp}>
			I don't have a password.
		</p>
	</form>
{:else}
	<div in:fly={{ x: -20, duration: 1000 }}>

		{#await sent}
			<Spinner />
		{:then result}
			<div class="{alert} {success}" in:fade>
				<strong>Thanks!</strong>
				We're logging you in now
			</div>
		{:catch error}
			<div class="{alert} {danger} " in:fade>
				<span on:click={reset} class={closebtn}>&times;</span>
				<strong>Oh no!</strong>
				Somthing went wrong - {error.message}
			</div>
		{/await}
	</div>
{/if}
