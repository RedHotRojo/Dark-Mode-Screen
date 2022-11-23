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
let currClr;
let toggle = false;
async function btnClicked() {
  let thisTab = (await browser.tabs.query({active: true, currentWindow: true}))[0]
  let thisUrl = new URL(thisTab.url).hostname;
  let currentUrls = (await browser.storage.sync.get("exclude")).exclude || [];
  toggle = !toggle;
  if (!toggle) {
    middleBtn.classList.remove("greenAnim");
    middleBtn.classList.add("redAnim");
    let thisTabInArr = currentUrls.indexOf(thisUrl);
    currentUrls.splice(thisTabInArr, 1);
    setTimeout(() => {
      middleBtn.style.left = "0px";
      middleBtn.style.backgroundColor = "#ff1111";
      middleBtn.style.border = "2px solid #880000";
      middleBtn.style.boxShadow = "0px 0px 1px #ff1111";
    }, 1000);
  } else {
    middleBtn.classList.remove("redAnim");
    middleBtn.classList.add("greenAnim");
    if (currentUrls.indexOf(thisUrl) === -1) {
      currentUrls.push(thisUrl);
    }
    setTimeout(() => {
      middleBtn.style.left = "19px";
      middleBtn.style.backgroundColor = "#11ff11";
      middleBtn.style.border = "2px solid #008800";
      middleBtn.style.boxShadow = "0px 0px 1px #11ff11";
    }, 1000);
  }
  browser.storage.sync.set({
    exclude: currentUrls
  });
  let backgroundScript = await browser.runtime.getBackgroundPage();
  backgroundScript.updateVariables();
  backgroundScript.toggleDarkMode(thisTab);
}
async function setColor(currClr) {
  let backgroundScript = await browser.runtime.getBackgroundPage();
  browser.storage.sync.set({color: currClr});
  backgroundScript.setColor(currClr);
}
fullBtn.addEventListener("click", btnClicked);
redSlider.addEventListener("input", event => {
  currClr[0] = event.target.value;
  redLabel.textContent = "Red: " + currClr[0];
  setColor(currClr);
});
greenSlider.addEventListener("input", event => {
  currClr[1] = event.target.value;
  greenLabel.textContent = "Green: " + currClr[1];
  setColor(currClr);
});
blueSlider.addEventListener("input", event => {
  currClr[2] = event.target.value;
  blueLabel.textContent = "Blue: " + currClr[2];
  setColor(currClr);
});
alphaSlider.addEventListener("input", event => {
  currClr[3] = event.target.value;
  alphaLabel.textContent = "Alpha: " + currClr[3];
  setColor(currClr);
});
document.addEventListener("DOMContentLoaded", async function() {
  currClr = (await browser.storage.sync.get("color")).color || [36, 34, 33, 40];
  redLabel.textContent = "Red: " + currClr[0];
  greenLabel.textContent = "Green: " + currClr[1];
  blueLabel.textContent = "Blue: " + currClr[2];
  alphaLabel.textContent = "Alpha: " + currClr[3];
  redSlider.value = Number(currClr[0]);
  greenSlider.value = Number(currClr[1]);
  blueSlider.value = Number(currClr[2]);
  alphaSlider.value = Number(currClr[3]);
  let urls = (await browser.storage.sync.get("exclude")).exclude || [];
  let tab = (await browser.tabs.query({active: true, currentWindow: true}))[0];
  if (urls.length && urls.includes(new URL(tab.url).hostname)) {
    fullBtn.click();
  }
});
resetBtn.onclick = () => {
  currClr = [36, 34, 33, 40];
  redLabel.textContent = "Red: " + currClr[0];
  greenLabel.textContent = "Green: " + currClr[1];
  blueLabel.textContent = "Blue: " + currClr[2];
  alphaLabel.textContent = "Alpha: " + currClr[3];
  redSlider.value = currClr[0];
  greenSlider.value = currClr[1];
  blueSlider.value = currClr[2];
  alphaSlider.value = currClr[3];
  browser.storage.sync.set({color: currClr});
}