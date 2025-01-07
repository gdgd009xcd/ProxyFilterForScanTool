const scanTargetHostsTextArea = document.querySelector("#scan-target-hosts");
const noProxyHostsTextArea = document.querySelector("#no-proxy-hosts");
const proxyHostTextField = document.querySelector("#proxyhost");
const exceptAllNoProxyCheckBox = document.querySelector("#except-all-noproxy");
const proxyPortTextField = document.querySelector("#proxyport");
const noProxyMediaTextArea = document.querySelector("#no-proxy-media");
const exceptNoProxyMediaCheckBox = document.querySelector("#except-no-proxy-media");

//restore defaults.
const restoreScanTargetHosts = ["somethingexample1.com", "somethingexample2.com"];
const restoreNoProxyHosts = [
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

const restoreNoProxyHostsPartial = [
    ".mozilla.com",
    ".firefox.com",
    ".mozilla.net",
    ".mozilla.org",
    ".doubleclick.net",
    ".lencr.org"
];

const restoreNoProxyMedia = [
    "stylesheet",
    "script"
];

const restoreProxyHost = "127.0.0.1";
const restoreProxyPort = 8040;
const restoreExceptAllNoProxy = {
    checked: false
};
const restoreExceptNoProxyMedia = {
    checked: false
};


let scanTargetHosts = [];
let noProxyHosts = [];
let noProxyHostsPartial = [];
let noProxyMedia = [];
let proxyHost = "";
let proxyPort = -1;
let exceptAllNoProxy = {
    checked: false
};
let exceptNoProxyMedia = {
    checked: false
};
const date = new Date()
const timeStamp = `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`

// Store the currently selected settings using browser.storage.local.
function scanTargetHostsTextAreaChangeHandler() {
  if (scanTargetHostsTextArea.value) {
    scanTargetHosts = scanTargetHostsTextArea.value.split(/\n+/);
  } else {
    scanTargetHosts = [];
  }

  console.log("changed Handler scanTargetHostsTextArea[" + scanTargetHostsTextArea.value + "] scanTargetHosts.length=" + scanTargetHosts.length);
  storeInputToStorage();
}

function noProxyMediaTextAreaChangeHandler() {
    if (noProxyMediaTextArea.value) {
        noProxyMedia = noProxyMediaTextArea.value.split(/\n+/);
    } else {
        noProxyMedia = [];
    }

    console.log("changed Handler noProxyMediaTextArea[" + noProxyMediaTextArea.value + "] noProxyMedia.length=" + noProxyMedia.length);
    storeInputToStorage();
}

function noProxyHostsTextAreaChangeHandler() {
  noProxyHosts = [];
  noProxyHostsPartial = [];
  let noProxyHostsChangedValues = [];
  if (noProxyHostsTextArea.value) {
    noProxyHostsChangedValues = noProxyHostsTextArea.value.split(/\n+/);
    if (noProxyHostsChangedValues.length > 0) {
        noProxyHostsChangedValues.forEach(
            host => {
                if (host.indexOf(".") === 0) {
                    noProxyHostsPartial.push(host);
                } else {
                    noProxyHosts.push(host);
                }
                console.log("noProxyPartial[" + host + "]");
            }
        );
    }
  }

  console.log("changed Handler noProxyHostsTextArea["
   + noProxyHostsTextArea.value
   + "] noProxyHosts.length="
    + noProxyHosts.length
     + " noProxyHostsPartial.length=" + noProxyHostsPartial.length);
  storeInputToStorage();
}

function proxyHostTextFieldChangeHandler() {
  if (proxyHostTextField.value) {
    proxyHost = proxyHostTextField.value;
    console.log("changed Handler proxyHostTextField[" + proxyHost + "]");
  }

  // always restore TextField value to the valid Storage data.
  proxyHostTextField.value = proxyHost;
  storeInputToStorage();
}

function proxyPortTextFieldChangeHandler() {
  if (proxyPortTextField.value) {
    let newPortNumber = Number(proxyPortTextField.value);
    if (newPortNumber >= 0 && newPortNumber <= 65535) {
        proxyPort = newPortNumber;
        console.log("changed Handler proxyPortTextField[" + proxyPort + "]");
    }
  }
  // always restore TextField value to the valid Storage data.
  proxyPortTextField.value = proxyPort;
  storeInputToStorage();
}

function exceptAllNoProxyCheckBoxChangeHandler() {
    exceptAllNoProxy.checked = exceptAllNoProxyCheckBox.checked;
    console.log("changed Handler exceptAllNoProxy:" + exceptAllNoProxy.checked);
    storeInputToStorage();
}
function exceptNoProxyMediaCheckBoxChangeHandler() {
    exceptNoProxyMedia.checked = exceptNoProxyMediaCheckBox.checked;
    console.log("changed Handler exceptNoProxyMedia:" + exceptNoProxyMedia.checked);
    storeInputToStorage();
}

function storeInputToStorage() {
    // setting checkboxes with default value in HTML 
    exceptAllNoProxy.checked = exceptAllNoProxyCheckBox.checked;
    exceptNoProxyMedia.checked = exceptNoProxyMediaCheckBox.checked;
    // store input value to the Storage.
    storeArgsToStorage(scanTargetHosts,
        noProxyHosts,
        noProxyHostsPartial,
        proxyHost,
        proxyPort,
        exceptAllNoProxy,
        noProxyMedia,
        exceptNoProxyMedia);
}

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
    }).then(() =>{
        console.log("saved option settings to local storage");
    },onError);
}




