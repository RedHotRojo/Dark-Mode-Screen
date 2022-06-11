let fullBtn = document.getElementsByClassName("switchBtn")[0];
let middleBtn = document.getElementsByClassName("switchBtnMiddle")[0];
let redSlider = document.getElementById("redSlider");
let greenSlider = document.getElementById("greenSlider");
let blueSlider = document.getElementById("blueSlider");
let alphaSlider = document.getElementById("alphaSlider");
let redLabel = document.getElementById("redLabel");
let greenLabel = document.getElementById("greenLabel");
let blueLabel = document.getElementById("blueLabel");
let alphaLabel = document.getElementById("alphaLabel");
let resetBtn = document.getElementById("reset");
let toggleBtn = document.getElementById("toggle");
let currClr;
let toggle = false;
let thisTab;
let thisUrl;
let excludeURLs;
let darkmode = false;
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
async function btnClicked() {
  toggle = !toggle;
  if (!toggle) {
    middleBtn.classList.remove("greenAnim");
    middleBtn.classList.add("redAnim");
    let thisTabInArr = excludeURLs.indexOf(thisUrl);
    excludeURLs.splice(thisTabInArr, 1);
    await chrome.storage.sync.set({
      exclude: excludeURLs
    });
    setTimeout(() => {
      middleBtn.style.left = "0px";
      middleBtn.style.backgroundColor = "#ff1111";
      middleBtn.style.border = "2px solid #880000";
      middleBtn.style.boxShadow = "0px 0px 1px #ff1111";
    }, 1000);
    if (darkmode) {
      chrome.scripting.executeScript({
        target: {tabId: thisTab.id},
        func: applyScreen
      });
    }
  } else {
    middleBtn.classList.add("greenAnim");
    middleBtn.classList.remove("redAnim");
    if (excludeURLs.indexOf(thisUrl) === -1) {
      excludeURLs.push(thisUrl);
      chrome.storage.sync.set({
        exclude: excludeURLs
      });
    }
    setTimeout(() => {
      middleBtn.style.left = "19px";
      middleBtn.style.backgroundColor = "#11ff11";
      middleBtn.style.border = "2px solid #008800";
      middleBtn.style.boxShadow = "0px 0px 1px #11ff11";
    }, 1000);
    chrome.scripting.executeScript({
      target: {tabId: thisTab.id},
      func: removeScreen
    });
  }
}
async function setColor() {
  chrome.storage.local.set({color: currClr});
  if (darkmode) {
    let tabs = await chrome.tabs.query({});
    for (let tab of tabs) {
      if (!excludeURLs.includes(tab.url)) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: async () => {
            if (document.getElementById("dark-mode-screen-extension")) {
              let color = (await chrome.storage.local.get("color")).color || [36, 34, 33, 40];
              document.getElementById("dark-mode-screen-extension").style.backgroundColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 100})`;
            }
          }
        });
      }
    }
  }
}
document.addEventListener("DOMContentLoaded", async function() {
  darkmode = (await chrome.storage.local.get("darkmode")).darkmode;
  currClr = (await chrome.storage.local.get("color")).color || [36, 34, 33, 40];
  redLabel.textContent = "Red: " + currClr[0];
  greenLabel.textContent = "Green: " + currClr[1];
  blueLabel.textContent = "Blue: " + currClr[2];
  alphaLabel.textContent = "Alpha: " + currClr[3];
  redSlider.value = Number(currClr[0]);
  greenSlider.value = Number(currClr[1]);
  blueSlider.value = Number(currClr[2]);
  alphaSlider.value = Number(currClr[3]);
  excludeURLs = (await chrome.storage.sync.get("exclude")).exclude || [];
  thisTab = (await chrome.tabs.query({active: true, currentWindow: true}))[0]
  thisUrl = new URL(thisTab.url).hostname;
  if (excludeURLs.length && excludeURLs.includes(thisUrl)) {
    fullBtn.click();
  }
  fullBtn.addEventListener("click", btnClicked);
  redSlider.addEventListener("input", event => {
    currClr[0] = event.target.value;
    redLabel.textContent = "Red: " + currClr[0];
    setColor();
  });
  greenSlider.addEventListener("input", event => {
    currClr[1] = event.target.value;
    greenLabel.textContent = "Green: " + currClr[1];
    setColor();
  });
  blueSlider.addEventListener("input", event => {
    currClr[2] = event.target.value;
    blueLabel.textContent = "Blue: " + currClr[2];
    setColor();
  });
  alphaSlider.addEventListener("input", event => {
    currClr[3] = event.target.value;
    alphaLabel.textContent = "Alpha: " + currClr[3];
    setColor();
  });
  resetBtn.addEventListener("click", () => {
    currClr = [36, 34, 33, 40];
    redLabel.textContent = "Red: " + currClr[0];
    greenLabel.textContent = "Green: " + currClr[1];
    blueLabel.textContent = "Blue: " + currClr[2];
    alphaLabel.textContent = "Alpha: " + currClr[3];
    redSlider.value = currClr[0];
    greenSlider.value = currClr[1];
    blueSlider.value = currClr[2];
    alphaSlider.value = currClr[3];
    chrome.storage.local.set({color: currClr});
  });
  toggleBtn.addEventListener("click", async () => {
    let tabs = await chrome.tabs.query({});
    darkmode = !darkmode;
    if (darkmode) {
      chrome.action.setIcon({path: {"16": "toolbarIconOn16.png", "32": "toolbarIconOn32.png", "48": "toolbarIconOn48.png"}});
    } else {
      chrome.action.setIcon({path: {"16": "toolbarIconOff16.png", "32": "toolbarIconOff32.png", "48": "toolbarIconOff48.png"}});
    }
    for (let tab of tabs) {
      if (!excludeURLs.includes(tab.url)) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: darkmode ? applyScreen : removeScreen
        });
      }
    }
    chrome.storage.local.set({
      darkmode: darkmode
    });
  });
});