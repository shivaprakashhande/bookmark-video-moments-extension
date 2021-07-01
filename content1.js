chrome.runtime.sendMessage({yt : true, startTime: document.querySelector("video").currentTime}, function(response) {
  console.log(response);
});