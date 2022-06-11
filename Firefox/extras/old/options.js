var list;
var listEl = document.querySelector("#list");
async function saveOptions(e) {
  e.preventDefault();
  var site = new URL(document.getElementById("insert").value).hostname;
  list = (await browser.storage.sync.get("exclude")).exclude || [];
  list.push(site);
  browser.storage.sync.set({
    exclude: list
  });
  listEl.innerText = list;
}

function restoreOptions() {
  function listSites(result) {
    list = result.exclude || [];
    listEl.innerText = list.length ? result.exclude : "All websites will be covered! You may enter a site that already has a dark mode option (like Youtube or Discord) or leave this empty. You can also middle-click the toolbar icon to quickly exclude a website when you visit it.";
  }
  function onError(error) {
    console.error(error);
  }
  let getting = browser.storage.sync.get("exclude");
  getting.then(listSites, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);