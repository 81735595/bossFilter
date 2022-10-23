chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          urlContains:
            "https://www.zhipin.com/web/boss/recommend",
        },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
