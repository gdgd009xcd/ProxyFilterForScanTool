const scanTargetHostsTextArea = document.querySelector("#scan-target-hosts");
const noProxyHostsTextArea = document.querySelector("#no-proxy-hosts");
const proxyHostTextField = document.querySelector("#proxyhost");
const proxyPortTextField = document.querySelector("#proxyport");
let scanTargetHosts = [];
let noProxyHosts = [];
let noProxyHostsPartial = [];
let proxyHost = "";
let proxyPort = -1;

// Store the currently selected settings using browser.storage.local.
function scanTargetHostsTextAreaChangeHandler() {
  if (scanTargetHostsTextArea.value) {
    scanTargetHosts = scanTargetHostsTextArea.value.split("\n");
  } else {
    scanTargetHosts = [];
  }

  console.log("changed scanTargetHostsTextArea[" + scanTargetHostsTextArea.value + "] scanTargetHosts.length=" + scanTargetHosts.length);
  browser.storage.local.set({
    scanTargetHosts: scanTargetHosts,
    noProxyHosts: noProxyHosts,
    noProxyHostsPartial: noProxyHostsPartial,
    proxyHost: proxyHost,
    proxyPort: proxyPort
  });
}

function noProxyHostsTextAreaChangeHandler() {
  noProxyHosts = [];
  noProxyHostsPartial = [];
  let noProxyHostsChangedValues = [];
  if (noProxyHostsTextArea.value) {
    noProxyHostsChangedValues = noProxyHostsTextArea.value.split("\n");
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

  console.log("changed noProxyHostsTextArea["
   + noProxyHostsTextArea.value
   + "] noProxyHosts.length="
    + noProxyHosts.length
     + " noProxyHostsPartial.length=" + noProxyHostsPartial.length);
  browser.storage.local.set({
    scanTargetHosts: scanTargetHosts,
    noProxyHosts: noProxyHosts,
    noProxyHostsPartial: noProxyHostsPartial,
    proxyHost: proxyHost,
    proxyPort: proxyPort
  });
}

function proxyHostTextFieldChangeHandler() {
  if (proxyHostTextField.value) {
    proxyHost = proxyHostTextField.value;
    console.log("changed proxyHostTextField[" + proxyHost + "]");
  }

  // always restore TextField value to the valid Storage data.
  proxyHostTextField.value = proxyHost;
  // store input value to the Storage.
  browser.storage.local.set({
    scanTargetHosts: scanTargetHosts,
    noProxyHosts: noProxyHosts,
    noProxyHostsPartial: noProxyHostsPartial,
    proxyHost: proxyHost,
    proxyPort: proxyPort
  });
}

function proxyPortTextFieldChangeHandler() {

  if (proxyPortTextField.value) {
    let newPortNumber = Number(proxyPortTextField.value);
    if (newPortNumber >= 0 && newPortNumber <= 65535) {
        proxyPort = newPortNumber;
        console.log("changed proxyPortTextField[" + proxyPort + "]");
    }
  }
  // always restore TextField value to the valid Storage data.
  proxyPortTextField.value = proxyPort;
  // store input value to the Storage.
  browser.storage.local.set({
    scanTargetHosts: scanTargetHosts,
    noProxyHosts: noProxyHosts,
    noProxyHostsPartial: noProxyHostsPartial,
    proxyHost: proxyHost,
    proxyPort: proxyPort
  });
}

// Update the options UI with the settings values retrieved from storage
function updateUI(restoredSettings) {
  scanTargetHostsTextArea.value = restoredSettings.scanTargetHosts.join("\n");
  noProxyHostsTextArea.value = restoredSettings.noProxyHosts.join("\n") + "\n" + restoredSettings.noProxyHostsPartial.join("\n");
  proxyHostTextField.value = restoredSettings.proxyHost;
  proxyPortTextField.value = restoredSettings.proxyPort;
  scanTargetHosts = restoredSettings.scanTargetHosts;
  noProxyHosts = restoredSettings.noProxyHosts;
  noProxyHostsPartial = restoredSettings.noProxyHostsPartial;
  proxyHost = restoredSettings.proxyHost;
  proxyPort = restoredSettings.proxyPort;
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
