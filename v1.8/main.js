var darkmode = false;
var relax = 0;
async function checkSites(tab) {
  var urls = await browser.storage.sync.get("exclude");
  if (urls.exclude && urls.exclude.length) {
    return !urls.exclude.map(url => {
      if (tab.url.indexOf(url) > -1) {
        return false;
      }
    }).includes(false);
  }
  return true;
}
async function toggleDarkMode(tab) {
  if (await checkSites(tab)) {
    var clr = (await browser.storage.sync.get("color")).color || [34, 34, 35, 0.4];
    if (darkmode) {
      browser.tabs.executeScript(tab.id, {
        code: `if (!document.getElementById("dark-mode-screen-extension")) {
          var darkModeScreen = document.createElement("div");
          darkModeScreen.id = "dark-mode-screen-extension";
          darkModeScreen.style.cssText = "width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; background-color: rgba(${clr[0]}, ${clr[1]}, ${clr[2]}, ${clr[3] / 100}); z-index: 999999; pointer-events: none;";
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
try{
  if (cInfo.title) toggleDarkMode(tab);
}catch(e){}
}
browser.tabs.onUpdated.addListener(newTabDark);
function onError(error) {
  console.error(error);
}
browser.browserAction.onClicked.addListener(toolbarDark);
async function setColor(clr) {
  var tabs = await browser.tabs.query({});
  for (let tab of tabs) {
    if (darkmode === true) {
      if (await checkSites(tab)) {
        browser.tabs.executeScript(tab.id, {
          code: `if (document.getElementById("dark-mode-screen-extension")) {
            document.getElementById("dark-mode-screen-extension").style.backgroundColor = "rgba(${clr[0]}, ${clr[1]}, ${clr[2]}, ${clr[3] / 100})";
          }`
        });
      }
    }
  }
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
});