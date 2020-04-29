<script>
  import Modal from 'svelte-simple-modal';
  import { setContext } from 'svelte';
  import { theme } from './components/theme.js';
  import  HowBusyRegistration  from './components/HowBusyRegistration.svelte';
  import { key } from './components/firebase.js';

export let firebase;
export let colors = {};

theme.color(colors);

setContext(key, {
    getFirebase: () => firebase,
});

</script>

<Modal>
	<HowBusyRegistration />
</Modal>