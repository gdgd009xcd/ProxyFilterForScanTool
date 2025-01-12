const scanTargetHostsTextArea = document.querySelector("#scan-target-hosts");
const noProxyHostsTextArea = document.querySelector("#no-proxy-hosts");
const proxyHostTextField = document.querySelector("#proxyhost");
const exceptAllNoProxyCheckBox = document.querySelector("#except-all-noproxy");
const proxyPortTextField = document.querySelector("#proxyport");
const noProxyMediaTextArea = document.querySelector("#no-proxy-media");
const exceptNoProxyMediaCheckBox = document.querySelector("#except-no-proxy-media");
const noProxyUrlRegexTextField = document.querySelector("#no-proxy-url-regex");
const noProxyUrlRegexCaseSensitiveCheckBox = document.querySelector("#no-proxy-url-regex-casesensitive");

const optionSettings = {
};


const date = new Date()
const timeStamp = `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`

// Store the currently selected settings using browser.storage.local.
function scanTargetHostsTextAreaChangeHandler() {
  if (scanTargetHostsTextArea.value) {
    optionSettings.scanTargetHosts = scanTargetHostsTextArea.value.split(/\n+/);
  } else {
    optionSettings.scanTargetHosts = [];
  }

  console.log(
    "changed Handler scanTargetHostsTextArea["
    + scanTargetHostsTextArea.value
    + "] scanTargetHosts.length="
    + optionSettings.scanTargetHosts.length
  );
  storeInputToStorage();
}

function noProxyMediaTextAreaChangeHandler() {
    if (noProxyMediaTextArea.value) {
        optionSettings.noProxyMedia = noProxyMediaTextArea.value.split(/\n+/);
    } else {
        optionSettings.noProxyMedia = [];
    }

    console.log("changed Handler noProxyMediaTextArea["
        + noProxyMediaTextArea.value
        + "] noProxyMedia.length="
        + optionSettings.noProxyMedia.length);
    storeInputToStorage();
}

function noProxyHostsTextAreaChangeHandler() {
  optionSettings.noProxyHosts = [];
  optionSettings.noProxyHostsPartial = [];
  let noProxyHostsChangedValues = [];
  if (noProxyHostsTextArea.value) {
    noProxyHostsChangedValues = noProxyHostsTextArea.value.split(/\n+/);
    if (noProxyHostsChangedValues.length > 0) {
        noProxyHostsChangedValues.forEach(
            host => {
                if (host.indexOf(".") === 0) {
                    optionSettings.noProxyHostsPartial.push(host);
                } else {
                    optionSettings.noProxyHosts.push(host);
                }
                console.log("noProxyPartial[" + host + "]");
            }
        );
    }
  }

  console.log("changed Handler noProxyHostsTextArea["
    + noProxyHostsTextArea.value
    + "] noProxyHosts.length="
    + optionSettings.noProxyHosts.length
    + " noProxyHostsPartial.length="
    + optionSettings.noProxyHostsPartial.length);
  storeInputToStorage();
}

function proxyHostTextFieldChangeHandler() {
  if (proxyHostTextField.value) {
    optionSettings.proxyHost = proxyHostTextField.value;
    console.log("changed Handler proxyHostTextField[" + optionSettings.proxyHost + "]");
  }

  // always restore TextField value to the valid Storage data.
  proxyHostTextField.value = optionSettings.proxyHost;
  storeInputToStorage();
}

function proxyPortTextFieldChangeHandler() {
  if (proxyPortTextField.value) {
    let newPortNumber = Number(proxyPortTextField.value);
    if (newPortNumber >= 0 && newPortNumber <= 65535) {
        optionSettings.proxyPort = newPortNumber;
        console.log("changed Handler proxyPortTextField[" + optionSettings.proxyPort + "]");
    }
  }
  // always restore TextField value to the valid Storage data.
  proxyPortTextField.value = optionSettings.proxyPort;
  storeInputToStorage();
}

function exceptAllNoProxyCheckBoxChangeHandler() {
    optionSettings.exceptAllNoProxy.checked = exceptAllNoProxyCheckBox.checked;
    console.log("changed Handler exceptAllNoProxy:" + optionSettings.exceptAllNoProxy.checked);
    storeInputToStorage();
}
function exceptNoProxyMediaCheckBoxChangeHandler() {
    optionSettings.exceptNoProxyMedia.checked = exceptNoProxyMediaCheckBox.checked;
    console.log("changed Handler exceptNoProxyMedia:" + optionSettings.exceptNoProxyMedia.checked);
    storeInputToStorage();
}

