# Practice-sheet section images

Section figures extracted from `../practice-sheet.pdf` (the teacher's Tri.3 practice sheet,
used as exam prep). Saved so future sessions can align the app's question generators with the
real worksheet without re-rendering the PDF.

The sheet is **ordered and sectioned** (not random): ~14 topic sections of 2–6 questions each.
Each image below maps to the in-app topic id in `index.html` (`TOPICS` registry) and the
lesson it belongs to.

| Image | Sheet section | App topic id(s) | Lesson |
|---|---|---|---|
| `distance-midpoint-points.png` | Distance & midpoint between point pairs (5 pairs) | `dist`, `mid` | 4-3 |
| `distance-midpoint-formula.jpg` | Distance & midpoint formula reference | `dist`, `mid` | 4-3 |
| `trig-ratios-1.png` | Find each trig ratio (tan Z, cos C) | `ratio` | 4-5 |
| `trig-ratios-2.png` | Find each trig ratio (sin C, tan X) | `ratio` | 4-5 |
| `word-problems-plane-car.png` | Angle of depression/elevation (plane, car grade) | `word` | 4-6 |
| `word-problem-lion-text.png` | Angle-of-depression lion word problem (text) | `word` | 4-6 |
| `word-problem-lion-diagram.png` | Lion word problem (diagram, 24°, 4.2 m) | `word` | 4-6 |
| `triangle-area.png` | Area of each triangle (4 triangles) | `area` | 4-6 |
| `triangle-area-formula.png` | Area = ½·a·b·sin C reference | `area` | 4-6 |
| `law-of-sines-sides.png` | Law of Sines — find a side (AC, AB, BC, AB) | `sines` | 4-7 |
| `law-of-sines-angles.png` | Law of Sines — find m∠C (×2) | `sineang` | 4-7 |
| `ambiguous-case-1.png` | SSA — number of possible triangles (Q1–2) | `amb` | 4-7 |
| `ambiguous-case-2.png` | SSA — number of possible triangles (Q3) | `amb` | 4-7 |
| `circumference-from-radius.png` | Circumference from radius (18 cm) | `circ` | 5-1 |
| `circumference-from-diameter.png` | Circumference from diameter (34 in) | `circ` | 5-1 |
| `radius-diameter.png` | Radius & diameter of each circle (5mm/12cm/9m/16km) | `rd` | 5-1 |
| `arc-length.png` | Arc length from circumference & central angle | `arc` | 5-2 |
| `arc-measure.png` | Minor/major arc measure (RS 151°, IKL 62°) | `arcm` | 5-2 |
| `circle-graph-surveys.jpg` | Circle graph — find arc (Surveys mAB) | `pie` | 5-2 |
| `circle-graph-sports.jpg` | Circle graph — find arc (Sports mAD) | `pie` | 5-2 |
| `radians-to-degrees.png` | Convert radian measure → degrees (5π/12 …) | `r2d` | 5-2 |
| `rule-radians-to-degrees.png` | Rule: multiply radians by 180/π | `r2d` | 5-2 |
| `rule-degrees-to-radians.png` | Rule: multiply degrees by π/180 | `d2r` | 5-2 |
| `chords.png` | Chords/algebra in circles (⊙P QR=7x−20; ⊙K KN=3x−2) | `chord` | 5-3 |

Notes:
- The **special right triangles** (4-4, "leave answers as radicals") and **Law of Cosines**
  (4-8) sections are drawn as vector figures in the PDF and were not extractable as raster
  images. Their wording is in the PDF text layer.
- Degree→radian on the sheet uses 315° / 285° / 160° (text only, no figure).
- Re-extraction recipe: `pypdf` `PdfReader(...).pages[i].images`, keeping files > 6 KB; the
  page-1 logo (a JPEG2000) is decorative and skipped.
