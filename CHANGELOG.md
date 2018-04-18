# 1.3.0 - Unknown
- Tasks are now sent as JSON-encoded strings
- The extension can now be used with any tool that can receive and parse the JSON data
- Added an options page where custom ports to send the JSON data to can be set
- The extension now works out-of-the-box with CHelper, JHelper and Hightail
- Converted all parsers that relied on CHelper to a JavaScript implementation
- Added Jutge parser and removed the Bayan parser
- Fixed the issue in Chrome where the console would be filled with "The message port closed before a reponse was received." messages

# 1.2.1 - April 13th, 2018
- Reverted CodeForces parser back to my own implementation

# 1.2.0 - April 9th, 2018
- Fixed USACO parser
- Reverted CodeForces parser back to the CHelper one
- Switched the new Google Code Jam parser to the CHelper one
- Added parsers for USACO Training, DevSkill, DMOJ, URI Online Judge, LightOJ, SPOJ and Panda Online Judge

# 1.1.0 - April 1st, 2018
- Added support for the new Google Code Jam website
- Updated all dependencies
- Removed all default exports

# 1.0.4 - February 23rd, 2018
- Added support for contests and problems in CodeForces groups

# 1.0.3 - February 19th, 2018
- Switched the CodeForces problem parser from the default one in the CHelper plugin to a custom one, because the one in the CHelper plugin is not working properly at the moment

# 1.0.2 - December 31th, 2017
- Fixed a bug in the HackerEarth contest parser where it couldn't parse contests where the problems were divided into sets

# 1.0.1 - December 23rd, 2017
- Switched to the Kattis parser for custom tasks to fix compatibility with CHelper 4.1.11

# 1.0.0 - December 10th, 2017
- Initial release
