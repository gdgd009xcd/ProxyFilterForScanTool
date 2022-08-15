// Initialize the option items with default value.
let scanTargetHosts = ["somethingexample1.com", "somethingexample2.com"];
let noProxyHosts = ["www.google-analytics.com", "ocsp.digicert.com", "ocsp.pki.goog", "analytics.twitter.com", "safebrowsing.googleapis.com"];
let noProxyHostsPartial = [".mozilla.com", ".firefox.com", ".mozilla.net", ".mozilla.org", ".doubleclick.net", ".lencr.org"];
let proxyHost = "127.0.0.1";
let proxyPort = 8040;

function onGot(item) {
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

    let messagestring = "Initialize scanTargetHosts to default.";
    if (isStorageExist) {
      messagestring = "loaded scanTargetHosts from localStorage";
    }
    browser.notifications.create('onInstalled', {
        title: 'onInstalled event',
        message: messagestring,
        type: 'basic'
      });
    browser.storage.local.set({
        scanTargetHosts: scanTargetHosts,
        noProxyHosts: noProxyHosts,
        noProxyHostsPartial: noProxyHostsPartial,
        proxyHost: proxyHost,
        proxyPort: proxyPort
    });
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
  if (data.scanTargetHosts) {
    scanTargetHosts = data.scanTargetHosts;
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
});

// Listen for changes in the stored items
browser.storage.onChanged.addListener(changeData => {
    if (changeData.scanTargetHosts) {
        scanTargetHosts = changeData.scanTargetHosts.newValue;
        if (scanTargetHosts.length !== 0) {
            console.log("changed Storage scanTargetHosts.length=" + scanTargetHosts.length);
            scanTargetHosts.forEach(
                host => {
                    console.log("scanTarget[" + host + "]");
                }
            );
        } else {
            console.log("changed Storage scanTargetHosts = [] length=" + scanTargetHosts.length );
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
});

// Managed the proxy

// Listen for a request to open a webpage
browser.proxy.onRequest.addListener(handleProxyRequest, {urls: ["<all_urls>"]});

function isNoProxyHost(hostname) {
    if (noProxyHosts.indexOf(hostname) != -1) {
        console.log("Matched noProxyHost hostname[" + hostname + "]");
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
    console.log(`Proxying: ${url.hostname}` + " type[" + resType + "]");
    return {type: "http", host: proxyHost, port: proxyPort};
  } else  if (scanTargetHosts.length > 0
    && resType !== 'script'
    && resType !== 'stylesheet'
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




