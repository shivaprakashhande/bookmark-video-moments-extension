chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
                console.log(request);
      document.querySelector("video").currentTime = request.startTime;

    if (request.yt) sendResponse({received: true});
  }
);