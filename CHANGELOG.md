# 2.9.1 - November 12th, 2019
- Added the activeTab permission so the extension only has access to a tab when the extension is invoked by clicking the page action

# 2.9.0 - November 12th, 2019
- Added support for CodeMarshal (thanks [@NAbdulla1](https://github.com/NAbdulla1))

# 2.8.5 - September 23rd, 2019
- Added support for problems and contests hosted on *.codeforces.com subdomains

# 2.8.4 - September 19th, 2019
- Fixed the Toph parser

# 2.8.3 - July 2nd, 2019
- Fixed the HackerEarth CodeArena parser

# 2.8.2 - June 27th, 2019
- Fixed the AtCoder parser (thanks [@tatsumack](https://github.com/tatsumack))
- Added support for Caide

# 2.8.1 - June 13rd, 2019
- Fixed the Facebook Hacker Cup parser (thanks [@adambenali](https://github.com/adambenali))
- Reverted the performance improvement from 2.8.0 on the class that sends problem data to CHelper and JHelper

# 2.8.0 - June 1st, 2019
- Fixed the COJ parser and the Toph parser (thanks [@mfornet](https://github.com/mfornet) for the COJ fix)
- Added support for acmX (thanks [@mfornet](https://github.com/mfornet))
- Updated the way problem data is sent to tools so it doesn't stop half-way when sending large contests and to improve performance with sending problem data to CHelper and JHelper

# 2.7.3 - May 18th, 2019
- Fixed the USACO Training parser

# 2.7.2 - May 13rd, 2019
- Fixed the USACO Training parser

# 2.7.1 - May 7th, 2019
- Fixed the HackerEarth parser

# 2.7.0 - April 28th, 2019
- Added parsers for Baekjoon Online Judge
- Fixed the CodeChef and the new Google Code Jam parser (thanks [@andrewduffy](https://github.com/andrewduffey) for the Google Code Jam fix)
- Added support for Google Kick Start (thanks [@Ziklon](https://github.com/Ziklon))

# 2.6.1 - March 22nd, 2019
- Fixed the Codeforces and the new Google Code Jam parser

# 2.6.0 - February 3rd, 2019
- Added a parser for Bloomberg CodeCon (thanks [@kessido](https://github.com/kessido))

# 2.5.2 - January 23rd, 2019
- Improved the Virtual Judge parser

# 2.5.1 - January 21st, 2019
- Fixed the CodeChef parser

# 2.5.0 - December 24th, 2018
- Added a parser for Virtual Judge
- Fixed bugs in the ACMP, ECNU Online Judge, UVa Online Judge, ICPC Live Archive and AtCoder parsers (thanks [@m1kit](https://github.com/m1kit) for the AtCoder fix)
- Added "interactive" to the output format which specifies whether the problem is interactive or not
- Removed the regex input option

# 2.4.3 - December 14th, 2018
- Fixed bugs in the ACMP and the Toph parsers

# 2.4.2 - December 4th, 2018
- Fixed bugs in the Yandex, Panda Online Judge, ECNU Online Judge, Toph and Codeforces parsers
- Removed the MultiEOF test type because it wasn't being used by any parser

# 2.4.1 - October 29th, 2018
- Fixed the Codeforces parser when browsing the Russian version of Codeforces (thanks [@AlexeyDmitriev](https://github.com/AlexeyDmitriev))
- Made the extension compliant with Chrome Web Store's new requirements by disabling minimization of it's source code

# 2.4.0 - October 26th, 2018
- Added parsers for ACMP and MSK Informatics
- Fixed the Codeforces parser and the Panda Online Judge parser

# 2.3.2 - September 15th, 2018
- Fixed a bug in the UVa Online Judge and the ICPC Live Archive parsers

# 2.3.1 - September 14th, 2018
- Fixed bugs in the HackerRank, ECNU Online Judge, QDUOJ and NYTD Online Judge parsers
- Removed the SUSTech Online Judge parser

# 2.3.0 - September 9th, 2018
- Fixed bugs in the HackerRank, URI Online Judge and Codeforces parsers
- Added parsers for UVa Online Judge, ICPC Live Archive, FZU Online Judge, CSU-ACM Online Judge, Hrbust Online Judge, HIT Online Judge, hihoCoder, ECNU Online Judge, SUSTech Online Judge, QDUOJ and NYTD Online Judge

# 2.2.4 - June 30th, 2018
- Added support for AtCoder Beta

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

# 1.0.2 - December 31st, 2017
- Fixed a bug in the HackerEarth contest parser where it couldn't parse contests where the problems were divided into sets

# 1.0.1 - December 23rd, 2017
- Switched to the Kattis parser for custom tasks to fix compatibility with CHelper 4.1.11

# 1.0.0 - December 10th, 2017
- Initial release
