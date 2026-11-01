# Compositae multi-access key

`compositae_multiaccess.html` adds a standalone, Lucid-style interface. Visitors can answer any source question, skip unknowns, remove or change answers, search by plant part or wording, and inspect the surviving routes to a genus. The existing `compositae.html` is unchanged. The homepage change is a single adjacent link.

## Botanical scope and limits

The only filtering data is the unchanged `keydata` object from `compositae.html` at source commit `229bf051543200338d087167e65719466bc06af0`. The source page attributes its simplified wording to supplied images of Davis, *Flora of Turkey*, Volume 5 (1975), pages 8, 10 and 12–25. This adaptation has **not** been independently checked against those pages, genus descriptions or modern taxonomic treatments.

There are 174 question pairs and 175 root-to-result routes. The 132 distinct result labels represent 129 genera: Cirsium section Epitrachys and the two Centaurea species-qualified labels are grouped under their genera while retaining their full labels in the evidence display. Names and spelling are preserved from the source, including historical names.

Each source choice remains a complete statement, including combinations, measurements and exceptions. The category and title for a question help browse the interface but do not add biological states or affect filtering. The glossary is copied from the existing key.

A selected answer removes a route only if that route has the opposite answer at that exact source question. A question missing from the route is unknown, not false. A genus remains if any of its routes remains; answers from separate routes are never pooled. Consequently, many weakly supported possibilities can remain. Evidence counts are explicitly counts of selected answers recorded on a surviving route, not probabilities or identification confidence. Even a single remaining genus requires confirmation.

The suggested next feature is chosen by possible reductions in the present genus list. Questions with no possible reduction are not suggested, but all questions remain available through browsing and search. Local browser storage uses its own key and a source checksum; it does not interfere with the old key's saved navigation.

## Rebuilding and checking

The delivered HTML needs no installation, server code or internet data connection. Keep it alongside the original HTML files so relative links work. Do not replace a separately maintained Hostinger homepage with the repository homepage; Hostinger was not changed by this work.

Run from the repository:

```sh
python3 tools/build-compositae-multiaccess.py
node tests/compositae-multiaccess.test.cjs
```

The build reads the original key, glossary and groups plus `tools/compositae-feature-labels.json`, and fills `tools/compositae-multiaccess.template.html`. The output embeds its source SHA-256. If adapting a later source revision, review the botanical changes, update the source commit references in the build/template and adjust expected counts and baseline tests deliberately. Do not silently present revised source data as the previously reviewed revision.

## Verification on 1 November 2026

- Exact equality of all embedded source question texts, destinations and page references.
- Every complete source route resolves to its original genus, including when entered in reverse order; every partial route retains that genus.
- Every single choice and 500 mixed sets compared with an independent source-tree traversal.
- Unknown values preserved, repeated-genus routes kept separate, qualified names retained.
- Original source checksum and homepage checksum after removing the one added link.
- All written-question anchors present; JavaScript syntax and lack of external script/data dependencies checked.
- Browser interaction checks: out-of-order choice, narrowing, skip, removal, feature search, no search matches, genus name search, evidence details, suggestions and reload restoration.
- Original key: homepage entry, first choice, Back, restart and written-question anchor checked.
- Layout checked in browser frames of 820 × 1180 and 1180 × 820 CSS pixels, also 768 × 1024 and 390 × 844. No horizontal overflow; visible main buttons were at least 44 pixels high. Portrait uses one column with result and return links; landscape uses two columns. These are simulated screen sizes, not a physical iPad/Safari test.

No Hostinger deployment, photograph changes, changes to other keys, or changes to access settings were made.
