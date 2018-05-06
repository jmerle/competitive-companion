# Competitive Companion

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg)](https://chrome.google.com/webstore/detail/chelper-companion/cjnmckjndlpiamhfimnnjmnckgghkjbl)
[![Mozilla Add-on](https://img.shields.io/amo/v/competitive-companion.svg)](https://addons.mozilla.org/en-US/firefox/addon/competitive-companion/)

A browser extension which parses programming problems from various online judges and sends them to various tools. Capable of parsing problems and contests and extracting the data necessary to solve the problem like the example testcases and the time and memory constraints.

## Supported websites
| Website             	| Problem parser 	| Contest parser 	|
|-----------------------|-------------------|-------------------|
| AtCoder             	| ✔              	| ✔              	|
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
| Jutge               	| ✔              	|                	|
| Kattis              	| ✔              	| ✔              	|
| LightOJ              	| ✔              	| ✔              	|
| Panda Online Judge   	| ✔              	|                	|
| SPOJ                	| ✔              	|                	|
| Timus               	| ✔              	| ✔              	|
| URI Online Judge     	| ✔              	| ✔              	|
| USACO               	| ✔              	|                	|
| USACO Training        | ✔              	|                	|
| Yandex              	| ✔              	|                	|

## Supported tools
- CHelper
- Any other tool that can parse the data that is being sent, read more about that below

## Soon supported tools
- JHelper, will be added shortly after the changes from CHelper Beta 4.3.1b1 move into CHelper Stable
- Hightail, works when [this PR](https://github.com/dj3500/hightail/pull/107) is merged

## Custom tools
Competitive Companion can send the parsed data in JSON format to your own tools. An example on how to accomplish this can be found [here](https://github.com/jmerle/competitive-companion-example).

Steps:
1. Make your tool starts an HTTP server that listens for POST requests on `http://localhost:8080/`, where 8080 can be any port number.
2. Add the port that the HTTP server runs on to the "Custom ports" section in the extension's settings.
    - Chrome: right-click on the plus icon and select Options.
    - Firefox: go to `about:addons` and click on Preferences in Competitive Companion's row.
3. All the parsed data will now be sent to the port specified in step 2 in the format specified below. The JSON is sent in the body of the POST request.

If you want your own tool added to the released version of Competitive Companion, [create an issue](https://github.com/jmerle/competitive-companion/issues/new) in this repository specifying on what port your tool listens and a link to the tool.

### The format
Here's an example of the data sent when parsing [this](http://codeforces.com/problemset/problem/954/G) problem:

```json
{
    "name": "G. Castle Defense",
    "group": "Educational Codeforces Round 40 (Rated for Div. 2)",
    "url": "http://codeforces.com/problemset/problem/954/G",
    "memoryLimit": 256,
    "timeLimit": 1500,
    "testType": "single",
    "input": {
        "type": "stdin"
    },
    "output": {
        "type": "stdout"
    },
    "languages": {
        "java": {
            "mainClass": "Main",
            "taskClass": "GCastleDefense"
        }
    },
    "tests": [
        {
            "input": "5 0 6\n5 4 3 4 9\n",
            "output": "5\n"
        },
        {
            "input": "4 2 0\n1 2 3 4\n",
            "output": "6\n"
        },
        {
            "input": "5 1 1\n2 1 2 1 2\n",
            "output": "3\n"
        }
    ]
}
```

It's not required for a tool to parse all these options, since some of them are tool/language-specific. However, it is required for all extensions/tools that send data via this format to fill all required options.

#### Explanation

- **name**: The full name of the problem. Can be used for display purposes.
- **group**: Used to group problems together, which can be useful for archiving purposes.
- **url**: A link to the problem on the judge's website.
- **memoryLimit**: The memory limit in MB.
- **timeLimit**: The time limit in ms.
- **testType**: The type of the tests. Supports three options: "single", "multiNumber" and "multiEOF". Explanation of these three can be found on the [JHelper wiki](https://github.com/AlexeyDmitriev/JHelper/wiki/Usage).
- **input**: An object which is used to configure how to receive input. Supported types:
    - **stdin**: Receive input via stdin. No additional options required.
    - **file**: Receive input via a file. The file name has to be given via the **fileName** option.
    - **regex**: Receive input via a file. The file to use is selected by taking the most recently modified that matches the given regex. The regex pattern to use has to be given via the **pattern** option.
- **output**: An object which is used to configure how to send output. Supported types:
    - **stdout**: Send output to stdout. No additional options required.
    - **file**: Send output to a file. The file name has to be given via the **fileName** option.
- **languages**: An object with language specific settings. At the moment this only contains Java settings, but since I don't think putting language specific settings as top-level options is a good idea, I decided to put them in an object. This also allows for other languages to have custom configuration added later on. Required keys:
    - **java**: An object with Java specific settings. Required options:
        - **mainClass**: The name of the outer class containing the solution.
        - **taskClass**: The classname-friendly version of the problem's full name. Cannot be the same as mainClass. Can also be useful for non-Java tools because a classname-friendly string is also a filename-friendly string.
- **tests**: An array of objects containing testcase-data. The JSON objects in the array all have two keys: **input** and **output**. Both the input and the output need to end with a newline character.

## Running locally
The following commands can be used to start working on Competitive Companion locally.

```bash
# Clone the repository
git clone https://github.com/jmerle/competitive-companion.git

# cd into the extension folder
cd competitive-companion

# Install the dependencies
yarn

# Decide what you want to do next

# Build the code to the build/ directory
yarn build

# Build the code automatically when the source changes
yarn watch

# Lint the extension for possible mistakes
yarn lint

# Package the extension to a zip file
yarn package

# Launch a Firefox instance with Competitive Companion loaded into a temporary profile
# Automatically re-compiles the code when the source changes
# Automatically reloads the extension in the Firefox instance when the code is re-compiled
# Refresh the page after the extension got reloaded to see the new changes
yarn dev:firefox

# Does the same as dev:firefox but with Chrome, with the exception that the extension is not automatically reloaded
# You'll have to manually go to chrome://extensions and click on the reload button on the Competitive Companion entry
yarn dev:chrome
```

## Mozilla reviewers
The information provided below is meant for Mozilla volunteers.

Versions used:  
Node.js: 9.11.1  
Yarn: 1.6.0  
Ubuntu: 18.04  

Third-party libraries that can be found in the minified extension:
nanobar 0.4.2 - https://github.com/jacoborus/nanobar/blob/v0.4.2/nanobar.js
snarkdown 1.2.2 - https://github.com/developit/snarkdown/blob/1.2.2/src/index.js
webextension-polyfill 0.2.1 - https://github.com/mozilla/webextension-polyfill/blob/0.2.1/src/browser-polyfill.js

Package the extension by `cd`'ing into the source code submission directory, installing the dependencies with `yarn` and packaging with `yarn package`. The result can be found in the dist/ directory.

## Credits
This extension was made by [Jasper van Merle](https://github.com/jmerle). Much thanks to [Egor Kulikov](https://github.com/EgorKulikov) for making the CHelper plugin and the original extension, which was the reason this extension was created.