// Update the options UI with the settings values retrieved from storage
function updateUI(restoredSettings) {
    scanTargetHostsTextArea.value = restoredSettings.scanTargetHosts.join("\n");
    noProxyHostsTextArea.value = restoredSettings.noProxyHosts.join("\n") + "\n" + restoredSettings.noProxyHostsPartial.join("\n");
    proxyHostTextField.value = restoredSettings.proxyHost;
    proxyPortTextField.value = restoredSettings.proxyPort;
    exceptAllNoProxy = JSON.parse(restoredSettings.exceptAllNoProxy);
    exceptAllNoProxyCheckBox.checked = exceptAllNoProxy.checked;
    scanTargetHosts = restoredSettings.scanTargetHosts;
    noProxyHosts = restoredSettings.noProxyHosts;
    noProxyHostsPartial = restoredSettings.noProxyHostsPartial;
    proxyHost = restoredSettings.proxyHost;
    proxyPort = restoredSettings.proxyPort;
    noProxyMediaTextArea.value = restoredSettings.noProxyMedia.join("\n");
    noProxyMedia = restoredSettings.noProxyMedia;
    exceptNoProxyMedia = JSON.parse(restoredSettings.exceptNoProxyMedia);
    exceptNoProxyMediaCheckBox.checked = exceptNoProxyMedia.checked;

}

function onError(e) {
  console.error(e);
}

// On opening the options page, fetch stored settings and update the UI with them.
browser.storage.local.get().then(updateUI, onError);

// Whenever the contents of the textarea/textfield changes, save the new values
scanTargetHostsTextArea.addEventListener("change", scanTargetHostsTextAreaChangeHandler);
noProxyHostsTextArea.addEventListener("change", noProxyHostsTextAreaChangeHandler);
proxyHostTextField.addEventListener("change", proxyHostTextFieldChangeHandler);
proxyPortTextField.addEventListener("change", proxyPortTextFieldChangeHandler);
exceptAllNoProxyCheckBox.addEventListener("change", exceptAllNoProxyCheckBoxChangeHandler);
noProxyMediaTextArea.addEventListener("change", noProxyMediaTextAreaChangeHandler);
exceptNoProxyMediaCheckBox.addEventListener("change", exceptNoProxyMediaCheckBoxChangeHandler);

