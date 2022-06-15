# Changelog

## [2.34.1](https://github.com/jmerle/competitive-companion/releases/tag/2.34.1) (2022-06-16)
- Fixed the parsing of Kattis problems and contests to work with Kattis's new design

## [2.34.0](https://github.com/jmerle/competitive-companion/releases/tag/2.34.0) (2022-05-26)
- Removed the DevSkill parsers because DevSkill is no longer an online judge
- Fixed the parsing of CodeChef problems on its new problem page
- Fixed the parsing of Virtual Judge sample cases where the sample cases are displayed in a code block that is nested in another code block

## [2.33.0](https://github.com/jmerle/competitive-companion/releases/tag/2.33.0) (2022-04-03)
- Added a parser for Newton School
- Fixed the parsing of CodeChef sample cases for problems where the input/output headers are not prefixed with "Example" or "Sample"
- Fixed the parsing of CSES problems on CSES's www subdomain
- Fixed the parsing of BUCTOJ problems and contests
- Fixed the parsing of Neps Academy sample cases
- Fixed the parsing of Virtual Judge memory limits

## [2.32.0](https://github.com/jmerle/competitive-companion/releases/tag/2.32.0) (2022-02-17)
- Added a contest parser for Virtual Judge
- Fixed the parsing of NowCoder sample cases (thanks [@rogeryoungh](https://github.com/rogeryoungh))
- Fixed the parsing of BUCTOJ time limits
- Fixed the parsing of LibreOJ sample cases

## [2.31.3](https://github.com/jmerle/competitive-companion/releases/tag/2.31.3) (2022-01-12)
- Added support for Kattis problems in sessions (thanks [@user202729](https://github.com/user202729))
- Added support for SSOIER's extended problem set
- Fixed the parsing of Kattis sample cases with whitespace at the end of lines
- Fixed the parsing of Codeforces contests where some problem URLs redirect to a PDF file containing the problem statement
- Fixed the parsing of CodeChef sample cases where the sample cases are displayed as text nodes

## [2.31.2](https://github.com/jmerle/competitive-companion/releases/tag/2.31.2) (2021-12-26)
- Fixed the parsing of Hydro problems and contests

## [2.31.1](https://github.com/jmerle/competitive-companion/releases/tag/2.31.1) (2021-12-18)
- Fixed the parsing of DMOJ contest names
- Fixed the parsing of HackerEarth titles when parsing contest problems
- Fixed the parsing of Library Checker problems
- Fixed the parsing of Eolymp problems and contests

## [2.31.0](https://github.com/jmerle/competitive-companion/releases/tag/2.31.0) (2021-11-27)
- Added parsers for A2 Online Judge
- Added a contest parser for Luogu

## [2.30.0](https://github.com/jmerle/competitive-companion/releases/tag/2.30.0) (2021-11-11)
- Added parsers for BUCTOJ

## [2.29.0](https://github.com/jmerle/competitive-companion/releases/tag/2.29.0) (2021-11-08)
- Added parsers for NOJ
- Changed the error handling in contest parsers so that if a strict subset of the problems cannot be parsed an alert is shown and the successfully parsed problems are sent regardless

## [2.28.0](https://github.com/jmerle/competitive-companion/releases/tag/2.28.0) (2021-10-17)
- Added parsers for Hydro (thanks [@warshon](https://github.com/warshon))

## [2.27.0](https://github.com/jmerle/competitive-companion/releases/tag/2.27.0) (2021-10-08)
- Added a contest parser for Yandex (thanks [@user202729](https://github.com/user202729))
- Added parsers for Contest Hunter (thanks [@warshon](https://github.com/warshon))
- Improved the XXM parser (thanks [@warshon](https://github.com/warshon))
- Fixed the parsing of Yandex problems which don't have a time and/or memory limit

## [2.26.0](https://github.com/jmerle/competitive-companion/releases/tag/2.26.0) (2021-10-04)
- Added a parser for XXM (thanks [@warshon](https://github.com/warshon))
- Fixed the parsing of Yandex problems on URLs that do not include the problem letter
- Fixed the parsing of Neps Academy problems
- Fixed the parsing of CodeChef contests in which sample cases were parsed twice

## [2.25.10](https://github.com/jmerle/competitive-companion/releases/tag/2.25.10) (2021-08-27)
- Fixed the parsing of CodeChef sample cases for certain problems where the input/output is normal text in the problem statement

## [2.25.9](https://github.com/jmerle/competitive-companion/releases/tag/2.25.9) (2021-08-18)
- Fixed the parsing of CodeChef sample cases for certain problems where the input/output would start with a newline

## [2.25.8](https://github.com/jmerle/competitive-companion/releases/tag/2.25.8) (2021-08-16)
- Fixed the CodeDrills parser
- Fixed the parsing of CodeChef sample cases when parsing contests

## [2.25.7](https://github.com/jmerle/competitive-companion/releases/tag/2.25.7) (2021-08-09)
- Fixed the parsing of Kattis sample cases when there is no code block for a sample case's output

## [2.25.6](https://github.com/jmerle/competitive-companion/releases/tag/2.25.6) (2021-08-04)
- Fixed the parsing of sample cases when Grepper is installed
- Fixed the HDOJ parser

## [2.25.5](https://github.com/jmerle/competitive-companion/releases/tag/2.25.5) (2021-07-11)
- Fixed the parsing of DMOJ task names where the contest name is in the task name

## [2.25.4](https://github.com/jmerle/competitive-companion/releases/tag/2.25.4) (2021-07-03)
- Fixed the Facebook Coding Competitions parser

## [2.25.3](https://github.com/jmerle/competitive-companion/releases/tag/2.25.3) (2021-06-26)
- Fixed the parsing of Codeforces problems where the input/output specification is written in cursive
- Fixed the TLX parser

## [2.25.2](https://github.com/jmerle/competitive-companion/releases/tag/2.25.2) (2021-06-12)
- Fixed the CodeDrills parser

## [2.25.1](https://github.com/jmerle/competitive-companion/releases/tag/2.25.1) (2021-05-16)
- Fixed the parsing of AcWing sample cases of problems with code blocks unrelated to the sample cases

## [2.25.0](https://github.com/jmerle/competitive-companion/releases/tag/2.25.0) (2021-05-08)
- Added a parser for Neps Academy

## [2.24.0](https://github.com/jmerle/competitive-companion/releases/tag/2.24.0) (2021-05-03)
- Added a parser for AcWing
- Fixed the parsing of Codeforces sample cases containing empty lines

## [2.23.0](https://github.com/jmerle/competitive-companion/releases/tag/2.23.0) (2021-04-18)
- Added a parser for the old version of Library Checker (thanks [@taodaling](https://github.com/taodaling))
- Fixed the parsing of CS Academy problem titles

## [2.22.0](https://github.com/jmerle/competitive-companion/releases/tag/2.22.0) (2021-03-30)
- Added a parser for CodeDrills

## [2.21.2](https://github.com/jmerle/competitive-companion/releases/tag/2.21.2) (2021-03-28)
- Fixed the parsing of Google Coding Competitions sample cases so the full text is downloaded when necessary

## [2.21.1](https://github.com/jmerle/competitive-companion/releases/tag/2.21.1) (2021-03-21)
- Fixed the parsing of Luogu sample cases containing whitespace at the beginning
- Fixed the parsing of Google Coding Competitions sample cases in problems since 2021
- Fixed the parsing of HackerEarth sample cases in contest problems

## [2.21.0](https://github.com/jmerle/competitive-companion/releases/tag/2.21.0) (2021-03-14)
- Added a "batch" property to the output format, which makes it easier to know when an entire contest has been sent

## [2.20.0](https://github.com/jmerle/competitive-companion/releases/tag/2.20.0) (2021-03-08)
- Added a configurable option for the timeout of the requests sent to ports on which tools might be listening
- Fixed the memory limit parsing in the Yandex parser (thanks [@mfornet](https://github.com/mfornet))
- Fixed the parsing of Codeforces sample cases containing ampersands
- Fixed the Aizu Online Judge parser

## [2.19.9](https://github.com/jmerle/competitive-companion/releases/tag/2.19.9) (2021-02-26)
- Fixed the HackerEarth and the Toph parser

## [2.19.8](https://github.com/jmerle/competitive-companion/releases/tag/2.19.8) (2021-02-07)
- Improved the parsing of sample cases in the SPOJ and the CodeChef parser

## [2.19.7](https://github.com/jmerle/competitive-companion/releases/tag/2.19.7) (2021-01-28)
- Fixed the omegaUp parser

## [2.19.6](https://github.com/jmerle/competitive-companion/releases/tag/2.19.6) (2021-01-08)
- Fixed the LightOJ problem parser to make it work with the new website
- Removed the LightOJ contest parser because the new version of LightOJ doesn't support contests at the moment

## [2.19.5](https://github.com/jmerle/competitive-companion/releases/tag/2.19.5) (2020-12-31)
- Fixed the parsing of sample cases of certain problems in the SPOJ parser

## [2.19.4](https://github.com/jmerle/competitive-companion/releases/tag/2.19.4) (2020-12-22)
- Fixed the input/output format parsing in the USACO parser to accommodate the stdin/stdout input/output introduced in the December 2020 contest
- Fixed the parsing of sample cases in the USACO parser in case there are multiple sample cases
- Fixed the parsing of certain acm.sgu.ru problems in the Codeforces parser
- Fixed the Library Checker parser

## [2.19.3](https://github.com/jmerle/competitive-companion/releases/tag/2.19.3) (2020-12-14)
- Improved the UVa Online Judge parser so that it works with the PDFs hosted on [https://onlinejudge.org/external](https://onlinejudge.org/external) and [https://icpcarchive.ecs.baylor.edu/external](https://icpcarchive.ecs.baylor.edu/external) (not available on Firefox due to browser limitations)
- Fixed the category parsing in the Facebook Coding Competitions parser (again)

## [2.19.2](https://github.com/jmerle/competitive-companion/releases/tag/2.19.2) (2020-12-13)
- Fixed the parsing of sample cases in contest problems in the Virtual Judge parser
- Fixed the category parsing in the Facebook Coding Competitions parser

## [2.19.1](https://github.com/jmerle/competitive-companion/releases/tag/2.19.1) (2020-12-11)
- Fixed the parsing of sample cases in the CSES parser (thanks [@anandoza](https://github.com/anandoza))

## [2.19.0](https://github.com/jmerle/competitive-companion/releases/tag/2.19.0) (2020-11-28)
- Added support for TLX (thanks [@anandoza](https://github.com/anandoza))
- Fixed the parsing of problems and contests in the LibreOJ parsers
- Fixed the parsing of problems in the Library Checker parser

## [2.18.3](https://github.com/jmerle/competitive-companion/releases/tag/2.18.3) (2020-10-18)
- Fixed the parsing of interactive problems in the USACO parser
- Fixed the parsing of sample cases in the omegaUp parser (again)

## [2.18.2](https://github.com/jmerle/competitive-companion/releases/tag/2.18.2) (2020-10-17)
- Fixed the category parsing in the HackerRank contest parser in custom contests (thanks [@fcottet](https://github.com/fcottet))
- Fixed the category parsing in the HackerRank problem parser
- Fixed the parsing of public HackerRank contests
- Fixed the parsing of sample cases in the omegaUp parser

## [2.18.1](https://github.com/jmerle/competitive-companion/releases/tag/2.18.1) (2020-08-27)
- Removed the time and memory limit parsing from the MSK Informatics parser now that their problems no longer show these constraints

## [2.18.0](https://github.com/jmerle/competitive-companion/releases/tag/2.18.0) (2020-08-12)
- Added a parser for the non-beta version of Aizu Online Judge
- Re-added the regex input option for the Facebook Coding Competitions parser
- Fixed the parsing of titles in the AtCoder parser
- Fixed the time and memory limit parsing in the DMOJ parser when using DMOJ in a language other than English
- Fixed the time limit parsing in the Codeforces parser for problems in contests using a time limits scaling policy

## [2.17.4](https://github.com/jmerle/competitive-companion/releases/tag/2.17.4) (2020-08-02)
- Fixed the Codeforces contest parser to work with the m1, m2 and m3 subdomains

## [2.17.3](https://github.com/jmerle/competitive-companion/releases/tag/2.17.3) (2020-07-28)
- Fixed the parsing of sample testcases in the Facebook Coding Competitions parser
- Changed the input file name to a pattern in the Facebook Coding Competitions parser to make it work with validation and sample input files

## [2.17.2](https://github.com/jmerle/competitive-companion/releases/tag/2.17.2) (2020-07-20)
- Replaced the Facebook Hacker Cup parser with a Facebook Coding Competitions parser
- Fixed the time and memory limit parsing in the omegaUp parser
- Added support for cpbooster

## [2.17.1](https://github.com/jmerle/competitive-companion/releases/tag/2.17.1) (2020-07-03)
- Fixed the USACO Training parser so that the Java main class name is set to the id of the task
- Fixed the DMOJ parser so that problem titles for attempted problems are parsed correctly (thanks [@plasmatic1](https://github.com/plasmatic1))
- Fixed the parsing of sample testcases in the UVa parser
- Fixed the parsing of titles in the yukicoder parser

## [2.17.0](https://github.com/jmerle/competitive-companion/releases/tag/2.17.0) (2020-06-04)
- Added custom rules to the settings. When a rule's regular expression matches with the url of the problem that is being parsed, the parser configured in that rule is used instead of the default parser.
- Contest parsers now fetch contest problems in parallel, greatly decreasing the time it takes to parse large contests (thanks [@mfornet](https://github.com/mfornet))
- Fixed the Codeforces contest parser for contests which provide problem statements in PDF(s) (thanks [@mfornet](https://github.com/mfornet))
- Fixed the Toph parser so that it also runs on contest problems (thanks [@EgorKulikov](https://github.com/EgorKulikov))

## [2.16.1](https://github.com/jmerle/competitive-companion/releases/tag/2.16.1) (2020-05-25)
- Fixed the Yandex parser so that it works on yandex.ru/contest problems (thanks [@JVMusin](https://github.com/JVMusin))
- Fixed the categorization in the HackerEarth parser
- Fixed the URI Online Judge parser so that it works with the new problem pages

## [2.16.0](https://github.com/jmerle/competitive-companion/releases/tag/2.16.0) (2020-05-11)
- Added parsers for Aizu Online Judge, Anarchy Golf, Library Checker and yukicoder
- Removed the old Google Code Jam parser now that Google has taken it down and is moving everything to the Google Coding Competitions platform
- Improved the time and memory limit parsing in the UOJ parser
- Fixed the Codeforces parser for the m1, m2 and m3 subdomains
- Fixed the Codeforces parser for certain acm.sgu.ru problems (thanks [@JVMusin](https://github.com/JVMusin))

## [2.15.4](https://github.com/jmerle/competitive-companion/releases/tag/2.15.4) (2020-05-05)
- Added Russian language support to the Timus parser (thanks [@JVMusin](https://github.com/JVMusin))

## [2.15.3](https://github.com/jmerle/competitive-companion/releases/tag/2.15.3) (2020-04-22)
- Added support for multiple test cases to the Google Coding Competitions parser (thanks [@adambenali](https://github.com/adambenali))

## [2.15.2](https://github.com/jmerle/competitive-companion/releases/tag/2.15.2) (2020-04-20)
- Fixed parsing acm.sgu.ru problems in the Codeforces parser (thanks [@JVMusin](https://github.com/JVMusin))
- Added support for multiple test cases to the SPOJ parser (thanks [@JVMusin](https://github.com/JVMusin))
- Fixed parsing time limits in the Toph parser (thanks [@JVMusin](https://github.com/JVMusin))

## [2.15.1](https://github.com/jmerle/competitive-companion/releases/tag/2.15.1) (2020-04-17)
- Fixed parsing time and memory limits in the Codeforces parser

## [2.15.0](https://github.com/jmerle/competitive-companion/releases/tag/2.15.0) (2020-04-10)
- Made the format of the "group" key in the extracted problem data consistent across parsers
- Added a parser for mrJudge
- Added support for educational courses on Codeforces (thanks [@JVMusin](https://github.com/JVMusin))
- Fixed the Luogu, Codeforces and CodeChef parsers
- Removed the A2OJ parser

## [2.14.0](https://github.com/jmerle/competitive-companion/releases/tag/2.14.0) (2020-04-06)
- Changed the way the extension loads its scripts so that it needs less permissions. This also fixes the Google Coding Competitions parser which previously only worked when the problem page was refreshed before parsing.
- Added a "Parse with" context menu item to the plus icon which can be used to parse any page with any parser
- Added support for the codeforc.es mirror to the Codeforces parsers

## [2.13.0](https://github.com/jmerle/competitive-companion/releases/tag/2.13.0) (2020-03-22)
- Added parsers for CSES, SSOIER and UOJ
- Fixed the Virtual Judge and the COJ parser
- Added support for the codeforces.ml mirror to the Codeforces parsers

## [2.12.0](https://github.com/jmerle/competitive-companion/releases/tag/2.12.0) (2020-01-31)
- Added a parser for NowCoder (thanks [@landcold7](https://github.com/landcold7))
- Added support for CP Editor

## [2.11.0](https://github.com/jmerle/competitive-companion/releases/tag/2.11.0) (2020-01-17)
- Added a contest parser for LibreOJ
- Fixed the LibreOJ problem parser so that it works on contest problems as well
- Fixed a typo in the Luogu problem parser
- Added support for Competitive Programming Helper

## [2.10.0](https://github.com/jmerle/competitive-companion/releases/tag/2.10.0) (2020-01-04)
- Updated the urls Competitive Companion runs on, it no longer runs on all urls but only on the urls that it has a parser for
- Added a parser for Luogu and LibreOJ
- Fixed the UVa Online Judge parser

## [2.9.2](https://github.com/jmerle/competitive-companion/releases/tag/2.9.2) (2019-12-16)
- Fixed the AtCoder and the Timus Online Judge parser (thanks [@champon1020](https://github.com/champon1020) for the AtCoder fix)

## [2.9.1](https://github.com/jmerle/competitive-companion/releases/tag/2.9.1) (2019-11-12)
- Added the activeTab permission so the extension only has access to a tab when the extension is invoked by clicking the page action

## [2.9.0](https://github.com/jmerle/competitive-companion/releases/tag/2.9.0) (2019-11-12)
- Added support for CodeMarshal (thanks [@NAbdulla1](https://github.com/NAbdulla1))

## [2.8.5](https://github.com/jmerle/competitive-companion/releases/tag/2.8.5) (2019-09-23)
- Added support for problems and contests hosted on *.codeforces.com subdomains

## [2.8.4](https://github.com/jmerle/competitive-companion/releases/tag/2.8.4) (2019-09-19)
- Fixed the Toph parser

## [2.8.3](https://github.com/jmerle/competitive-companion/releases/tag/2.8.3) (2019-07-02)
- Fixed the HackerEarth CodeArena parser

## [2.8.2](https://github.com/jmerle/competitive-companion/releases/tag/2.8.2) (2019-06-27)
- Fixed the AtCoder parser (thanks [@tatsumack](https://github.com/tatsumack))
- Added support for Caide

## [2.8.1](https://github.com/jmerle/competitive-companion/releases/tag/2.8.1) (2019-06-13)
- Fixed the Facebook Hacker Cup parser (thanks [@adambenali](https://github.com/adambenali))
- Reverted the performance improvement from 2.8.0 on the class that sends problem data to CHelper and JHelper

## [2.8.0](https://github.com/jmerle/competitive-companion/releases/tag/2.8.0) (2019-06-01)
- Fixed the COJ parser and the Toph parser (thanks [@mfornet](https://github.com/mfornet) for the COJ fix)
- Added support for acmX (thanks [@mfornet](https://github.com/mfornet))
- Updated the way problem data is sent to tools so it doesn't stop half-way when sending large contests and to improve performance with sending problem data to CHelper and JHelper

## [2.7.3](https://github.com/jmerle/competitive-companion/releases/tag/2.7.3) (2019-05-18)
- Fixed the USACO Training parser

## [2.7.2](https://github.com/jmerle/competitive-companion/releases/tag/2.7.2) (2019-05-13)
- Fixed the USACO Training parser

## [2.7.1](https://github.com/jmerle/competitive-companion/releases/tag/2.7.1) (2019-05-07)
- Fixed the HackerEarth parser

## [2.7.0](https://github.com/jmerle/competitive-companion/releases/tag/2.7.0) (2019-04-28)
- Added parsers for Baekjoon Online Judge
- Fixed the CodeChef and the new Google Code Jam parser (thanks [@andrewduffy](https://github.com/andrewduffey) for the Google Code Jam fix)
- Added support for Google Kick Start (thanks [@Ziklon](https://github.com/Ziklon))

## [2.6.1](https://github.com/jmerle/competitive-companion/releases/tag/2.6.1) (2019-03-22)
- Fixed the Codeforces and the new Google Code Jam parser

## [2.6.0](https://github.com/jmerle/competitive-companion/releases/tag/2.6.0) (2019-02-03)
- Added a parser for Bloomberg CodeCon (thanks [@kessido](https://github.com/kessido))

## [2.5.2](https://github.com/jmerle/competitive-companion/releases/tag/2.5.2) (2019-01-23)
- Improved the Virtual Judge parser

## [2.5.1](https://github.com/jmerle/competitive-companion/releases/tag/2.5.1) (2019-01-21)
- Fixed the CodeChef parser

## [2.5.0](https://github.com/jmerle/competitive-companion/releases/tag/2.5.0) (2018-12-24)
- Added a parser for Virtual Judge
- Fixed bugs in the ACMP, ECNU Online Judge, UVa Online Judge, ICPC Live Archive and AtCoder parsers (thanks [@m1kit](https://github.com/m1kit) for the AtCoder fix)
- Added "interactive" to the output format which specifies whether the problem is interactive or not
- Removed the regex input option

## [2.4.3](https://github.com/jmerle/competitive-companion/releases/tag/2.4.3) (2018-12-14)
- Fixed bugs in the ACMP and the Toph parsers

## [2.4.2](https://github.com/jmerle/competitive-companion/releases/tag/2.4.2) (2018-12-04)
- Fixed bugs in the Yandex, Panda Online Judge, ECNU Online Judge, Toph and Codeforces parsers
- Removed the MultiEOF test type because it wasn't being used by any parser

## [2.4.1](https://github.com/jmerle/competitive-companion/releases/tag/2.4.1) (2018-10-29)
- Fixed the Codeforces parser when browsing the Russian version of Codeforces (thanks [@AlexeyDmitriev](https://github.com/AlexeyDmitriev))
- Made the extension compliant with Chrome Web Store's new requirements by disabling minimization of it's source code

## [2.4.0](https://github.com/jmerle/competitive-companion/releases/tag/2.4.0) (2018-10-26)
- Added parsers for ACMP and MSK Informatics
- Fixed the Codeforces parser and the Panda Online Judge parser

## [2.3.2](https://github.com/jmerle/competitive-companion/releases/tag/2.3.2) (2018-09-15)
- Fixed a bug in the UVa Online Judge and the ICPC Live Archive parsers

## [2.3.1](https://github.com/jmerle/competitive-companion/releases/tag/2.3.1) (2018-09-14)
- Fixed bugs in the HackerRank, ECNU Online Judge, QDUOJ and NYTD Online Judge parsers
- Removed the SUSTech Online Judge parser

## [2.3.0](https://github.com/jmerle/competitive-companion/releases/tag/2.3.0) (2018-09-09)
- Fixed bugs in the HackerRank, URI Online Judge and Codeforces parsers
- Added parsers for UVa Online Judge, ICPC Live Archive, FZU Online Judge, CSU-ACM Online Judge, Hrbust Online Judge, HIT Online Judge, hihoCoder, ECNU Online Judge, SUSTech Online Judge, QDUOJ and NYTD Online Judge

## [2.2.4](https://github.com/jmerle/competitive-companion/releases/tag/2.2.4) (2018-06-30)
- Added support for AtCoder Beta

## [2.2.3](https://github.com/jmerle/competitive-companion/releases/tag/2.2.3) (2018-06-27)
- Fixed a bug in the DMOJ parser

## [2.2.2](https://github.com/jmerle/competitive-companion/releases/tag/2.2.2) (2018-06-19)
- Fixed the CodeChef parser

## [2.2.1](https://github.com/jmerle/competitive-companion/releases/tag/2.2.1) (2018-06-18)
- Added a shortcut (default: Ctrl+Shift+U) to parse the problem/contest without having to click the green plus icon

## [2.2.0](https://github.com/jmerle/competitive-companion/releases/tag/2.2.0) (2018-06-18)
- Added parsers for A2OJ, HDU Online Judge, Toph, PEG Judge, POJ, omegaUp and COJ
- Fixed the HackerRank and the SPOJ parsers

## [2.1.1](https://github.com/jmerle/competitive-companion/releases/tag/2.1.1) (2018-06-02)
- Switched the CHelper implementation to send all tasks to the JSONParser, instead of disguising them as Kattis tasks

## [2.1.0](https://github.com/jmerle/competitive-companion/releases/tag/2.1.0) (2018-05-29)
- Fixed bugs in the HackerRank, CodeChef, Codeforces, DevSkill, LightOJ, Timus and URI Online Judge parsers
- Added tests for nearly all parsers
- Cyrillic characters are now removed from Java class names

## [2.0.1](https://github.com/jmerle/competitive-companion/releases/tag/2.0.1) (2018-05-08)
- Fixed the HackerRank parser
- Added support for Mind Sport

## [2.0.0](https://github.com/jmerle/competitive-companion/releases/tag/2.0.0) (2018-05-06)
- Renamed CHelper Companion to Competitive Companion
- Moved all parsers over to a TypeScript implementation
- Tasks can now be sent in a universal JSON format, making it possible to support more than just CHelper
- Added the option to specify custom ports which makes it possible to send the JSON format to any port on localhost, making it possible to send the parsed problem data to private tools
- Added support for the acm.sgu.ru problems on Codeforces and added a parser for Jutge
- Removed the Bayan parser

## [1.2.2](https://github.com/jmerle/competitive-companion/releases/tag/1.2.2) (2018-05-05)
- Fixed the Codeforces and the CodeChef parser

## [1.2.1](https://github.com/jmerle/competitive-companion/releases/tag/1.2.1) (2018-04-13)
- Reverted Codeforces parser back to my own implementation

## [1.2.0](https://github.com/jmerle/competitive-companion/releases/tag/1.2.0) (2018-04-09)
- Fixed USACO parser
- Reverted Codeforces parser back to the CHelper one
- Switched the new Google Code Jam parser to the CHelper one
- Added parsers for USACO Training, DevSkill, DMOJ, URI Online Judge, LightOJ, SPOJ and Panda Online Judge

## [1.1.0](https://github.com/jmerle/competitive-companion/releases/tag/1.1.0) (2018-04-01)
- Added support for the new Google Code Jam website
- Updated all dependencies
- Removed all default exports

## [1.0.4](https://github.com/jmerle/competitive-companion/releases/tag/1.0.4) (2018-02-23)
- Added support for contests and problems in Codeforces groups

## [1.0.3](https://github.com/jmerle/competitive-companion/releases/tag/1.0.3) (2018-02-19)
- Switched the Codeforces problem parser from the default one in the CHelper plugin to a custom one, because the one in the CHelper plugin is not working properly at the moment

## [1.0.2](https://github.com/jmerle/competitive-companion/releases/tag/1.0.2) (2017-12-31)
- Fixed a bug in the HackerEarth contest parser where it couldn't parse contests where the problems were divided into sets

## [1.0.1](https://github.com/jmerle/competitive-companion/releases/tag/1.0.1) (2017-12-23)
- Switched to the Kattis parser for custom tasks to fix compatibility with CHelper 4.1.11

## [1.0.0](https://github.com/jmerle/competitive-companion/releases/tag/1.0.0) (2017-12-10)
- Initial release
