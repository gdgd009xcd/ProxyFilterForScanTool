
## Description

When you browsing web sites through proxy, you may browser contents sometimes looks broken or hang tight
because contents consists of javascript/css based such as Angular or something.
This is because access through proxy invoke communication timeout or hang tight.
This extension provides to direct access these  javascript/css content that is not needed for vulnerability tests. 
This extension uses the proxy API listener `onRequest` to listen for requests to visit a web page, 
compare the webpage's domain with "scanTargetHosts" list and proxy domains on the "scanTargetHosts" list to specified host:port.

you can configure following options within addon's options.html page.
* scanTargetHosts: list of host to proxy. delimiter is "\n"
 (Note: you do NOT need to use escape sequence "\n" in this option form. simply type [Enter] Key.)
  default is "example1.com\nexample2.com"

* proxyHost: hostname of proxy server/tool. default is "127.0.0.1"
* proxyPort: listening port number of proxyHost. default is "8040"


