async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function updateCurrentTab(tabId, properties) {
  let queryOptions = { active: true, ...properties };
  let [tab] = await chrome.tabs.update(tabId, queryOptions);
  return tab;
}

displayAllVideos();

document.getElementById('addVid').addEventListener('click', addVideo);

chrome.runtime.onMessage.addListener(listenerCB);

function listenerCB(request, sender, sendResponse) {
  var vData = {};
  getCurrentTab().then(tab => {
    vData.title     = tab.title;
    vData.startTime = request.startTime;
    vData.url       = sender.tab.url;
    vData.vId       = '__vId__' + new URLSearchParams(sender.tab.url.substring(sender.tab.url.indexOf('?'))).get('v') + '_' + vData.startTime;
    saveMoment(vData);
  })
}

function saveMoment ( vData ) {
  var key = `${vData.vId}_${vData.startTime}`;
  chrome.storage.local.set({[key]: vData}, function() {
    console.log('Data saved for ' + vData.vId);
    displayAddedMoment(vData);
  });
}

function prependZero ( n ) {
  return n < 10 ? '0' + n : n;
}

function displayAddedMoment ( vData ) {
  var li = document.createElement("li");
  var a = document.createElement("a");
  var startTime = `${prependZero(Math.floor(vData.startTime / 60))}:${prependZero(Math.floor(vData.startTime % 60))}`;
  a.classList.add('moment-list');
  a.dataset.vData = JSON.stringify(vData);
  a.textContent = `${vData.title} - ${startTime}`;
  li.append(a);
  document.querySelector('#savedMoments').append(li);
}

function displayAllVideos (  ) {
  chrome.storage.local.get(null, function(allMoments) {
    for (var moment in allMoments) {
      console.log(moment);
      displayAddedMoment (allMoments[moment]);
    }
  attachPlayEvent();
  });
}

function attachPlayEvent (  ) {
  Array.prototype.forEach.call(document.getElementsByClassName('moment-list'), function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var vData = JSON.parse(this.dataset.vData);
      checkUrl(vData.url).then(isSamePageUrl => {
        playVideo(vData.url, vData.startTime, isSamePageUrl);
      })
    })
  })
}

function checkUrl ( url ) {
  return getCurrentTab().then(tab => tab.url.split('?')[0] == url.split('?')[0]);
}

function addVideo() {
  getCurrentTab().then(tab => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content1.js']
    });
  });
}

function playVideo (vUrl, startTime, newTab) {
  console.log('in play ', vUrl, startTime);
  getCurrentTab().then(tab => {
  if (newTab) {
    updateCurrentTab(tab.id, {url : vUrl}).then(() => {
      console.log('current tab updated');
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content3.js']
      }).then(function() {
        chrome.tabs.sendMessage(tab.id, {yt:true, url : vUrl, startTime: startTime}, function(response) {
          console.log(response);
        });
      });
    })
  } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content2.js']
      }).then(function() {
        chrome.tabs.sendMessage(tab.id, {yt:true, url : vUrl, startTime: startTime}, function(response) {
          console.log(response);
        });
      });
    }
  })

}