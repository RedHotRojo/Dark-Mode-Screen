let darkmode = false;
let relax = 0;
let excludedSites = [];
let color = [36, 34, 33, 40];
async function updateStorage() {
  excludedSites = (await browser.storage.sync.get("exclude")).exclude || [];
  color = (await browser.storage.sync.get("color")).color || [36, 34, 33, 40];
}
function checkSites(tab) {
  return !excludedSites.includes(new URL(tab.url).hostname);
}
async function toggleDarkMode(tab) {
  if (checkSites(tab)) {
    if (darkmode) {
      browser.tabs.executeScript(tab.id, {
        code: `if (!document.getElementById("dark-mode-screen-extension")) {
          let darkModeScreen = document.createElement("div");
          darkModeScreen.id = "dark-mode-screen-extension";
          darkModeScreen.style.cssText = "width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; background-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 100}); z-index: 999999; pointer-events: none;";
          document.body.append(darkModeScreen);
        }`
      });
    } else {
      browser.tabs.executeScript(tab.id, {
        code: `if (document.getElementById("dark-mode-screen-extension")) {
          document.getElementById("dark-mode-screen-extension").remove();
        }`
      });
    }
  }
}
async function toolbarDark(thisTab, click) {
  if (!relax) {
    relax = 1;
    if (click.button === 0) {
      let tabs = await browser.tabs.query({});
      darkmode = !darkmode;
      if (darkmode) {
        browser.browserAction.setIcon({path: {"16": "toolbarIconOn16.png", "32": "toolbarIconOn32.png", "48": "toolbarIconOn48.png"}});
      } else {
        browser.browserAction.setIcon({path: {"16": "toolbarIconOff16.png", "32": "toolbarIconOff32.png", "48": "toolbarIconOff48.png"}});
      }
      for (let tab of tabs) {
        toggleDarkMode(tab);
      }
      browser.storage.sync.set({
        darkmode: darkmode
      });
    } else if (click.button === 1) {
      browser.browserAction.setPopup({popup: "popup.html"});
      browser.browserAction.openPopup();
      browser.browserAction.setPopup({popup: null});
    }
    setTimeout(() => relax = 0, 200);
  }
}
async function newTabDark(tabId, cInfo, tab) {
  if (cInfo.status === "complete") {
    toggleDarkMode(tab);
  }
}
browser.tabs.onUpdated.addListener(newTabDark);
browser.browserAction.onClicked.addListener(toolbarDark);
async function setColor(clr) {
  let tabs = await browser.tabs.query({});
  for (let tab of tabs) {
    if (darkmode === true && checkSites(tab)) {
      browser.tabs.executeScript(tab.id, {
        code: `if (document.getElementById("dark-mode-screen-extension")) {
          document.getElementById("dark-mode-screen-extension").style.backgroundColor = "rgba(${clr[0]}, ${clr[1]}, ${clr[2]}, ${clr[3] / 100})";
        }`
      });
    }
  }
  color = [clr[0], clr[1], clr[2], clr[3]];
}
document.addEventListener("DOMContentLoaded", async () => {
  darkmode = (await browser.storage.sync.get("darkmode")).darkmode;
  if (darkmode) browser.browserAction.setIcon({path: {"16": "toolbarIconOn16.png", "32": "toolbarIconOn32.png", "48": "toolbarIconOn48.png"}});
  await updateStorage();
});
browser.runtime.onInstalled.addListener(async details => {
  if (details.reason === "update") {
    await updateStorage();
    excludedSites = excludedSites.filter((v, i, a) => i === a.lastIndexOf(v) && v);
    browser.storage.sync.set({
      exclude: excludedSites
    });
  }
});