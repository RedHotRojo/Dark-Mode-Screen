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
function applyScreenInjection(darkmode) {
  if (darkmode && !document.getElementById("dark-mode-screen-extension")) {
    let darkModeScreen = document.createElement("div");
    darkModeScreen.id = "dark-mode-screen-extension";
    darkModeScreen.style.cssText = "width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; background-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 100}); z-index: 999999; pointer-events: none;";
    document.body.append(darkModeScreen);
  } else if (darkmode === false && document.getElementById("dark-mode-screen-extension")) {
    document.getElementById("dark-mode-screen-extension").remove();
  }
}
async function toggleDarkMode(tab) {
  if (checkSites(tab)) {
    browser.scripting.executeScript({target: {tab.id}, func: applyScreenInjection, args: [darkmode], injectImmediately: true});
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
browser.tabs.onCreated.addListener(toggleDarkMode);
browser.browserAction.onClicked.addListener(toolbarDark);
function setColorInjection(color) {
  if (document.getElementById("dark-mode-screen-extension")) {
    document.getElementById("dark-mode-screen-extension").style.backgroundColor = "rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 100})";
  }
}
async function setColor(clr) {
  color = [clr[0], clr[1], clr[2], clr[3]];
  let tabs = await browser.tabs.query({});
  for (let tab of tabs) {
    if (darkmode === true && checkSites(tab)) {
      browser.scripting.executeScript({target: {tab.id}, func: setColorInjection, args: [color], injectImmediately: true});
    }
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  darkmode = !(await browser.storage.sync.get("darkmode")).darkmode;
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