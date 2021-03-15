var fullBtn = document.getElementsByClassName("switchBtn")[0];
var middleBtn = document.getElementsByClassName("switchBtnMiddle")[0];
var redSlider = document.getElementById("redSlider");
var greenSlider = document.getElementById("greenSlider");
var blueSlider = document.getElementById("blueSlider");
var alphaSlider = document.getElementById("alphaSlider");
var redLabel = document.getElementById("redLabel");
var greenLabel = document.getElementById("greenLabel");
var blueLabel = document.getElementById("blueLabel");
var alphaLabel = document.getElementById("alphaLabel");
var resetBtn = document.getElementById("reset");
var currClr;
var toggle = false;
async function btnClicked() {
  var thisTab = (await browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}))[0]
  var thisUrl = new URL(thisTab.url).hostname;
  var currentUrls = (await browser.storage.sync.get("exclude")).exclude;
  toggle = !toggle;
  if (!toggle) {
    middleBtn.classList.remove("greenAnim");
    middleBtn.classList.add("redAnim");
    var thisTabInArr = currentUrls.indexOf(thisUrl);
    currentUrls.splice(thisTabInArr, 1);
    browser.storage.sync.set({
      exclude: currentUrls
    });
    setTimeout(() => {
      middleBtn.style.left = "0px";
      middleBtn.style.backgroundColor = "#ff1111";
      middleBtn.style.border = "2px solid #880000";
      middleBtn.style.boxShadow = "0px 0px 1px #ff1111";
    }, 1000);
    var backgroundScript = await browser.runtime.getBackgroundPage();
    backgroundScript.toggleDarkMode(thisTab);
  } else {
    middleBtn.classList.add("greenAnim");
    middleBtn.classList.remove("redAnim");
    if (currentUrls.indexOf(thisUrl) === -1) {
      currentUrls.push(thisUrl);
      browser.storage.sync.set({
        exclude: currentUrls
      });
    }
    setTimeout(() => {
      middleBtn.style.left = "19px";
      middleBtn.style.backgroundColor = "#11ff11";
      middleBtn.style.border = "2px solid #008800";
      middleBtn.style.boxShadow = "0px 0px 1px #11ff11";
    }, 1000);
    browser.tabs.executeScript(thisTab.id, {
      code: `if (document.getElementById("dark-mode-screen-extension")) {
        document.getElementById("dark-mode-screen-extension").remove();
      }`
    });
  }
}
async function setColor() {
  var backgroundScript = await browser.runtime.getBackgroundPage();
  backgroundScript.setColor(currClr);
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
document.addEventListener("DOMContentLoaded", async function() {
  currClr = (await browser.storage.sync.get("color")).color || [34, 34, 35, 40];
  redLabel.textContent = "Red: " + currClr[0];
  greenLabel.textContent = "Green: " + currClr[1];
  blueLabel.textContent = "Blue: " + currClr[2];
  alphaLabel.textContent = "Alpha: " + currClr[3];
  redSlider.value = Number(currClr[0]);
  greenSlider.value = Number(currClr[1]);
  blueSlider.value = Number(currClr[2]);
  alphaSlider.value = Number(currClr[3]);
  var urls = await browser.storage.sync.get("exclude");
  var check;
  var tab = await browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT});
  if (urls.exclude.length) {
    check = urls.exclude.map(url => {
      if (tab[0].url.indexOf(url) > -1) {
        return false;
      }
    }).includes(false);
    if (check) {
      fullBtn.click();
    }
  }
});
window.onblur = async () => browser.storage.sync.set({color: currClr});
resetBtn.onclick = () => {
  currClr = [34, 34, 35, 40];
  redLabel.textContent = "Red: " + 34;
  greenLabel.textContent = "Green: " + 34;
  blueLabel.textContent = "Blue: " + 34;
  alphaLabel.textContent = "Alpha: " + 40;
  redSlider.value = 34;
  greenSlider.value = 34;
  blueSlider.value = 35;
  alphaSlider.value = 40
}