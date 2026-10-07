# SKÅDIS Shelf Studio

A standalone browser tool for designing SKÅDIS-style shelves, organizers, and their mounting hooks.

## Use it

Download `SKADIS_Shelf_Studio.html` and open it in a current Chrome or Edge browser. Nothing to install; the file works offline. Choose a style, set the size, inspect the 3D preview, and download a model as STL or 3MF. On a phone, the Preview & download button returns you to the preview after editing.

## Custom printer build volume

Enter usable Width (X), Depth (Y), and Height (Z) in the visible Printer build volume section at the top of the controls. Each dimension accepts 20–2000 mm. The starting values are 260 × 260 × 255 mm; users can enter their own printer dimensions. Reset restores these defaults along with the shelf settings.

The fit status shows the selected volume, updates automatically, and blocks shelf exports when the model exceeds it. Checks include all hooks and structural brackets, using the upright bounding box or a 90° turn on the bed. The tool does not search diagonal or tilted orientations. A brim warning appears when less than 5 mm remains on each side. Enter usable dimensions after accounting for any printer exclusions.

## Nine styles

- Flat shelf: open front and sides.
- Tray: raised rectangular edges, with optional compartments.
- Rounded tray: adjustable corner radius and optional compartments.
- Half-round shelf: a half-ellipse front and straight mounting back. Width and central depth are independent.
- Open-front bin: tall sides and back, with a fully open front and optional dividers.
- Cup: hollow round or oval container. Equal outside width and depth makes a round cup.
- Phone stand: adjustable lean from vertical, back height, pocket gap, retaining lip, and 14 mm cable opening.
- Bottle/tool holder: configurable through-openings. Objects must have a wider collar or shoulder to keep them from falling through.
- Tilted display shelf: adjustable incline from horizontal with a front retaining lip. The front rises away from the board.

Style selection preserves the outside width/depth. Cup selection starts with 65 mm height; open-bin selection starts with 40 mm sides. Only relevant controls are shown.

## Mounting hooks

- Standard drop-in: full-width downward tails.
- Tapered tips: narrower bottom tips to guide insertion, with full-width necks.
- Two rows: a pair of standard hooks in each column, using adjustable vertical row spacing.

Choose Automatic or an exact **total** hook count. Single-row types offer 1–8; two-row hooks offer 2, 4, 6, or 8 total hooks. Automatic chooses a count that fits the width, with an upper limit of eight hooks. Exact counts that do not fit the width are blocked. One hook can allow twisting.

Horizontal spacing is the center-to-center pitch between hooks in the same row. Two-row spacing must match the distance between slots in the same column on your actual board. The default is 40 mm. The tool does not generate hooks for staggered half-pitch columns.

Defaults assume 5 × 15 mm slots, 40 mm spacing along a row, and a 5 mm board. Your printed board may differ or may have been scaled. Measure it. These designs have not been physically validated against your particular board.

Each neck is `slot width − fit clearance` wide. The rear tail leaves `board thickness + fit clearance` between itself and the backplate. The insertion height is `3.2 mm + hook tail length`; the slot must be taller. There must be room behind the board for the tails. To attach, insert the tails, then slide down so they engage behind the lower slot edges. Do not force a tight fit.

The small hook-test download uses the selected hook type and both horizontal and vertical spacing. It always uses two columns: two hooks for single-row types or four hooks for two-row mode. Shelf styling and underside brackets are omitted from the test.

## Structural brackets underneath

Enable Add triangular brackets for fused shelf supports with a vertical leg against the board and a sloping brace under the shelf. Choose 1–4 brackets, the reach under the shelf, the height below it, and thickness.

Bracket reach is automatically limited to the actual shelf outline at each location. The preview reports the resulting reach. Brackets that would overlap are rejected. Circular holder openings remain open through brackets too. Brackets, hooks, shelf, and backplate export as one connected solid.

These brackets are permanent parts of the shelf. They are different from temporary supports added by the slicer. They do not establish a weight rating. Actual load capacity depends on material, layer adhesion, orientation, dimensions, hook engagement, the board, and wall mounting. Test a small load before adding more.

## Printing and exports

- Downloads are model files, not G-code or printer profiles. Select your printer and filament in your slicer. If an app rejects generic 3MF, import STL in millimeters.
- 3MF includes millimeter units. STL uses millimeter coordinates.
- Models export upright, with their lowest point at Z = 0. Underside brackets and two-row mounts can leave the shelf floor elevated above the plate. In your slicer, inspect whether rotating onto a side or back reduces temporary support material. Check every hook, wall, and floor overhang. The tool does not choose an optimal print orientation.
- A starting point is 0.20 mm layers, 4 walls, and 20–30% infill, adjusted for your filament and use. Always inspect the sliced layers and support placement.
- The blue preview is a display color, not a filament or multicolor assignment. No prime tower is required for this one-piece model.
- Overall dimensions include hooks, brackets, phone backs, and tilted shelves. The default build volume is 260 × 260 × 255 mm. The tool checks an upright bounding box, optionally turned 90 degrees in-plane; it does not search tilted or diagonal packing. Leave space for a brim and slicer exclusions.
- Rounded corners and internal corner braces reduce usable space near the corners. Cup inside dimensions describe its oval envelope. Phone pocket dimensions describe usable width and gap. Holder dimensions describe the actual openings.

## Host it later

Upload `dist/index.html` as the site's `index.html` to a static website host. It includes all runtime assets and needs no backend, account system, or external network requests. This package has not been published online.

## Edit the source

Requires Node.js 22 or later for the development build.

```sh
npm ci
npm run build
npm test
```

The build bundles source, stylesheet, the embedded Manifold WASM, and third-party license notices into one HTML file. After deliberately updating manifold-3d, regenerate src/wasm-data.js from its package WASM before building.

Checks cover 199 geometry combinations, serialized STL/3MF topology, all hook types and counts, underside brackets, added styles, invalid settings, hook tests, and custom build-volume limits, rotated fit, and brim allowance. Every model must be one connected, closed solid before export. Browser checks cover all nine styles, conditional controls, hook counts, structural brackets, preview angles, downloads, reset, phone layout, navigation, custom build-volume inputs and export gating, and offline startup. Physical fit and strength testing remain necessary.

## References

- SKÅDIS accessory dimension reference: https://github.com/franpoli/OpenSCADutil/blob/master/libraries/ikea_skadis_pegboard_accessories/ikea_skadis.scad

Mounting and bracket geometry in this project is original. This is an independent maker tool, not affiliated with IKEA. See THIRD_PARTY_NOTICES.txt for bundled dependency licenses.
