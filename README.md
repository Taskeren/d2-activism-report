# Activism Report

Activism Report is a Destiny 2 Activity History Tracker, designed to make a way to have a quick review of your past
activities, also counting its amount and tagging the highlights.

## Notice for Usage

Activism Report retrieves data from Bungie API, which **the API itself have 1-2 minutes latency.**

Activism Report fetches the "Character Activity Histories", so if you switched to other characters in a single
instance of activity (which is someone else stays in the activity, not everybody go back to the orbit),
**they are duplicated, where one might be *completed* and others are *incomplete*.**

## Contribution

Contributions are welcomed!

### Translation

You can help with translations by editing the files in `/static/localization/YOUR_LANG.json`.
The file name is preferred to follow the ISO standard.

### Highlight Suggestion

You can tell what stats you are interested in to showed as the highlights.

You can see the whole data obtained from Bungie API in the JavaScript console in F12 Menu.

## Credits

- **ChenTL** helped a lot on discovering the Bungie API. He's nice!
- **Bungie API** also gives the opportunity to this, ~~although Bungie API is full of shit~~.