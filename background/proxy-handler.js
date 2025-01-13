
const defaultOptionSettings = {

    scanTargetHosts : ["somethingexample1.com", "somethingexample2.com"],
    noProxyHosts : [
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
    ],

    noProxyHostsPartial : [
        ".mozilla.com",
        ".firefox.com",
        ".mozilla.net",
        ".mozilla.org",
        ".doubleclick.net",
        ".lencr.org"
    ],

    noProxyMedia : [
        "stylesheet",
        "script"
    ],

    proxyHost : "127.0.0.1",
    proxyPort : 8040,
    exceptAllNoProxy : {
        checked: false
    },
    exceptNoProxyMedia : {
        checked: false
    },


    noProxyUrlRegexString: "",
    noProxyUrlRegexFlg: "ig",

    // those property are not save to storage.
    noProxyUrlRegexp: null,

};

// current option settings
let optionSettings = {};

function parseStorageData(newStorage)  {
    let mapData = new Map();
    for (const [key, value] of Object.entries(newStorage)) {
      if (typeof(key) === 'string' && key !== "") {
        //console.log("key[" + key + "]");
        if (typeof(value) === 'string' || typeof(value) === "number") {
            //console.log("prepareImport key=" + key + " value=" + value);
            mapData.set(key, value);
        } else if (Array.isArray(value)) {
            value.forEach(item => {
                //console.log("item[" + item + "]");
            });
            mapData.set(key, value);
        } else if (getType(value) === 'Object' ){
            //console.log("value is [" + getType(value) + "]");
            mapData.set(key, value);
        } else {
            //console.log("value is not our member type. ignored.");
        }
      } else {
          //console.log("key data is not string or blank. ignored.");
      }
    }
    if (mapData.size > 0) {
        let returnObject = Object.fromEntries(mapData);
        return returnObject;
    }
    //console.log("load data is empty.");
    return null;
}

function newInstanceObject(srcObject) {
  let newSettings = {};
  for (const [key, value] of Object.entries(srcObject)) {
      let jsonData = JSON.stringify(value);
      newSettings[key] = JSON.parse(jsonData);
  }
  return newSettings;
}


// store dataObject to local storage.
// return Promise
function storeObjectToStorage(dataObject) {
    let storageObject = {};
    for (const [key, value] of Object.entries(dataObject)) {
        let valueData = value;
        storageObject[key] = valueData;
    }
    return browser.storage.local.set(storageObject).then(() => {
    });
}

function onGot(item) {
    console.log("proxy handler start onGot..");
    let isStorageExist = false;
    let optionCounter = 0;

    if (getType(item.proxyHost) !== 'Undefined') {
        optionSettings.proxyHost = item.proxyHost;
        optionCounter++;
    }
    if (getType(item.proxyPort) !== 'Undefined') {
        optionSettings.proxyPort = item.proxyPort;
        optionCounter++;
    }
    if (getType(item.scanTargetHosts) !== 'Undefined') {
        optionSettings.scanTargetHosts = item.scanTargetHosts;
        optionCounter++;
    }
    if (getType(item.noProxyHosts) !== 'Undefined') {
        optionSettings.noProxyHosts = item.noProxyHosts;
        optionCounter++;
    }
    if (getType(item.noProxyHostsPartial) !== 'Undefined') {
        optionSettings.noProxyHostsPartial = item.noProxyHostsPartial;
        optionCounter++;
    }
    if (getType(item.noProxyMedia) !== 'Undefined') {
        optionSettings.noProxyMedia = item.noProxyMedia;
        optionCounter++;
    }

    if (getType(item.exceptAllNoProxy) !== 'Undefined') {
        optionSettings.exceptAllNoProxy = item.exceptAllNoProxy;
        optionCounter++;
    }

    if (getType(item.exceptNoProxyMedia) !== 'Undefined') {
        optionSettings.exceptNoProxyMedia = item.exceptNoProxyMedia;
        optionCounter++;
    }

    if (getType(item.noProxyUrlRegexString) !== 'Undefined') {
        optionSettings.noProxyUrlRegexString = item.noProxyUrlRegexString;
        optionCounter++;
    }

    if (getType(item.noProxyUrlRegexFlg) !== 'Undefined'){
        optionSettings.noProxyUrlRegexFlg = item.noProxyUrlRegexFlg;
        optionCounter++;
        //console.log("onGot noProxyUrlRegexFlg[" + optionSettings.noProxyUrlRegexFlg + "]");
    }

    let messageString = "localStorage was initialized with defaultOptionSettings.";
    if (optionCounter >= defaultOptionSettingsItemCount) {
        isStorageExist = true;
        messageString = "optionSettings was loaded from localStorage.";
    } else if (optionCounter > 0) {
        messageString = "count of loaded items from localStorage :"
                    + optionCounter
                    + "\n"
                    + "count of initialized items to localStorage:"
                    + (defaultOptionSettingsItemCount - optionCounter);

    }

    if (optionSettings.noProxyUrlRegexString != null
     && optionSettings.noProxyUrlRegexString !== "") {
        optionSettings.noProxyUrlRegexp = new RegExp(
            optionSettings.noProxyUrlRegexString,
            optionSettings.noProxyUrlRegexFlg);
    } else {
        optionSettings.noProxyUrlRegexp = defaultOptionSettings.noProxyUrlRegexp
    }

    return Promise.resolve({isStorageExist: isStorageExist, message: messageString});
}