function noProxyUrlRegexCaseSensitiveCheckBoxChangeHandler() {
    optionSettings.noProxyUrlRegexFlg = optionSettings.noProxyUrlRegexFlg.replaceAll("i", "");// remove i flag
    if (!noProxyUrlRegexCaseSensitiveCheckBox.checked) { // ignore case
        optionSettings.noProxyUrlRegexFlg = optionSettings.noProxyUrlRegexFlg + "i";// add i flag
    }
    console.log("changed Handler noProxyUrlRegexFlg[" + optionSettings.noProxyUrlRegexFlg + "]");
    storeInputToStorage();
}

function noProxyUrlRegexTextFieldChangeHandler() {
        optionSettings.noProxyUrlRegexString = noProxyUrlRegexTextField.value;
        console.log(
            "changed Handler noProxyUrlRegexString:"
             + optionSettings.noProxyUrlRegexString);
        storeInputToStorage();
}

function storeInputToStorage() {
    // setting checkboxes with default value in HTML 
    optionSettings.exceptAllNoProxy.checked = exceptAllNoProxyCheckBox.checked;
    optionSettings.exceptNoProxyMedia.checked = exceptNoProxyMediaCheckBox.checked;
    // store input value to the Storage.
    storeObjectToStorage(optionSettings)
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

function storeObjectToStorage(dataObject) {
    let storageObject = {};
    for (const [key, value] of Object.entries(dataObject)) {
        let valueData = value;
        storageObject[key] = valueData;
    }
    browser.storage.local.set(storageObject).then(
        ()=>{
            console.log("saved option settings to local storage");
        },
    onError);
}


// Update the options UI with the settings values retrieved from storage
function updateUI(restoredSettings) {

    console.log("update UI started.");
    // restore values to optionSettings from storage
    for (const [key, value] of Object.entries(restoredSettings)) {
        optionSettings[key] = value;
    }

    // restore values to UI from storage
    scanTargetHostsTextArea.value = restoredSettings.scanTargetHosts.join("\n");
    noProxyHostsTextArea.value = restoredSettings.noProxyHosts.join("\n") + "\n" + restoredSettings.noProxyHostsPartial.join("\n");
    proxyHostTextField.value = restoredSettings.proxyHost;
    proxyPortTextField.value = restoredSettings.proxyPort;
    noProxyMediaTextArea.value = restoredSettings.noProxyMedia.join("\n");
    exceptAllNoProxyCheckBox.checked = optionSettings.exceptAllNoProxy.checked;
    exceptNoProxyMediaCheckBox.checked = optionSettings.exceptNoProxyMedia.checked;
    noProxyUrlRegexTextField.value = restoredSettings.noProxyUrlRegexString;
    if (optionSettings.noProxyUrlRegexFlg.indexOf("i") > -1){
        noProxyUrlRegexCaseSensitiveCheckBox.checked = false;
    } else {
        noProxyUrlRegexCaseSensitiveCheckBox.checked = true;
    }
}

function handleResponse(message) {
    if (!message.error) {
        console.log(`Message from the background script: ${message.response}`);
        browser.storage.local.get().then(updateUI, onError);
    } else {
        console.log("Message from the background script: " + message.response);
    }
}


function handleFiles() {
  const fileList = this.files;
  const firstFile = fileList[0];
  console.log("importListener readAstext file[" + firstFile.name + "]");
  fileReader.readAsText(firstFile);
}

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
            console.log("value is [" + getType(value) + "]");
        }
    }
    return value;
}

function onError(e) {
  console.log(`Error: ${e}`);
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
            } else if (getType(value) === 'Object' ){
                console.log("value is [" + getType(value) + "]");
                mapData.set(key, value);
            } else {
                console.log("value is not our member type. ignored.");
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
        console.log(`Error: ${e}`);
    },
}

console.log("start options...");
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
noProxyUrlRegexTextField.addEventListener("change", noProxyUrlRegexTextFieldChangeHandler);
noProxyUrlRegexCaseSensitiveCheckBox.addEventListener("change", noProxyUrlRegexCaseSensitiveCheckBoxChangeHandler);

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
            const sending = browser.runtime.sendMessage({
                order: "reset",
              });
              sending.then(handleResponse, onError);
        }, onError);
    });
}
