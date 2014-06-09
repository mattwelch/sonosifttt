## Description
A nodejs app to act as WordPress xml-rpc endpoint, to allow the use of the IFTTT WordPress channel as a means to control a Sonos system.
## Detailed Information
Check out [this blog post](http://mattwel.ch/if-this-then-sonos/) for a detailed description.
## Setup
Clone the git repo, cd into the created directory, and type npm install to install the required packages. Edit “sonosifttt.js” and change the port on the very last line to a number that works for you. Type node sonosifttt.js to start the server.

Next, get your router all set to forward data from external port 80 to the port you chose above. This procedure varies by router manufacturer, but you can generally find instructions by Googling your router make and model, and the phrase “port forwarding”.

Now get an IFTTT account all set up. Once this is done, you need to set up the WordPress channel. (Remember, we’re exploiting the relatively configurable nature of the WordPress channel on IFTTT). To set up the channel, go to the Channels page, scroll to the bottom, and select the WordPress icon.

Click on “Activate”, and enter the URL/ip address for your home network. Username and password are required, but are not checked anywhere, so you can enter anything in these field. If all goes well, once you click the “Activate” button on this page, IFTTT will reach out to your node server, running the sonosifttt.js code, and recognize a WP XML-RPC endpoint.

I noted above the username and password are not checked currently, and in the github code, they’re not. I’d highly recommend you put in some kind of username/password checking to reject any request from folks looking to mess with your Sonos system.

## Use
Using the fields in the WordPress channel, send commands to the Sonos system with this format:

* Title – Can be either “play”, “pause”, “favorite”, or “say”.
  * play – Play what ever is in the queue of the selected Zone
  * pause – Pause the selected Zone
  * favorite – Play the Sonos Favorite specified in the “Body” section
  * say – Speak the text specified in the “Body” section
* Body – Used to provide information for the “favorite” and “say” commands
  * for the “favorite” command – the EXACT name of the favorite you want to play
  * for the “say” command – the words you want spoken by your Sonos
* Categories – Comma-delimited list of Zones you want to be the receivers of the command. Note that if your selected Zone is the “child” in a Sonos Group, the commands will actually be applied to the “parent” of the group