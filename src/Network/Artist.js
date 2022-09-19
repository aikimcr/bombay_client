import { getFromPath, getFromURLString, postToPath } from './Network';

export function fetchArtistList(urlString, query={}) {
    if (urlString) {
        return getFromURLString(urlString);
    }

    return getFromPath('artist', query);
}

export function fetchArtist(urlString) {
    return getFromURLString();
}
