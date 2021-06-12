var darkmode = false;
var relax = 0;
var excludedSites = [];
var color = [36, 34, 33, 40];
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
          var darkModeScreen = document.createElement("div");
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
      var tabs = await browser.tabs.query({});
      darkmode = !darkmode;
      browser.browserAction.setIcon({path: darkmode ? "toolbarIconOn.jpeg" : "toolbarIconOff.jpeg"})
      for (let tab of tabs) {
        toggleDarkMode(tab);
      }
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
  var tabs = await browser.tabs.query({});
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
function windowClosed() {
  browser.storage.sync.set({
    darkmode: darkmode
  });
}
browser.windows.onRemoved.addListener(windowClosed)
document.addEventListener("DOMContentLoaded", async () => {
  darkmode = (await browser.storage.sync.get("darkmode")).darkmode;
  if (darkmode) browser.browserAction.setIcon({path: "toolbarIconOn.jpeg"});
  updateStorage();
});
browser.runtime.onInstalled.addListener(details => {
  if (details.reason === "update") {
    updateStorage();
    excludedSites = excludedSites.filter((v, i, a) => i === a.lastIndexOf(v) && v);
    browser.storage.sync.set({
      exclude: excludedSites
    });
  }
});