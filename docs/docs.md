## Structure

### Extension Scripts ([`/src/extension/`](/src/extension/))
- Extension scripts are the main scripts that drive *in-page* extension behavior (i.e. icon press, sidebar, etc.)
- [`.../comonents/`](/src/extension/components/) hold components (e.g. sidebar)
- [`.../website_driver/`](/src/extension/website_driver) holds website-specific parsing classes to retrieve links.

### Extension Pages ([`/src/extension_page/`](/src/extension_page/))
- This holds the extension-specific page stuff.