function sendNotification(messagestring) {
    browser.notifications.create('onInstalled', {
            title: 'onInstalled event',
            message: messagestring,
            type: 'basic'
    });
    return messagestring;
}

function postInstallTask(result) {
    let messagestring = result.message;
    if (!result.isStorageExist) {
        return storeObjectToStorage(optionSettings).then(() =>{
            return sendNotification(messagestring);
        });
    }
    return Promise.resolve(messagestring).then((messagestring) =>{
        return sendNotification(messagestring);
    });
}

function isNoProxyHost(hostname) {
    if (optionSettings.noProxyHosts.indexOf(hostname) != -1) {
        console.log("Matched noProxyHost hostname[" + hostname + "]");
        return true;
    }
    if (optionSettings.exceptAllNoProxy.checked) {
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
        if (optionSettings.noProxyHostsPartial.indexOf(dotDomain) != -1) {
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

    const primeHeader = requestInfo.method + " " + requestInfo.url;

    let resType = requestInfo.type + "";
    let isScript = resType === 'script';
    const noProxyRegexpMatches = primeHeader.match(optionSettings.noProxyUrlRegexp);

    const noProxyRegexpMatchesResult =
        noProxyRegexpMatches != null
            ? noProxyRegexpMatches.length > 0
            : false
    ;

    if (optionSettings.scanTargetHosts.indexOf(url.hostname) != -1) {
        if (
            (
                !optionSettings.exceptNoProxyMedia.checked
                || optionSettings.noProxyMedia.indexOf(resType) == -1
            )
            && !noProxyRegexpMatchesResult
        ) {
            console.log(
                `Proxying: ${url.hostname}`
                + " type["
                + resType
                + "] primeHeader["
                + primeHeader
                + "]"
            );
            return {type: "http", host: optionSettings.proxyHost, port: optionSettings.proxyPort};
        }
    } else  if (
        optionSettings.noProxyMedia.indexOf(resType) == -1
        && !isNoProxyHost(url.hostname)
        && !noProxyRegexpMatchesResult
    ) {
        console.log(
            `Proxying: ${url.hostname}`
            + " type["
            + resType
            + "] primeHeader["
            + primeHeader
            + "]"
        );
        return {type: "http", host: optionSettings.proxyHost, port: optionSettings.proxyPort};
    }
    if (noProxyRegexpMatchesResult) {
        console.log("matched PrimeHeaderRegexp[" + optionSettings.noProxyUrlRegexp + "]");
    }
    console.log("Direct primeHeader:" + primeHeader +  " type[" + resType + "]");
    // Return instructions to open the requested webpage
    return {type: "direct"};
}

// reset optionSettings to default.
// return Promise
function resetOptionSettings () {
    optionSettings = newInstanceObject(defaultOptionSettings);
    return storeObjectToStorage(optionSettings).then(() =>{
        return "localStorage was initialized with defaultOptionSettings.";
    });
}

/**

get the type of specified argument.

Object.prototype.toString.call(a) returns:

string	"", "abc", 'a', String(1)	string	[object String]
String	new String("")	object	[object String]
number	0, NaN, Infinity, Number('1')	number	[object Number]
Number	new Number(0)	object	[object Number]
bigint	1n, BigInt(1)	bigint	[object BigInt]
Bigint	Object(1n)	object	[object BigInt]
boolean	true, Boolean(0)	boolean	[object Boolean]
Boolean	new Boolean(true)	object	[object Boolean]
symbol	Symbol(1)	symbol	[object Symbol]
Symbol	Object(Symbol(1))	object	[object Symbol]
null	null	object	[object Null]
undefined	undefined	undefined	[object Undefined]
array	[]	object	[object Array]
object	{}	object	[object Object]
function	() => {}	function	[object Function]
Map	new Map()	object	[object Map]
Set	new Set()	object	[object Set]
Date	new Date()	object	[object Date]
Error	new Error()	object	[object Error]

**/
function getType(a) {
  return Object.prototype.toString.call(a).replace('[object ', '').replace(']', '');
}

// handle message for responding to options.js.
// return Promise. the response will be send after resetting optionSetting is completed.
function handleMessage(request, sender, sendResponse) {
    console.log(`A content script sent a message: ${request.order}`);

    if (request.order === "reset") {
        // response returns promise.
        return resetOptionSettings().then(
            (result) => {
                console.log("resetOptionSettings.. now send response.");
                return {
                    response :"reset OptionSettings :[" + result + "]",
                    error: false
                };
            }
        ).catch(
            (error) => {
                onError("resetOptionSettings was failed. reason:" + error);
                return {
                    response: "resetOptionSettings was failed. reason:"
                        + error,
                    error: true
                };
            }
        );
    }

    return Promise.reject(
        new Error('order unknown')
    ).catch(
        error => {
            return {response: error, error: true};
        }
    );
}


function onError(error) {
    console.log(`OnError: ${error}`);
}

// main routine

// Set the default list on installation.
// initialize OptionSetting to defaults
optionSettings = newInstanceObject(defaultOptionSettings);

const defaultOptionSettingsItemCount = Object.keys(parseStorageData(defaultOptionSettings)).length;
console.log("defaultOptionSettingsItemCount=" + defaultOptionSettingsItemCount);

// receive message from option UI and then take actions for ordering.
// after all actions is completed, it returns response message to optionUI.
browser.runtime.onMessage.addListener(handleMessage);

browser.runtime.onInstalled.addListener(details => {
    console.log("start proxy handler on " + details.reason);
    let storedData = browser.storage.local.get();
    storedData.then((item) => {
        onGot(item).then((result) => {
            postInstallTask(result).then((message) =>{
                console.log("Completed post Install task :" + message);
            });
        });
    }).catch(onError);
});

// You cannot set property of persisitent in manifest v3. it always applies persistent:false
// so this storage.get method is called multiple times while this addon is running.
let storedData = browser.storage.local.get();
storedData.then((item) => {
    onGot(item).then((result) => {
        console.log("onGot result:" + result.message);
    });
}).catch(onError);

// Listen for changes in the stored items
browser.storage.onChanged.addListener(changeData => {
    if (changeData.scanTargetHosts) {
        optionSettings.scanTargetHosts = changeData.scanTargetHosts.newValue;
        if (typeof(optionSettings.scanTargetHosts) !== "undefined" && optionSettings.scanTargetHosts.length !== 0) {
            console.log("changed Storage scanTargetHosts.length=" + optionSettings.scanTargetHosts.length);
            optionSettings.scanTargetHosts.forEach(
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
        optionSettings.noProxyMedia = changeData.noProxyMedia.newValue;
        if (optionSettings.noProxyMedia.length !== 0) {
            console.log("changed Storage noProxyMedia.length=" + optionSettings.noProxyMedia.length);
            optionSettings.noProxyMedia.forEach(
                media => {
                    console.log("noProxyMedia[" + media + "]");
                }
            );
        } else {
            console.log("changed Storage noProxyMedia = [] length=" + optionSettings.noProxyMedia.length );
        }
    }
    if (changeData.noProxyHosts) {
        optionSettings.noProxyHosts = changeData.noProxyHosts.newValue;

        if (optionSettings.noProxyHosts.length !== 0) {
            optionSettings.noProxyHosts.forEach(
                host => {
                    console.log("noProxy[" + host + "]");
                }
            );
        }
    }
    if (changeData.noProxyHostsPartial) {
        optionSettings.noProxyHostsPartial = changeData.noProxyHostsPartial.newValue;

        if (optionSettings.noProxyHostsPartial.length !== 0) {
            optionSettings.noProxyHostsPartial.forEach(
                host => {
                    console.log("noProxyPartial[" + host + "]");
                }
            );
        }
    }
    if (changeData.proxyHost) {
        optionSettings.proxyHost = changeData.proxyHost.newValue;
        console.log("changed Storage proxyHost["
            + changeData.proxyHost.oldValue
            + "]->["
            + optionSettings.proxyHost
            + "]"
        );
    }
    if (changeData.proxyPort) {
        let newPort = changeData.proxyPort.newValue;
        if (newPort >= 0 && newPort <= 65535) {
            optionSettings.proxyPort = newPort;
            console.log("changed Storage proxyPort["
                + changeData.proxyPort.oldValue
                + "]->]"
                + optionSettings.proxyPort
                + "]"
            );
        }
    }
    if (changeData.exceptAllNoProxy) {
        optionSettings.exceptAllNoProxy = changeData.exceptAllNoProxy.newValue;
        if (getType(optionSettings.exceptAllNoProxy.checked) === 'Undefined') {
            // set default.
            optionSettings.exceptAllNoProxy = newInstanceObject(defaultOptionSettings.exceptAllNoProxy);
        }
        console.log("changed Storage exceptAllNoProxy["
            + (getType(changeData.exceptAllNoProxy.oldValue)
            === 'Undefined'
                ? "Undefined"
                : changeData.exceptAllNoProxy.oldValue.checked)
            + "]->["
            + optionSettings.exceptAllNoProxy.checked
            + "]"
        );
    }
    if (changeData.exceptNoProxyMedia) {
        optionSettings.exceptNoProxyMedia = changeData.exceptNoProxyMedia.newValue;
        if (getType(optionSettings.exceptNoProxyMedia.checked) === 'Undefined') {
            // set default.
            optionSettings.exceptNoProxyMedia = newInstanceObject(defaultOptionSettings.exceptNoProxyMedia);
        }
        console.log("changed Storage exceptNoProxyMedia["
            + (getType(changeData.exceptNoProxyMedia.oldValue)
                === 'Undefined'
                    ? "Undefined"
                    : changeData.exceptNoProxyMedia.oldValue.checked)
            + "]->["
            + optionSettings.exceptNoProxyMedia.checked
            + "]"
        );
    }
    if (changeData.noProxyUrlRegexString) {
        optionSettings.noProxyUrlRegexString = changeData.noProxyUrlRegexString.newValue;
        console.log("changed noProxyUrlRegexString["
            + changeData.noProxyUrlRegexString.oldValue
            + "]->["
            + optionSettings.noProxyUrlRegexString
            + "]"
        );
    }

    if (changeData.noProxyUrlRegexFlg){
        optionSettings.noProxyUrlRegexFlg = changeData.noProxyUrlRegexFlg.newValue;
        if (optionSettings.noProxyUrlRegexFlg === ""
        || optionSettings.noProxyUrlRegexFlg == null) {
            optionSettings.noProxyUrlRegexFlg = newInstanceObject(defaultOptionSettings.noProxyUrlRegexFlg);
        }
        console.log("noProxyUrlRegexFlg["
            + changeData.noProxyUrlRegexFlg.oldValue
            + "]->["
            + optionSettings.noProxyUrlRegexFlg
            + "]"
        );
    }

    if (optionSettings.noProxyUrlRegexString != null
     && optionSettings.noProxyUrlRegexString !== "") {
        optionSettings.noProxyUrlRegexp =
            new RegExp(
                optionSettings.noProxyUrlRegexString,
                optionSettings.noProxyUrlRegexFlg
            );
        console.log("changed Storage noProxyUrlRegexp[" + optionSettings.noProxyUrlRegexp.toString() + "]");
    } else {
        optionSettings.noProxyUrlRegexp = defaultOptionSettings.noProxyUrlRegexp
        console.log("changed Storage noProxyUrlRegexp[" + optionSettings.noProxyUrlRegexp + "]");
    }

});

// Managed the proxy

// Listen for a request to open a webpage
browser.proxy.onRequest.addListener(handleProxyRequest, {urls: ["<all_urls>"]});

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});




