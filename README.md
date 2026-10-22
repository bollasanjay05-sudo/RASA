# RASA — Black & Gold / South Indian Doodle Edition

This is the previous RASA real-photography website with the *background only* updated.

## Updates
- Adds a faint WhatsApp-style tile of hand-drawn South Indian motifs: sikku kolam/muggulu, temple ratham, kuthuvilakku, lotus flower, gopuram, kalash and jasmine.
- Places the pattern behind hero, story, menu, kitchen, ambience, reservation and footer sections.
- Adds separate corner kolam accents; no strong background objects cover text/photos.
- Preserves gold Ganesha gates, reveal animation, header RASA text, favicon, menu filtering, image lightboxes and glowing borders.
- No ✺ symbol is used.

## Uploading to GitHub

**Simplest:** Use `index-standalone.html`, rename to `index.html`, then commit in the root of your GitHub repository. All CSS, JS, gate art, icons, and doodle SVGs are embedded in this single file. Google Fonts and demo photos still require internet.

**Normal separate files:** Upload `index.html`, `styles.css`, `script.js`, `site.webmanifest`, `favicon.ico`, and the whole `assets` folder, keeping file paths unchanged.

## Adjusting how noticeable the doodles are

Open `styles.css` (or the `<style>` section inside the single file) and find `--rasa-doodles-opacity`. Values around `.09` to `.18` are deliberately soft; use a lower number for more restrained decoration. The line-art sources are `assets/rasa-doodle-pattern.svg` and `assets/rasa-kolam-corner.svg`.

The imagery in the sample menu, ambience, and kitchen is illustrative, not documented photographs of RASA. Replace before launch. Configure actual booking contacts in script.js before accepting enquiries. Photo credits are in PHOTO-CREDITS.md.
