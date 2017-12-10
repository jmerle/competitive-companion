# CHelper Companion
An alternative to the original CHelper extension. It fixes several broken parsers in the original extension and adds contest parsers.

Available for [Chrome](https://chrome.google.com/webstore/detail/chelper-companion/cjnmckjndlpiamhfimnnjmnckgghkjbl) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/chelper-companion/).

## Supported websites
| Website             | Problem parser | Contest parser | 
|---------------------|----------------|----------------| 
| AtCoder             | ✔              | ✔*            | 
| Bayan               | ✔              |               | 
| CodeChef            | ✔*             | ✔*            | 
| Codeforces          | ✔              | ✔*            | 
| CSAcademy           | ✔*             |               | 
| E-Olymp             | ✔*             | ✔*            | 
| Facebook Hacker Cup | ✔              |               | 
| Google Code Jam     |                | ✔             | 
| HackerEarth         | ✔*             | ✔*            | 
| HackerRank          | ✔*             | ✔*            | 
| Kattis              | ✔              | ✔*            | 
| Timus               | ✔*             | ✔*            | 
| USACO               | ✔              |               | 
| Yandex              | ✔              |               | 

\* Not available (or working properly) in the original CHelper extension (v4.1.11.1)

## Packaging
This section is meant for anyone who wants to package the extension manually, but is especially written for the Mozilla volunteers who need to re-package the extension to be able to diff-check it with what I submit to AMO.

Verions used:
Node.js: 9.0.0  
Yarn: 1.3.2  
Windows 10 Pro

```bash
# Clone the repository (if you are not a Mozilla reviewer)
git clone https://github.com/jmerle/chelper-companion.git

# cd into the extension folder
cd chelper-companion

# Install the dependencies
yarn

# Package the app
yarn package
```

The packaged extension can be found in the `dist` directory.

## Credits
This extension was made by [Jasper van Merle](https://github.com/jmerle). Much thanks to [Egor Kulikov](https://github.com/EgorKulikov) for making the CHelper plugin and the original extension.
