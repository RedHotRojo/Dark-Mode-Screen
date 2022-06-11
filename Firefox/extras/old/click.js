document.getElementsByClassName("btn")[0].addEventListener("click", (e) => {
  function logTabs(tabs) {
    for (let tab of tabs) {
      browser.tabs.executeScript(tab.id, {
        code: `if (document.getElementById("dark-mode-screen-extension")) {
          document.getElementById("dark-mode-screen-extension").remove();
        } else {
          let screen = document.createElement("div");
          screen.id = "dark-mode-screen-extension";
          screen.style.cssText = "width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; background-color: #222223; opacity: 0.4; z-index: 999999; pointer-events: none;";
          document.body.append(screen);
        }`
      });
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let querying = browser.tabs.query({});
  querying.then(logTabs, onError);
});