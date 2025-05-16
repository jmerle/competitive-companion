# Competitive Companion

[link-cws]: https://chromewebstore.google.com/detail/competitive-companion/cjnmckjndlpiamhfimnnjmnckgghkjbl
[link-amo]: https://addons.mozilla.org/en-US/firefox/addon/competitive-companion/

[![Build Status](https://github.com/jmerle/competitive-companion/workflows/Build/badge.svg)](https://github.com/jmerle/competitive-companion/actions/workflows/build.yml)  
[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg)][link-cws]
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg)][link-cws]
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg)][link-cws]  
[![Mozilla Add-on Version](https://img.shields.io/amo/v/competitive-companion.svg)][link-amo]
[![Mozilla Add-on Users](https://img.shields.io/amo/users/competitive-companion.svg)][link-amo]
[![Mozilla Add-on Rating](https://img.shields.io/amo/rating/competitive-companion.svg)][link-amo]

A browser extension which parses competitive programming problems from various online judges (like AtCoder and Codeforces) and sends them to various tools (like CP Editor and CPH). Capable of parsing problems and contests and extracting data like the example testcases and the time and memory constraints.

## Install
- [**Chrome** extension][link-cws] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/cjnmckjndlpiamhfimnnjmnckgghkjbl.svg?label=%20">][link-cws]
- [**Firefox** add-on][link-amo] [<img valign="middle" src="https://img.shields.io/amo/v/competitive-companion.svg?label=%20">][link-amo]

## Tools that use Competitive Companion
- [acmX](https://marketplace.visualstudio.com/items?itemName=marx24.acmx)
- [AI Virtual Assistant](https://github.com/Saurav-Paul/AI-virtual-assistant-python)
- [AutoCp](https://pushpavel.github.io/AutoCp/)
- [Caide](https://github.com/slycelote/caide)
- [CHelper](https://plugins.jetbrains.com/plugin/7091-chelper)
- [Competitive Programming Gradle Plugin](https://github.com/saurabh73/competitive-programming)
- [Competitive Programming Helper](https://marketplace.visualstudio.com/items?itemName=DivyanshuAgrawal.competitive-programming-helper)
- [CompetiTest.nvim](https://github.com/xeluxee/competitest.nvim)
- [CP Editor](https://github.com/coder3101/cp-editor)
- [cpbooster](https://www.npmjs.com/package/cpbooster)
- [cphelper.nvim](https://github.com/p00f/cphelper.nvim)
- [Hightail](https://github.com/dj3500/hightail)
- [JHelper](https://plugins.jetbrains.com/plugin/7541-jhelper)
- [Mind Sport](https://plugins.jetbrains.com/plugin/10688-mind-sport)
- [Red Panda Dev-C++](https://github.com/royqh1979/RedPanda-CPP)
- [rust-competitive-helper](https://github.com/rust-competitive-helper/rust-competitive-helper)
- Any other tool that can parse the data that is being sent, read more about that [below](#custom-tools)

## Supported websites
| Website                    | Problem parser | Contest parser |
|----------------------------|----------------|----------------|
| 33OJ                       | ✔              | ✔              |
| A2 Online Judge            | ✔              | ✔              |
| ACMP                       | ✔              |                |
| AcWing                     | ✔              |                |
| Aizu Online Judge          | ✔              |                |
| Algotester                 | ✔              |                |
| AlgoZenith                 | ✔              |                |
| Anarchy Golf               | ✔              |                |
| AtCoder                    | ✔              | ✔              |
| A.Y. Jackson Online Judge  | ✔              | ✔              |
| Baekjoon Online Judge      | ✔              |                |
| BAPS OJ                    | ✔              | ✔              |
| beecrowd                   | ✔              | ✔              |
| Bloomberg CodeCon          | ✔              |                |
| BUCTOJ                     | ✔              | ✔              |
| CodeChef                   | ✔              | ✔              |
| CodeDrills                 | ✔              |                |
| Codeforces                 | ✔              | ✔              |
| CodeMarshal                | ✔              | ✔              |
| CodeRun                    | ✔              | ✔              |
| CodeUp                     | ✔              |                |
| COJ                        | ✔              | ✔              |
| Contest Hunter             | ✔              | ✔              |
| CPython.uz                 | ✔              | ✔              |
| CS Academy                 | ✔              |                |
| CSES                       | ✔              | ✔              |
| CSU-ACM Online Judge       | ✔              | ✔              |
| CYEZOJ                     | ✔              | ✔              |
| Daimayuan Online Judge     | ✔              | ✔              |
| Dimik OJ                   | ✔              |                |
| DMOJ                       | ✔              | ✔              |
| DOMjudge                   |                | ✔              |
| Eolymp                     | ✔              | ✔              |
| ECNU Online Judge          | ✔              | ✔              |
| FZU Online Judge           | ✔              | ✔              |
| Google Coding Competitions | ✔              |                |
| HackerEarth                | ✔              | ✔              |
| HackerRank                 | ✔              | ✔              |
| HDOJ                       | ✔              | ✔              |
| HIT Online Judge           | ✔              |                |
| hihoCoder                  | ✔              | ✔              |
| HKOI Online Judge          | ✔              | ✔              |
| Hrbust Online Judge        | ✔              |                |
| Hydro                      | ✔              | ✔              |
| ICPC Live Archive          | ✔              |                |
| InfoArena                  | ✔              |                |
| ITCoder HUTECH             | ✔              |                |
| Jutge                      | ✔              |                |
| Kattis                     | ✔              | ✔              |
| KEP.uz                     | ✔              | ✔              |
| Kilonova                   | ✔              | ✔              |
| Lanqiao                    | ✔              | ✔              |
| Le Quy Don Online Judge    | ✔              | ✔              |
| Library Checker            | ✔              |                |
| LibreOJ                    | ✔              | ✔              |
| LightOJ                    | ✔              | ✔              |
| LSYOI                      | ✔              |                |
| Luogu                      | ✔              | ✔              |
| MarisaOJ                   | ✔              |                |
| Mendo                      | ✔              |                |
| Meta Coding Competitions   | ✔              |                |
| MOI Arena                  | ✔              | ✔              |
| mrJudge                    | ✔              |                |
| MSK Informatics            | ✔              |                |
| NBUT Online Judge          | ✔              | ✔              |
| Neps Academy               | ✔              |                |
| NerdArena                  | ✔              |                |
| Newton School              | ✔              |                |
| NOJ                        | ✔              | ✔              |
| NowCoder                   | ✔              |                |
| NYTD Online Judge          | ✔              | ✔              |
| oiClass                    | ✔              | ✔              |
| omegaUp                    | ✔              |                |
| OpenJudge                  | ✔              | ✔              |
| OTOG                       | ✔              |                |
| Panda Online Judge         | ✔              |                |
| PBInfo                     | ✔              |                |
| PEG Judge                  | ✔              | ✔              |
| POJ                        | ✔              | ✔              |
| PTA                        | ✔              |                |
| Public Judge               | ✔              | ✔              |
| QBXTOJ                     | ✔              |                |
| QDUOJ                      | ✔              | ✔              |
| QQWhale                    | ✔              |                |
| RoboContest                | ✔              | ✔              |
| SDUT OnlineJudge           | ✔              |                |
| SeriousOJ                  | ✔              | ✔              |
| Sort Me                    | ✔              |                |
| SPOJ                       | ✔              |                |
| SSOIER                     | ✔              |                |
| StarryCoding               | ✔              |                |
| TheJobOverflow             | ✔              |                |
| Timus Online Judge         | ✔              | ✔              |
| TLX                        | ✔              | ✔              |
| Toph                       | ✔              |                |
| uDebug                     | ✔              |                |
| Universal Cup              | ✔              | ✔              |
| UOJ                        | ✔              | ✔              |
| USACO                      | ✔              |                |
| USACO Training             | ✔              |                |
| UVa Online Judge           | ✔              |                |
| Virtual Judge              | ✔              | ✔              |
| VNOI Online Judge          | ✔              | ✔              |
| Yandex                     | ✔              | ✔              |
| XXM                        | ✔              |                |
| X-Camp                     | ✔              |                |
| yukicoder                  | ✔              | ✔              |
| ZOJ                        | ✔              |                |
| ZUFEOJ                     | ✔              | ✔              |

## Custom tools
Competitive Companion can send the parsed data in JSON format to your own tools. To do this, start an HTTP server listening for POST requests to / on any of the ports listed in [`./src/hosts/hosts.ts`](./src/hosts/hosts.ts). An example on how to accomplish this can be found in [jmerle/competitive-companion-example](https://github.com/jmerle/competitive-companion-example).

If you want your own tool added to the released version of Competitive Companion, [create an issue](https://github.com/jmerle/competitive-companion/issues/new) in this repository specifying the name and a link to the tool.

### The format
Here's an example of the data sent when parsing [Codeforces 954G](https://codeforces.com/problemset/problem/954/G):

```json
{
    "name": "G. Castle Defense",
    "group": "Codeforces - Educational Codeforces Round 40 (Rated for Div. 2)",
    "url": "https://codeforces.com/problemset/problem/954/G",
    "interactive": false,
    "memoryLimit": 256,
    "timeLimit": 1500,
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
    ],
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
    "batch": {
        "id": "123e67c8-03c6-44a4-a3f9-5918533f9fb2",
        "size": 1
    }
}
```

It's not required for a tool to parse all these options, since some of them are tool/language-specific. However, it is required for all extensions/tools that send data via this format to fill all required options.

#### Explanation

- **name**: The full name of the problem. Can be used for display purposes.
- **group**: Used to group problems together, which can be useful for archiving purposes. Follows the format `<judge> - <category>`, where the hyphen is discarded if the category is empty.
- **url**: A link to the problem on the judge's website.
- **interactive** (optional): Whether this is an interactive problem or not.
- **memoryLimit**: The memory limit in MB.
- **timeLimit**: The time limit in ms.
- **tests**: An array of objects containing testcase data. The JSON objects in the array all have two keys: **input** and **output**. Both the input and the output need to end with a newline character.
- **testType**: The type of the tests. Supports two options: "single" and "multiNumber". Explanation of these two can be found on the [JHelper wiki](https://github.com/AlexeyDmitriev/JHelper/wiki/Usage).
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
- **batch**: An object containing information about the batch of problems that this problem belongs to. Required options:
    - **id**: A UUIDv4 string which uniquely identifies a batch. All problems in a batch have the same batch id.
    - **size**: The size of the batch, which is 1 when using a problem parser and the amount of problems in the contest when using a contest parser.

## Running locally
The following commands can be used to start working on Competitive Companion locally. Additionally, make sure you got [Node.js](https://nodejs.org/en/) and [PNPM](https://pnpm.io/) installed.

```bash
# Clone the repository
git clone https://github.com/jmerle/competitive-companion.git

# cd into the extension folder
cd competitive-companion

# Install the dependencies
pnpm install

# Decide what you want to do next

# Build the Chrome code to the build-chrome/ directory
pnpm build:chrome

# Build the Firefox code to the build-firefox/ directory
pnpm build:firefox

# Lint the extension for possible mistakes
pnpm lint

# Package the extension to ZIP files
pnpm package

# Does the same as dev:firefox but with Chrome, with the exception that the extension is not automatically reloaded
# You'll have to manually go to chrome://extensions and click on the reload button on the Competitive Companion entry
pnpm dev:chrome

# Launch a Firefox instance with Competitive Companion loaded into a temporary profile
# Automatically re-compiles the code when the source changes
# Automatically reloads the extension in the Firefox instance when the code is re-compiled
pnpm dev:firefox
```

## Testing
To run the tests, use `pnpm test`, or `pnpm test:no-headless` to run tests with the Chrome instance visible. Append `-- -t <pattern>` to the command to only run tests with names matching the given pattern.

## Mozilla reviewers
The information provided below is meant for Mozilla volunteers.

Software versions used:  
Node.js: 22.12.0  
PNPM: 10.2.0

Third-party libraries that can be found in the minified extension:  
- [nanobar 0.4.2](https://github.com/jacoborus/nanobar/blob/v0.4.2/nanobar.js)
- [snarkdown 2.0.0](https://github.com/developit/snarkdown/blob/2.0.0/src/index.js)
- [pdfjs-dist 4.2.67](https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.mjs)
- [jszip 3.10.1](https://github.com/Stuk/jszip/blob/v3.10.1/dist/jszip.js)
- [cyrillic-to-translit-js 3.2.1](https://github.com/greybax/cyrillic-to-translit-js/blob/05f02e9e1df6d338f35258443f2e9c910bd8ccd4/CyrillicToTranslit.js)
- [p-limit 6.2.0](https://github.com/sindresorhus/p-limit/blob/v6.2.0/index.js)

Package the extension by `cd`'ing into the source code submission directory, installing the dependencies with `pnpm install` and packaging with `pnpm package:firefox`. The result can be found in the `dist/` directory.
