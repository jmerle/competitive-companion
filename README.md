# CHelper Companion

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg)](https://chrome.google.com/webstore/detail/chelper-companion/cjnmckjndlpiamhfimnnjmnckgghkjbl)
[![Mozilla Add-on](https://img.shields.io/amo/v/chelper-companion.svg)](https://addons.mozilla.org/en-US/firefox/addon/chelper-companion/)

An alternative to the original CHelper extension. It fixes several broken problem parsers in the original extension and adds contest parsers.

## Supported websites
| Website             	| Problem parser 	| Contest parser 	|
|-----------------------|-----------------|-----------------|
| AtCoder             	| ✔              	| ✔              	|
| Bayan               	| ✔              	|                	|
| CodeChef            	| ✔              	| ✔              	|
| Codeforces          	| ✔              	| ✔              	|
| CSAcademy           	| ✔              	|                	|
| DevSkill            	| ✔              	| ✔              	|
| DMOJ                	| ✔              	| ✔              	|
| E-Olymp             	| ✔              	| ✔              	|
| Facebook Hacker Cup 	| ✔              	|                	|
| Google Code Jam (old)	|                	| ✔              	|
| Google Code Jam (new)	| ✔              	|                	|
| HackerEarth         	| ✔              	| ✔              	|
| HackerRank          	| ✔              	| ✔              	|
| Kattis              	| ✔              	| ✔              	|
| LightOJ              	| ✔              	| ✔              	|
| Timus               	| ✔              	| ✔              	|
| URI Online Judge     	| ✔              	| ✔              	|
| USACO               	| ✔              	|                	|
| USACO Training        | ✔              	|                	|
| Yandex              	| ✔              	|                	|

## Packaging
This section is meant for anyone who wants to package the extension manually, but is especially written for the Mozilla volunteers who need to re-package the extension to be able to diff-check it with what I submit to AMO.

Software versions:  
Node.js: 9.11.1  
Yarn: 1.5.1  
Ubuntu: 17.10

```bash
# Clone the repository (if you are not a Mozilla reviewer)
git clone https://github.com/jmerle/chelper-companion.git

# cd into the extension folder
cd chelper-companion

# Install the dependencies
yarn

# Package the extension
yarn package
```

The packaged extension can be found in the `dist` directory.

## Credits
This extension was made by [Jasper van Merle](https://github.com/jmerle). Much thanks to [Egor Kulikov](https://github.com/EgorKulikov) for making the CHelper plugin and the original extension.
