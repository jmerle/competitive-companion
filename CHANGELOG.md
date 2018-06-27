# 2.2.3 - June 27th, 2018
- Fixed a bug in the DMOJ parser

# 2.2.2 - June 19th, 2018
- Fixed the CodeChef parser

# 2.2.1 - June 18th, 2018
- Added a shortcut (default: Ctrl+Shift+U) to parse the problem/contest without having to click the green plus icon

# 2.2.0 - June 18th, 2018
- Added parsers for A2OJ, HDU Online Judge, Toph, PEG Judge, POJ, omegaUp and COJ
- Fixed the HackerRank and the SPOJ parsers

# 2.1.1 - June 2nd, 2018
- Switched the CHelper implementation to send all tasks to the JSONParser, instead of disguising them as Kattis tasks

# 2.1.0 - May 29th, 2018
- Fixed bugs in the HackerRank, CodeChef, Codeforces, DevSkill, LightOJ, Timus and URI Online Judge parsers
- Added tests for nearly all parsers
- Cyrillic characters are now removed from Java class names

# 2.0.1 - May 8th, 2018
- Fixed the HackerRank parser
- Added support for Mind Sport

# 2.0.0 - May 6th, 2018
- Renamed CHelper Companion to Competitive Companion
- Moved all parsers over to a TypeScript implementation
- Tasks can now be sent in a universal JSON format, making it possible to support more than just CHelper
- Added the option to specify custom ports which makes it possible to send the JSON format to any port on localhost, making it possible to send the parsed problem data to private tools
- Added support for the acm.sgu.ru problems on Codeforces and added a parser for Jutge
- Removed the Bayan parser

# 1.2.2 - May 5th, 2018
- Fixed the Codeforces and the CodeChef parser

# 1.2.1 - April 13th, 2018
- Reverted Codeforces parser back to my own implementation

# 1.2.0 - April 9th, 2018
- Fixed USACO parser
- Reverted Codeforces parser back to the CHelper one
- Switched the new Google Code Jam parser to the CHelper one
- Added parsers for USACO Training, DevSkill, DMOJ, URI Online Judge, LightOJ, SPOJ and Panda Online Judge

# 1.1.0 - April 1st, 2018
- Added support for the new Google Code Jam website
- Updated all dependencies
- Removed all default exports

# 1.0.4 - February 23rd, 2018
- Added support for contests and problems in Codeforces groups

# 1.0.3 - February 19th, 2018
- Switched the Codeforces problem parser from the default one in the CHelper plugin to a custom one, because the one in the CHelper plugin is not working properly at the moment

# 1.0.2 - December 31th, 2017
- Fixed a bug in the HackerEarth contest parser where it couldn't parse contests where the problems were divided into sets

# 1.0.1 - December 23rd, 2017
- Switched to the Kattis parser for custom tasks to fix compatibility with CHelper 4.1.11

# 1.0.0 - December 10th, 2017
- Initial release
