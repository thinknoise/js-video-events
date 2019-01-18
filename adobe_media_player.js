
function trackEventHandler(e) {
  console('trackEventHandler', e)
}

var pageData = {
    page: {
        environment: 'elsevier-bpeg-dev',
        name: 'bpeg:media-player',
    }
};


function AdobeEventListener(result) {
  AaCall(result.type);
}

var fifty_sent = false;
var thirty_sent = false;

function timeEventListenerAdobe(result) {
  var percentage = result.position/result.duration;
  latestPos = result.position;
  if (percentage > .5) {
    if (!fifty_sent) {
      pageDataTracker.trackEvent("50_pct", pageData)
      //console.log("send 50% seen", result);
      fifty_sent = true;
    }
  }
  if (result.position > 30) {
    if (!thirty_sent) {
      pageDataTracker.trackEvent("30_sec", pageData)
      thirty_sent = true;
    }
  }
  if (percentage === 1) {
    pageDataTracker.trackEvent("media complete", pageData)
  }
}

function AaCall (eventString) {
  pageDataTracker.trackEvent(eventString, pageData)
}

jwplayer('bp-video-player').on('play', AdobeEventListener);
jwplayer('bp-video-player').on('pause', AdobeEventListener);
jwplayer('bp-video-player').on('time', timeEventListenerAdobe);
