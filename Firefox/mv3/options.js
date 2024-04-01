let redSlider = document.querySelector("#redSlider");
let greenSlider = document.querySelector("#greenSlider");
let blueSlider = document.querySelector("#blueSlider");
let alphaSlider = document.querySelector("#alphaSlider");
let redLabel = document.querySelector("#redLabel");
let greenLabel = document.querySelector("#greenLabel");
let blueLabel = document.querySelector("#blueLabel");
let alphaLabel = document.querySelector("#alphaLabel");
let resetBtn = document.querySelector("#reset");
let commandEditor = document.querySelector("#commandEditor");
let commandUpdate = document.querySelector("#commandUpdate");
let error = document.querySelector("#error");
let excludeList = document.querySelector("#excludeList");
let currClr;
let command;
async function setColor(currClr) {
  let backgroundScript = await browser.runtime.getBackgroundPage();
  browser.storage.sync.set({color: currClr});
  backgroundScript.setColor(currClr);
}
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
  command = (await browser.commands.getAll())[0].shortcut.split("+");
  commandEditor.value = command.join("+");
  excludeList.innerText = (await browser.storage.sync.get("exclude")).exclude.join("<br>");
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
commandEditor.onclick = () => {
  command = [];
  commandEditor.value = "";
  error.style.border = "none";
}
commandEditor.onkeydown = event => {
  event.preventDefault();
  event.stopPropagation();
  let key = event.key === "Control" ? "Ctrl" : event.key;
  if (!command.includes(key)) {
    command.push(key);
    commandEditor.value = command.join("+");
  }
}
commandUpdate.onclick = async () => {
  try {
    browser.commands.update({name: "toggleExclude", shortcut: command.join("+")})
  } catch {
    error.style.border = "1px solid red";
  };
}