// warning: you can't use checking key is null or undefined. this makes JSON.stringify return undefined.
// and you must carefully check string data with using !==/=== for String, ==/!= null check.
// currently parseStringify is no used.
function parseStringify(key, value) {
    //if (typeof(value) !== "undefined" && value != null && value !== "") {
    if (typeof(value) === "undefined" || value == null || value === "") {
        console.log("invalid value.");
        return undefined;
    } else {
        console.log("key[" + key + "]");
        if (typeof value === 'string' || typeof value === 'number') {
             console.log("prepareImport key=" + key + " value=" + value);
        } else if (Array.isArray(value)) {
            value.forEach(item => {
                console.log("  item[" + item + "]");
            });
        } else {
            console.log("value is unknown");
        }
    }
    return value;
 }

const storageImEx = {
    parseStorageData: (newStorage) => {
        let mapData = new Map();
        for (const [key, value] of Object.entries(newStorage)) {
          if (typeof(key) === 'string' && key !== "") {
            console.log("key[" + key + "]");
            if (typeof(value) === 'string' || typeof(value) === "number") {
                    console.log("prepareImport key=" + key + " value=" + value);
                    mapData.set(key, value);
            } else if (Array.isArray(value)) {
                value.forEach(item => {
                    console.log("item[" + item + "]");
                });
                mapData.set(key, value);
            }
          } else {
              console.log("key data is not string or blank. ignored.");
          }

        }
        if (mapData.size > 0) {
            let returnObject = Object.fromEntries(mapData);
            return returnObject;
        }
        console.log("load data is empty.");
        return null;
    },

    exportData: (newStorage) => {
        let returnObject = storageImEx.parseStorageData(newStorage);
        if (returnObject != null) {
            const jsonStringData = JSON.stringify(returnObject);
            const link = document.createElement("a");
            const file = new Blob([jsonStringData], { type: "text/plain" });
            link.href = URL.createObjectURL(file);
            link.download = `ProxyFilterExportJSON_${timeStamp}.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
            console.log("export succeeded");
            return returnObject;
        }
        console.log("export failed.");
        return null;
    },

    prepareImport: (storageFile) => {
        console.log("prepareImport started");
        try {
            const newStorage = JSON.parse(storageFile);
            const normalizedObject = storageImEx.parseStorageData(newStorage);

            if (normalizedObject != null) {
                browser.storage.local.clear().then(
                () => {
                    console.log("local storage was cleared.");
                    browser.storage.local.set(normalizedObject).then(
                        () => {
                            console.log("import succeeded.");
                            browser.storage.local.get().then(updateUI, onError);
                        }, storageImEx.onError);
                }, storageImEx.onError);
            } else {
                console.log("import failed: data contains invalid data.");
            }
        }catch (e) {
            console.log("import failed:\n" + e.message);
        }

    },


    onError: (e) => {
        console.log(e.message);
    },
}

//export watch
if (document.getElementById("exportStorage")) {
  document.getElementById("exportStorage").addEventListener("click", function () {
    browser.storage.local.get().then(storageImEx.exportData, storageImEx.onError);
  })
}

const fileReader = new FileReader();
fileReader.onload = function (event) {
  storageImEx.prepareImport(fileReader.result);
};


function handleFiles() {
  const fileList = this.files;
  const firstFile = fileList[0];
  console.log("importListener readAstext file[" + firstFile.name + "]");
  fileReader.readAsText(firstFile);
}


const localStorageFileInputTag = document.querySelector("#importStorage");
if (localStorageFileInputTag !== null) {
    try {

        localStorageFileInputTag.addEventListener("change", handleFiles, false);

    } catch (e) {
        console.log("importStorage error: " + e.message);
    }
} else {
        console.log("importStorage tag is not exist");
}
const resetDefaultButtonTag = document.querySelector("#resetDefault");
if (resetDefaultButtonTag != null) {
    resetDefaultButtonTag.addEventListener("click", () => {
    browser.storage.local.clear().then(() => {
        console.log("storage cleared.");
        storeArgsToStorage(restoreScanTargetHosts,
                                       restoreNoProxyHosts,
                                       restoreNoProxyHostsPartial,
                                       restoreProxyHost,
                                       restoreProxyPort,
                                       restoreExceptAllNoProxy,
                                       restoreNoProxyMedia,
                                       restoreExceptNoProxyMedia)
        browser.storage.local.get().then(updateUI, onError);
    }, onError);


    });
}
