# About

This is a cross-browser extension to facilitate metadata research.

Development is tracked [here](https://www.notion.so/Academic-Review-Extension-21e1266c34b044a9bff2e8627ec94127?pvs=4).

## Installation
On Chrome,
1. Download the latest zip file in the [releases page](https://github.com/Yongbeom-Kim/academic-review-extension/releases)
2. Unzip your zip file
3. Go to your Manage Extensions page.
4. Turn on developer mode
5. Go to 'load unpacked' and select the file you just unzipped.
6. Your extension should be installed!

If you're on other browsers, you should have some similar version of these steps.

## Notes
### Known Issues
- Some journals have inconsistent formatting, and therefore all .csv files produced by this extensions have to be manually checked by hand. Example is [RBZ Volume 69](https://lkcnhm.nus.edu.sg/publications/raffles-bulletin-of-zoology/volumes/volume-69/), Corrigendum to Yasunaga T, Chérot F & Schwartz MD (2021).

### Opening in Microsoft Excel
- The .csv file that is emitted is in `UTF-8` formatting, and you will likely experience some form of text display issues.
- To mitigate this,
  1. Open a new Excel file
  2. Go to `import from Text/CSV`
  3. Select the file you want to import
  4. The formatting should be good now!