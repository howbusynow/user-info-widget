export const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'https://howbusynow.com/finishSignUp',
    
    // This must be true.
    handleCodeInApp: true,
    iOS: {
        bundleId: 'io.implex.howbusy',
    },
    android: {
        packageName: 'io.implex.howbusy',
        installApp: true,
        minimumVersion: '28',
    },
    dynamicLinkDomain: 'howbusy.link'
};