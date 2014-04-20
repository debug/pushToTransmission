// ==UserScript==
// @name        Torrent Delegate
// @namespace   http://www.reality-debug.co.uk
// @description Delegates clicks to server torrent client.
// @include     *
// @version     1
// ==/UserScript==

var debug = false;

var host = "http://192.168.1.3";
var subDir = "/transmission/rpc";
var port = "9091";
var webHost = host + ":" + port + subDir;

function postTorrentByURI(uri, newSessionID=null){
	if(newSessionID == null){
		var sessionID = 1;
	}else{
		var sessionID = newSessionID;
	}
	var req = "{\"method\": \"torrent-add\",\"arguments\":{\"filename\":\""+uri+"\"\}\}";
	GM_xmlhttpRequest({
		method:"POST",
		url:webHost,
		headers: {"User-Agent": "Mozilla/5.0","Accept": "text/xml", "X-Transmission-Session-Id": sessionID},
		data: req,
		onload: function(response){
			if(response.responseText.match(/success/)){
				alert("Torrent successfully added!");
			}else if(response.responseText.match(/duplicate torrent/)){
				alert("Torrent already exists");
			}else{
				var re = new RegExp(".+X-Transmission-Session-Id:(.+)(</code></p>)");
				var newSessID = re.exec(response.responseText)[1];
				postTorrentByURI(uri, newSessionID=newSessID);
			}
		},
		ontimeout: function(response){
			alert(response.responseText);
		}
	});
}

function isTorrentSite(){
	var links = document.links;
	for ( var i in links )
	{
		if(isTorrent(links[i].href)){
			return true;
		}
	}
	return false
}
function isTorrent(str){
	if(str.match(/magnet:/g)){
		return true;
	}
	return false;
}

function torrentHandler(eventIn){
	var href = findHrefs(eventIn.target);
	
	if(isTorrent(href.toString()) == true){
		postTorrentByURI(href);
		eventIn.stopPropagation();
		eventIn.preventDefault();
	}
}
function findHrefs(o){
	if (o.nodeName == "A"){
		return (o);
	} else if (o.nodeName == "BODY") {
		return false;
	} else {
		return o.parentNode;
	}
}

if(isTorrentSite()){
	var links = document.links;
	for(var i in links){
		if(debug == true){
			if(!isTorrent(links[i].href)){
				links[i].style.color="#FF0000";
			}
		}
	}

	document.addEventListener('click', torrentHandler, false);
}
