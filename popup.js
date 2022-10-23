let messageArea = document.getElementById("message");

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const curTabId = tabs[0].id;
  chrome.tabs.executeScript(
    curTabId,
    {
      file: "judgeState.js",
      allFrames: false,
    },
    function (hasBossFliter) {
      if (hasBossFliter[0]) {
        messageArea.innerHTML = "running";
      } else {
        chrome.tabs.executeScript(
          curTabId,
          {
            file: "addFilter.js",
            allFrames: false,
          },
          function () {
            messageArea.innerHTML = "running";
          }
        );
      }
    }
  );
});
