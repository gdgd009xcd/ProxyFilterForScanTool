
## Description

When you browsing web sites through proxy, you may browser contents sometimes looks broken or hang tight
because contents consists of javascript/css based such as Angular or  they consists of movie streams.
This is because access through proxy invoke communication timeout or hang tight.
This extension allows you to directly access content that does not need to be accessed via a proxy, depending on the conditions you set in several options.
This extension uses the proxy API listener `onRequest` to listen for requests to visit a web page,


## how to use

### install  temporaliry in development mode

1. clone this repository into your favorite directory.<br>
e.g.: git clone https://github.com/gdgd009xcd/ProxyFilterForScanTool.git
1. access [debugging mode](about:debugging#/runtime/this-firefox) in firefox browser
2. click Load temporariry Add-on... button, and select this addon's manifest.json file.<br>
manifest.json file is exist under ProxyFilterForScanTool folder.

### install as addon

In preparation..

### how to configure

you can configure following options within addon's preference page.<br>
to access preference page,<br> you must type Ctrl + Shift + a (same as selecting [Add-ons and themes] menu)<br>
and click [...] and select preference menu item.
* Proxy Settings
  * scanTargetHosts:<br> The list of host to proxy. delimiter is "\n"
    (Note: you do NOT need to use escape sequence "\n" in this option form. simply type [Enter] Key.)

  * proxyHost: hostname of proxy server/tool. default is "127.0.0.1"
  * proxyPort: listening port number of proxyHost. default is "8040"
  * Except when mediaType matches No Proxy MediaType:<br>
    If checked, even if you add the host to scanTargetHosts,
    the addon will not make a proxy access if the request matches a No Proxy Media Type.

* No Proxy Access(Direct Access)
  * No Proxy domains:<br>
    The list of host to direct access. delimiter is "\n"
    (Note: you do NOT need to use escape sequence "\n" in this option form. simply type [Enter] Key.)<br>
    if you typed preceded "." hostname such as ".mozilla.com" then it matches any subdomain hosts of "mozilla.com"
  * Except above all No Proxy:<br>
    If this is checked, all hosts will be accessed directly unless it is in scanTargetHosts.<br>
    It doesn't matter if the host is in the No Proxy domains list or not.
  * No Proxy MediaType:<br>
    The list of mediaType to direct access.<br>
    This type is webRequest.ResourceType.<br>
    The type of resource being requested: for example, "image", "script", or "stylesheet".<br>
  * The PrimeHeader Regex for no proxy access:<br>
    if request's primeheader matches this regex, then request will be send host directly.
    The primeHeader consists of HttpMethod and URL
    HttpMethod:POST/GET/PUT/HEAD ...etc.
    Regex example: POST http://somewhere.com.*

* Option Settings Management
  * Import option settings from file:
    you can import settings from file which was exported by this addon.
  * Export option settings to file:
    you can export current option settings to file.
  * Restore option settings to factory default:
    if you want to reset option settings to default, you can click this button.

### how to see what this addon is doing
you can see this addon's console.log by typing Ctrl + Shift + J for opening console log 

