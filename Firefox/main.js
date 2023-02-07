let darkmode = false;
let relax = 0;
let excludedSites = [];
let color = [36, 34, 33, 40];
async function updateVariables() {
  excludedSites = (await browser.storage.sync.get("exclude")).exclude || [];
  color = (await browser.storage.sync.get("color")).color || [36, 34, 33, 40];
}
function checkSites(tab) {
  return !excludedSites.includes(new URL(tab.url).hostname);
}
async function toggleDarkMode(tab) {
  if (checkSites(tab) && darkmode) {
    browser.tabs.executeScript(tab.id, {
      code: `if (!document.getElementById("dark-mode-screen-extension")) {
        let darkModeScreen = document.createElement("div");
        darkModeScreen.id = "dark-mode-screen-extension";
        darkModeScreen.style.cssText = "width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; background-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 100}); z-index: 9999999; pointer-events: none;";
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
function openPopup() {
  browser.browserAction.setPopup({popup: "popup.html"});
  browser.browserAction.openPopup();
  browser.browserAction.setPopup({popup: null});
}
async function toolbarDark(thisTab, click) {
  if (!relax) {
    relax = 1;
    if (click.button === 0) {
      let tabs = await browser.tabs.query({});
      darkmode = !darkmode;
      if (darkmode) {
        browser.browserAction.setIcon({path: {"16": "moon.svg", "32": "moon.svg", "48": "moon.svg", "64": "moon.svg", "128": "moon.svg"}});
      } else {
        browser.browserAction.setIcon({path: {"16": "sun.svg", "32": "sun.svg", "48": "sun.svg", "64": "sun.svg", "128": "sun.svg"}});
      }
      for (let tab of tabs) {
        toggleDarkMode(tab);
      }
      browser.storage.sync.set({
        darkmode: darkmode
      });
    } else if (click.button === 1) {
      openPopup();
    }
    setTimeout(() => relax = 0, 200);
  }
}
async function newTabDark(tabId, cInfo, tab) {
  toggleDarkMode(tab);
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
  darkmode = !(await browser.storage.sync.get("darkmode")).darkmode;
  browser.menus.create({onclick: openPopup, id: "brwsracshn", contexts: ["all"], title: "Open settings"});
  await toolbarDark(null, {button: 0});
  await updateVariables();
});
browser.runtime.onInstalled.addListener(async details => {
  if (details.reason === "update") {
    excludedSites = excludedSites.filter((v, i, a) => i === a.lastIndexOf(v) && v);
    browser.storage.sync.set({
      exclude: excludedSites
    });
    await updateVariables();
  } else if (details.reason === "install") {
    browser.storage.sync.set({
      darkmode: darkmode,
      exclude: excludedSites,
      color: color
    });
  }
});