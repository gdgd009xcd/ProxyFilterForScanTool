

// Initialize the option items with default value.
let scanTargetHosts = ["somethingexample1.com", "somethingexample2.com"];
let noProxyHosts = [
    "www.google-analytics.com",
    "ocsp.digicert.com",
    "ocsp.pki.goog",
    "analytics.twitter.com",
    "safebrowsing.googleapis.com",
    "ssl.gstatic.com",
    "adservice.google.com",
    "adservice.google.co.jp",
    "ogs.google.co.jp",
    "play.google.com"
];

let noProxyHostsPartial = [
    ".mozilla.com",
    ".firefox.com",
    ".mozilla.net",
    ".mozilla.org",
    ".doubleclick.net",
    ".lencr.org"
];

let noProxyMedia = [
    "stylesheet",
    "script"
];

let proxyHost = "127.0.0.1";
let proxyPort = 8040;

let exceptAllNoProxy = {
    checked: false
};

let exceptNoProxyMedia = {
    checked: false
};

function onGot(item) {
    console.log("start onGot..");
    let isStorageExist = false;
    if (item.proxyHost) {
        proxyHost = item.proxyHost;
    }
    if (item.proxyPort) {
        proxyPort = item.proxyPort;
    }
    if (item.scanTargetHosts) {
        isStorageExist = true;
        scanTargetHosts = item.scanTargetHosts;
        console.log("loaded scanTargetHosts from localStorage");
    } else {
        console.log("Initialize scanTargetHosts to default.");
    }
    if (item.noProxyHosts) {
        noProxyHosts = item.noProxyHosts;
    }
    if (item.noProxyHostsPartial) {
        noProxyHostsPartial = item.noProxyHostsPartial;
    }
    if (item.noProxyMedia) {
        noProxyMedia = item.noProxyMedia;
    }

    if (item.exceptAllNoProxy) {
        exceptAllNoProxy = JSON.parse(item.exceptAllNoProxy);
    }

    if (item.exceptNoProxyMedia) {
        exceptNoProxyMedia = JSON.parse(item.exceptNoProxyMedia);
    }


    let messagestring = "Initialize scanTargetHosts to default.";
    if (isStorageExist) {
      messagestring = "loaded scanTargetHosts from localStorage";
    }
    browser.notifications.create('onInstalled', {
        title: 'onInstalled event',
        message: messagestring,
        type: 'basic'
      });

    storeArgsToStorage(scanTargetHosts,
        noProxyHosts,
        noProxyHostsPartial,
        proxyHost,
        proxyPort,
        exceptAllNoProxy,
        noProxyMedia,
        exceptNoProxyMedia);
    console.log("end onGot..");
}

function onError(error) {
    console.log(`OnError: ${error}`);
}

// Set the default list on installation.
browser.runtime.onInstalled.addListener(details => {
    console.log(details.reason);
    let storedData = browser.storage.local.get();
    storedData.then(onGot, onError);
});

// Get the stored items.
browser.storage.local.get(data => {
    console.log("start storage get.");
    if (data.scanTargetHosts) {
        scanTargetHosts = data.scanTargetHosts;
    }

    if (data.noProxyMedia) {
        noProxyMedia = data.noProxyMedia;
    }

    if (data.noProxyHosts) {
      noProxyHosts = data.noProxyHosts;
    }

    if (data.noProxyHostsPartial) {
      noProxyHostsPartial = data.noProxyHostsPartial;
    }

    if (data.proxyHost) {
      proxyHost = data.proxyHost;
    }

    if (data.proxyPort) {
      proxyPort = data.proxyPort;
    }
    if (data.exceptAllNoProxy) {
      exceptAllNoProxy = JSON.parse(data.exceptAllNoProxy);
    }
    if (data.exceptNoProxyMedia) {
      exceptNoProxyMedia = JSON.parse(data.exceptNoProxyMedia);
    }
    console.log("end storage get.");
});

