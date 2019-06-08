# Date Raider

This is a bare-bones stock trading simulator built entirely on Vue and localStorage. Stock data comes from the IEX API. Clear your browser's localStorage to reset everything.

Prices/unrealised gains will update themselves every 60 seconds to avoid spamming the API, but if there's no price movement, this will not be noticeable.

(go ahead and say the name out loud 5 times fast :) )

## Known issues

The graphing library I used does a pretty good job at responsively resizing, but it can get confused during long window resize drags. It works better if you only toggle browser responsive UI tools on 
and off instead of changing the size of the browser window.
