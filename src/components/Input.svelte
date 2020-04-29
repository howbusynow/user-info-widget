<script>
	import { themed } from './stylestore.js';
	import { flex_item, f2, input_icons, input_icon, input_field}from './util/Css.js';
	import { Icon, faVisible, faHidden } from  './util/icons.js';


	export let id;
	export let placeholder;
	export let type = 'text';
	export let value = '';
	export let revealed = false;

	const revealToggle = (event) => {
		const input = event.currentTarget.nextElementSibling;

		if (!input) {
			return;
		}

		input.type = input.type === 'password' ? 'text' : 'password';
		revealed = !revealed;
	};

	const handleInput = (event) => {
		value = event.target.value;
	};
</script>

<div class="{flex_item} {f2} {input_icons}  mt-2" style="min-width:300px">
	<span on:click={revealToggle}>
		<Icon class="{input_icon} {$themed.input_icon}" data={revealed ? faVisible : faHidden} />
	</span>
	<input {id} {type} {value} placeholder={placeholder} on:input={handleInput} class="{input_field} {$themed.input_field}"/>

</div>