// Listen for changes in the stored items
browser.storage.onChanged.addListener(changeData => {
    if (changeData.scanTargetHosts) {
        scanTargetHosts = changeData.scanTargetHosts.newValue;
        if (typeof(scanTargetHosts) !== "undefined" && scanTargetHosts.length !== 0) {
            console.log("changed Storage scanTargetHosts.length=" + scanTargetHosts.length);
            scanTargetHosts.forEach(
                host => {
                    console.log("scanTarget[" + host + "]");
                }
            );
        } else {
            console.log("changed Storage scanTargetHosts = [] or undefined");
            return;
        }
    }
    if (changeData.noProxyMedia) {
        noProxyMedia = changeData.noProxyMedia.newValue;
        if (noProxyMedia.length !== 0) {
            console.log("changed Storage noProxyMedia.length=" + noProxyMedia.length);
            noProxyMedia.forEach(
                media => {
                    console.log("noProxyMedia[" + media + "]");
                }
            );
        } else {
            console.log("changed Storage noProxyMedia = [] length=" + noProxyMedia.length );
        }
    }
    if (changeData.noProxyHosts) {
        noProxyHosts = changeData.noProxyHosts.newValue;

        if (noProxyHosts.length !== 0) {
            noProxyHosts.forEach(
                host => {
                    console.log("noProxy[" + host + "]");
                }
            );
        }
    }
    if (changeData.noProxyHostsPartial) {
            noProxyHostsPartial = changeData.noProxyHostsPartial.newValue;

            if (noProxyHostsPartial.length !== 0) {
                noProxyHostsPartial.forEach(
                    host => {
                        console.log("noProxyPartial[" + host + "]");
                    }
                );
            }
        }
    if (changeData.proxyHost) {
        proxyHost = changeData.proxyHost.newValue;
        console.log("changed Storage proxyHost[" + proxyHost + "]");
    }
    if (changeData.proxyPort) {
        let newPort = changeData.proxyPort.newValue;
        if (newPort >= 0 && newPort <= 65535) {
            proxyPort = newPort;
            console.log("changed Storage proxyPort[" + proxyPort + "]");
        }
    }
    if (changeData.exceptAllNoProxy) {
        exceptAllNoProxy = JSON.parse(changeData.exceptAllNoProxy.newValue);
        console.log("changed Storage exceptAllNoProxy[" + exceptAllNoProxy.checked + "]");
    }
    if (changeData.exceptNoProxyMedia) {
        exceptNoProxyMedia = JSON.parse(changeData.exceptNoProxyMedia.newValue);
        console.log("changed Storage exceptNoProxyMedia[" + exceptNoProxyMedia.checked + "]");
    }

});

// Managed the proxy

// Listen for a request to open a webpage
browser.proxy.onRequest.addListener(handleProxyRequest, {urls: ["<all_urls>"]});

function isNoProxyHost(hostname) {
    if (noProxyHosts.indexOf(hostname) != -1) {
        console.log("Matched noProxyHost hostname[" + hostname + "]");
        return true;
    }
    if (exceptAllNoProxy.checked) {
        return true;
    }
    let hostParts = hostname.split(".");
    let dotDomain = "";
    while((part = hostParts.pop()) !== undefined) {
        if (dotDomain) {
            dotDomain =  "." + part + dotDomain;
        } else {
            dotDomain = "." + part;
        }
        // console.log("dotDomain[" + dotDomain + "]");
        if (noProxyHostsPartial.indexOf(dotDomain) != -1) {
            console.log("Matched noProxyHostPartial dotDomain[" + dotDomain + "]");
            return true;
        }
    }
    return false;
}

// On the request to open a webpage
function handleProxyRequest(requestInfo) {
    // Read the web address of the page to be visited 
    const url = new URL(requestInfo.url);

    let resType = requestInfo.type + "";
    let isScript = resType === 'script';

    if (scanTargetHosts.indexOf(url.hostname) != -1) {
        if (!exceptNoProxyMedia.checked
            || (exceptNoProxyMedia.checked 
                && noProxyMedia.indexOf(resType) == -1)
            ) {
            console.log(`Proxying: ${url.hostname}` + " type[" + resType + "]");
            return {type: "http", host: proxyHost, port: proxyPort};
        }
    } else  if (scanTargetHosts.length > 0
      && noProxyMedia.indexOf(resType) == -1
      && !isNoProxyHost(url.hostname)) {
        console.log(`Proxying: ${url.hostname}` + " type[" + resType + "]");
        return {type: "http", host: proxyHost, port: proxyPort};
    }
    console.log("Direct requestURL:" + requestInfo.url +  " type[" + resType + "]");
    // Return instructions to open the requested webpage
    return {type: "direct"};
}

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});

function storeArgsToStorage(scanTargetHosts,
    noProxyHosts,
    noProxyHostsPartial,
    proxyHost,
    proxyPort,
    exceptAllNoProxy,
    noProxyMedia,
    exceptNoProxyMedia) {
    let exceptAllNoProxyString = JSON.stringify(exceptAllNoProxy);
    let exceptNoProxyMediaString = JSON.stringify(exceptNoProxyMedia);
    browser.storage.local.set({
        scanTargetHosts: scanTargetHosts,
        noProxyHosts: noProxyHosts,
        noProxyHostsPartial: noProxyHostsPartial,
        proxyHost: proxyHost,
        proxyPort: proxyPort,
        exceptAllNoProxy: exceptAllNoProxyString,
        noProxyMedia: noProxyMedia,
        exceptNoProxyMedia: exceptNoProxyMediaString
    });
}


