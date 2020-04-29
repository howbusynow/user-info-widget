import { faDonate, faUser, faSignOut } from './util/icons.js';

function buyMeACoffee() {
    return {
    help: 'Donate',
    icon: faDonate,
    handler: () => window.open('https://www.buymeacoffee.com/thekitchencoder'),
    value: ''
};}

function signOut(auth){
    return {
        help: 'Sign Out',
        icon: faSignOut,
        handler: () => auth.signOut(),
        value: '',
    }
}

export {
    buyMeACoffee,
    signOut
}