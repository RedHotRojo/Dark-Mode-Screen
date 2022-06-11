let excludeURLs;
let darkmode;
async function applyScreen() {
  if (!document.getElementById("dark-mode-screen-extension")) {
    let darkModeScreen = document.createElement("div");
    darkModeScreen.id = "dark-mode-screen-extension";
    let color = (await chrome.storage.local.get("color")).color || [36, 34, 33, 40];
    darkModeScreen.style.cssText = `width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; background-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 100}); z-index: 999999; pointer-events: none;`;
    document.body.append(darkModeScreen);
  }
}
function removeScreen() {
  if (document.getElementById("dark-mode-screen-extension")) {
    document.getElementById("dark-mode-screen-extension").remove();
  }
}
chrome.tabs.onUpdated.addListener((tabId, cInfo, tab) => {
  if (cInfo.status === "complete" && darkmode && !excludeURLs.includes(tab.url)) {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: applyScreen
    });
  }
});
(async () => {
  darkmode = (await chrome.storage.local.get("darkmode")).darkmode;
  excludeURLs = (await chrome.storage.sync.get("exclude")).exclude || [];
  if (darkmode) {
    chrome.action.setIcon({path: {"16": "toolbarIconOn16.png", "32": "toolbarIconOn32.png", "48": "toolbarIconOn48.png"}});
    let tabs = await chrome.tabs.query({});
    for (let tab of tabs) {
      if (!excludeURLs.includes(tab.url)) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: darkmode ? applyScreen : removeScreen
        });
      }
    }
  } else {
    chrome.action.setIcon({path: {"16": "toolbarIconOff16.png", "32": "toolbarIconOff32.png", "48": "toolbarIconOff48.png"}});
  }
})();