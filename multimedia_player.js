// file should be an array
// BEPRESS_SW_HOST
const BEPRESS_SW_HOST = "blues.qa1.bdev.us";
let page_uri = encodeURI(window.location.href);
function display_video_player(element, video_file_url, video_image_url, video_title) {
  const BEPRESS_SW_HOST = "blues.qa1.bdev.us";
  let latestPos = 0;
  let fifty_sent = false;
  let thirty_sent =false;

  jwplayer(element).setup({
      "playlist": [{
          "sources": [
              {
                file: video_file_url,
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

  function bs_dashboard_request (article_uri, event) {
    var url = "https://" + BEPRESS_SW_HOST + "/do/tracking-stream/?article_uri=" + article_uri + "&event=" + event;
    var request = new XMLHttpRequest();
    request.addEventListener("load", response);
    request.open("GET", url, response);
    request.send();
  }

  function bs_adobe_request(uri, e) {
    var url = "https://adobeanalytics" + uri + "&event=" + e;
    var request = new XMLHttpRequest();
    // request.addEventListener("load", response);
    // request.open("GET", url, response);
    // request.send();

  }

  function playEventListener (result) {
    let event = latestPos === 0 ? "start" : "play";
    bs_dashboard_request(page_uri, event);
    bs_adobe_request(adobe_uri, event);
    // console.log("play", result, latestPos);
  }

  function pauseEventListener (result) {
    bs_dashboard_request(page_uri, "pause");
    bs_adobe_request(adobe_uri, event);
    // console.log("pause", result);
  }

  function timeEventListener (result) {
    var percentage = result.position/result.duration;
    latestPos = result.position;
    if (percentage > .5) {
      if (!fifty_sent) {
        bs_dashboard_request(page_uri, "50_pct");
        console.log("send 50% seen", result);
        fifty_sent = true;
      }
    }
    if (result.position > 30) {
      if (!thirty_sent) {
        bs_dashboard_request(page_uri, "30_sec");
        console.log("send 30sec seen", result);
        thirty_sent = true;
      }
    }
    if (percentage === 1) {
      bs_dashboard_request(page_uri, "complete");
      console.log("video complete");
    }
    bs_adobe_request(adobe_uri, event);
  }

  jwplayer("hosted-streaming").on('play', playEventListener);
  jwplayer("hosted-streaming").on('pause', pauseEventListener);
  jwplayer("hosted-streaming").on('time', timeEventListener);
}

// the video url, image url and title come from html page that has the element
// which is described in the first param
display_video_player("bp-video-player", bp_video_source_url, bp_video_image_url, bp_video_title);
