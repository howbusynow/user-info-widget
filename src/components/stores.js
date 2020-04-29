import {
    readable,
    writable,
    derived
} from 'svelte/store';
import watchMedia from "svelte-media";

const mediaQueries = {
    small: "(max-width: 767px)",
    large: "(min-width: 768px)",
}

export const media = watchMedia(mediaQueries);

export const responsive = derived(
    media,
    $media => createResponsiveHelper($media)
);

export let profile = writable({});

export let seed = readable(Math.floor(Math.random() * 10));

function createResponsiveHelper(media) {

    return {
        text: (sm, lg) => media.small ? sm : `${lg || sm}`,

    };
}