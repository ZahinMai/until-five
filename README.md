# Until Five

A small React and Vite quest app for Monica and Zahin.

## Run locally

```bash
npm install
npm run dev
```

## Progress

Choose a player on the welcome screen. Your selected player and completed
quests are saved in this browser with `localStorage`, separately for Monica and
Zahin, and restored when you reopen the app. The companion tab shows the other
player's quest progress without allowing edits. Progress is not shared between
different browsers or devices.

To clear saved progress, open the browser's developer console on the app's
origin and run:

```js
localStorage.removeItem("until-five.quest-progress.v1")
localStorage.removeItem("until-five.selected-player")
location.reload()
```

## Build

```bash
npm run build
```
