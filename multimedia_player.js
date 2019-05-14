// file should be an array
// BEPRESS_SW_HOST
const BEPRESS_SW_HOST = "blues.qa1.bdev.us";
let page_uri = encodeURI(window.location.href);

function display_video_player(element, streamingEndpoint, video_image_url, video_title) {
  const BEPRESS_SW_HOST = "blues.qa1.bdev.us";
  var pageURI = document.location.protocol + '//' + document.location.hostname + document.location.pathname;
  let latestPos = 0;
  var mediaDuration = 0;
  let start_sent = false;
  let fifty_sent = false;
  let thirty_sent =false;

  jwplayer(element).setup({
      "playlist": [{
          "sources": [
              {
                file: streamingEndpoint,
                "default": 'true'
              }
              ],
          "title": video_title,
          "image": video_image_url,
          "tracks": []
          }],
      "startparam": '0',
      "rtmp": {
          bufferlength: '0.1'
      },
      "ga": {},
      "width": '480',
  });

  function response (res) {
    console.log(res);
  }

  function adobe_analytics_callback (result) {
    console.log("AA calback", result);
  }

  function adobe_analytics_request (event) {
    videoData = {
      video: {
        'id': encodeURIComponent(pageURI),
        'length': mediaDuration,
        'position': latestPos
      }
    };
    console.log("[AA]", pageURI, event, videoData);
    pageDataTracker.trackEvent(event, videoData);
  }

  function bs_dashboard_request (event) {
    var url = "https://" + BEPRESS_SW_HOST + "/do/tracking-stream/?article_uri=" + streamingEndpoint + "&event=" + event;
    var request = new XMLHttpRequest();
    request.addEventListener("load", response);
    request.open("GET", url, response);
    request.send();
  }

  function startEventListener (result) {
    if (start_sent) {
      adobe_analytics_request("videoPlay");
    }
  }

  function pauseEventListener (result) {
    adobe_analytics_request("videoStop");
  }

  function timeEventListener (result) {
    var percentage = result.position/result.duration;
    mediaDuration = result.duration;
    latestPos = result.position;
    if (!start_sent) {
        bs_dashboard_request("start");
        start_sent = true;
        adobe_analytics_request("videoStart");
    }
    if (percentage > .5) {
      if (!fifty_sent) {
        bs_dashboard_request("50_pct");
        fifty_sent = true;
        adobe_analytics_request("event106");
      }
    }
    if (result.position > 30) {
      if (!thirty_sent) {
        bs_dashboard_request("30_sec");
        thirty_sent = true;
      }
    }
    if (percentage === 1) {
      bs_dashboard_request("complete");
      adobe_analytics_request("videoComplete");
    }
  }

  jwplayer(element).on('play', startEventListener);
  jwplayer(element).on('pause', pauseEventListener);
  jwplayer(element).on('time', timeEventListener);
}

var pageData = {
    page: {
        environment: 'elsevier-bpeg-dev',
        name: 'bpeg:media-player',
    }
};

// the video url, image url and title come from html page that has the element
// which is described in the first param
display_video_player("bp-video-player", streamingEndpoint, bp_video_image_url, bp_video_title);
