# Competitive Companion

[![Build Status](https://dev.azure.com/jmerle/competitive-companion/_apis/build/status/Build?branchName=master)](https://dev.azure.com/jmerle/competitive-companion/_build/latest?definitionId=6&branchName=master)  
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg)](https://chrome.google.com/webstore/detail/competitive-companion/cjnmckjndlpiamhfimnnjmnckgghkjbl)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg)](https://chrome.google.com/webstore/detail/competitive-companion/cjnmckjndlpiamhfimnnjmnckgghkjbl)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg)](https://chrome.google.com/webstore/detail/competitive-companion/cjnmckjndlpiamhfimnnjmnckgghkjbl)  
[![Mozilla Add-on](https://img.shields.io/amo/v/competitive-companion.svg)](https://addons.mozilla.org/en-US/firefox/addon/competitive-companion/)
[![Mozilla Add-on Users](https://img.shields.io/amo/users/competitive-companion.svg)](https://addons.mozilla.org/en-US/firefox/addon/competitive-companion/)
[![Mozilla Add-on Rating](https://img.shields.io/amo/rating/competitive-companion.svg)](https://addons.mozilla.org/en-US/firefox/addon/competitive-companion/)  

A browser extension which parses programming problems from various online judges (like Codeforces and UVa) and sends them to various tools (like CHelper and Hightail). Capable of parsing problems and contests and extracting data like the example testcases and the time and memory constraints.

## Supported tools
- [CHelper](https://plugins.jetbrains.com/plugin/7091-chelper)
- [JHelper](https://plugins.jetbrains.com/plugin/7541-jhelper)
- [Hightail](https://github.com/dj3500/hightail)
- [Mind Sport](https://plugins.jetbrains.com/plugin/10688-mind-sport)
- [Caide](https://github.com/slycelote/caide)
- [acmX](https://marketplace.visualstudio.com/items?itemName=marx24.acmx)
- Any other tool that can parse the data that is being sent, read more about that below

## Supported websites
| Website               | Problem parser | Contest parser |
|-----------------------|----------------|----------------|
| A2OJ                  | ✔              |                |
| ACMP                  | ✔              |                |
| AtCoder               | ✔              | ✔              |
| Baekjoon Online Judge | ✔              | ✔              |
| Bloomberg CodeCon     | ✔              |                |
| CodeChef              | ✔              | ✔              |
| Codeforces            | ✔              | ✔              |
| CodeMarshal           | ✔              | ✔              |
| COJ                   | ✔              | ✔              |
| CSAcademy             | ✔              |                |
| CSU-ACM Online Judge  | ✔              | ✔              |
| DevSkill              | ✔              | ✔              |
| DMOJ                  | ✔              | ✔              |
| E-Olymp               | ✔              | ✔              |
| ECNU Online Judge     | ✔              | ✔              |
| Facebook Hacker Cup   | ✔              |                |
| FZU Online Judge      | ✔              | ✔              |
| Google Code Jam (new) | ✔              |                |
| Google Code Jam (old) |                | ✔              |
| Google Kick Start     | ✔              |                |
| HackerEarth           | ✔              | ✔              |
| HackerRank            | ✔              | ✔              |
| HDU Online Judge      | ✔              | ✔              |
| HIT Online Judge      | ✔              |                |
| hihoCoder             | ✔              | ✔              |
| Hrbust Online Judge   | ✔              |                |
| ICPC Live Archive     | ✔              |                |
| Jutge                 | ✔              |                |
| Kattis                | ✔              | ✔              |
| LightOJ               | ✔              | ✔              |
| MSK Informatics       | ✔              |                |
| NYTD Online Judge     | ✔              | ✔              |
| omegaUp               | ✔              |                |
| Panda Online Judge    | ✔              |                |
| PEG Judge             | ✔              | ✔              |
| POJ                   | ✔              | ✔              |
| QDUOJ                 | ✔              | ✔              |
| SPOJ                  | ✔              |                |
| Timus                 | ✔              | ✔              |
| Toph                  | ✔              |                |
| URI Online Judge      | ✔              | ✔              |
| USACO                 | ✔              |                |
| USACO Training        | ✔              |                |
| UVa Online Judge      | ✔              |                |
| Virtual Judge         | ✔              |                |
| Yandex                | ✔              |                |

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
Here's an example of the data sent when parsing [this](https://codeforces.com/problemset/problem/954/G) problem:

```json
{
    "name": "G. Castle Defense",
    "group": "Educational Codeforces Round 40 (Rated for Div. 2)",
    "url": "https://codeforces.com/problemset/problem/954/G",
    "interactive": false,
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
- **interactive** (optional): Whether this is an interactive problem or not.
- **memoryLimit**: The memory limit in MB.
- **timeLimit**: The time limit in ms.
- **testType**: The type of the tests. Supports two options: "single" and "multiNumber". Explanation of these two can be found on the [JHelper wiki](https://github.com/AlexeyDmitriev/JHelper/wiki/Usage).
- **input**: An object which is used to configure how to receive input. Supported types:
    - **stdin**: Receive input via stdin. No additional options required.
    - **file**: Receive input via a file. The file name has to be given via the **fileName** option.
- **output**: An object which is used to configure how to send output. Supported types:
    - **stdout**: Send output to stdout. No additional options required.
    - **file**: Send output to a file. The file name has to be given via the **fileName** option.
- **languages**: An object with language specific settings. At the moment this only contains Java settings, but since I don't think putting language specific settings as top-level options is a good idea, I decided to put them in an object. This also allows for other languages to have custom configuration added later on. Required keys:
    - **java**: An object with Java specific settings. Required options:
        - **mainClass**: The name of the outer class containing the solution.
        - **taskClass**: The classname-friendly version of the problem's full name. Cannot be the same as mainClass. Can also be useful for non-Java tools because a classname-friendly string is also a filename-friendly string.
- **tests**: An array of objects containing testcase-data. The JSON objects in the array all have two keys: **input** and **output**. Both the input and the output need to end with a newline character.

## Running locally
The following commands can be used to start working on Competitive Companion locally. Additionally, make sure you got [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/) installed.

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

## Testing
To run the tests, use `yarn test`, or `yarn test:no-headless` to run tests with the Chrome instance visible. All other arguments are automatically passed on to Jest.

## Mozilla reviewers
The information provided below is meant for Mozilla volunteers.

Software versions used:  
Node.js: 10.16.3  
Yarn: 1.17.3

Third-party libraries that can be found in the minified extension:  
- [nanobar 0.4.2](https://github.com/jacoborus/nanobar/blob/v0.4.2/nanobar.js)
- [snarkdown 1.2.2](https://github.com/developit/snarkdown/blob/1.2.2/src/index.js)
- [webextension-polyfill 0.5.0](https://github.com/mozilla/webextension-polyfill/blob/0.5.0/src/browser-polyfill.js)
- [pdfjs-dist 2.2.228](https://github.com/mozilla/pdfjs-dist/blob/v2.2.228/build/pdf.js)
- [cyrillic-to-translit-js 2.2.0](https://github.com/greybax/cyrillic-to-translit-js/blob/da91fe54d007f40d8e26c044082f60bbaea1b888/CyrillicToTranslit.js)

Package the extension by `cd`'ing into the source code submission directory, installing the dependencies with `yarn` and packaging with `yarn package`. The result can be found in the dist/ directory.

## Credits
This extension was made by [Jasper van Merle](https://github.com/jmerle). Much thanks to [Egor Kulikov](https://github.com/EgorKulikov) for making the CHelper plugin and the original CHelper extension, which was the reason this extension was created.
