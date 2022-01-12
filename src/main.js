import './global.css';

import App from './App.svelte';

document.addEventListener('DOMContentLoaded', (event) => {
	const helloSvelte = document.querySelector('#hello-svelte');
	if (helloSvelte) {
		window.svelteApp = new App({
			target: helloSvelte,
			props: {
				name: 'world'
			}
		});
	}
});
