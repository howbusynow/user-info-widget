# HowBusyNow User Info Widget
    User dashboard and signup widget for embedding in static howbusynow site

## What
* Connects to firebase and checks users login state
* if not logged in prompts to sign in/up using email link / email + password
* Once user is logged in checks for user profile doc, if missing prompts to complete profile
* if profile found shows panel with buttons for:
  * User 
  * likes
  * places
  * share
  * maps
  * link
  * donate
  * logout

## Requries Firebase


Install [Firebase CLI](https://firebase.google.com/docs/cli)

`firebase init`

* Connect to firebase project or create a new one
* Make sure hosting is selected
* edit `src\constant\index.js` to reflect correct settings for [Firebase dynamic links](https://firebase.google.com/docs/dynamic-links)


## TODO
* [ ] Wire up [passwordless authentication ](https://firebase.google.com/docs/auth/web/email-link-auth)
* [ ] Editable user proifile
* [ ] Function to generate shareable link on signup
* [ ] Finalise buttons that will be used in the info panel
* [ ] Provide drill down for buttons to display more info
* [ ] Link through to app
* [ ] Uer profile schema

