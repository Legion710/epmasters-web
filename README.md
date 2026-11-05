# EP Masters Hockey: public site

The public single page for **epmastershockey.co.za**: Eastern Province Masters Hockey Association (Aloushka's club; hosted by Kowin).
Member login lives on the separate portal at **members.epmastershockey.co.za** (repo `ep-masters`, on the epmasters VM). This repo holds nothing private.

## What's here

| Path | What |
|---|---|
| `index.html` | The page. Same copy and design as the home page in her app (`app/home.tsx`) |
| `css/site.css` | Only the rules this page uses, extracted from her app's `globals.css` |
| `js/site.js` | Menu toggle, plus the live **teams, fixtures and notices** fetched from `https://members.epmastershockey.co.za/api/public` |
| `assets/`, `icons/`, `favicon.ico` | Crest and icons from her app |
| `CNAME` | `epmastershockey.co.za` for GitHub Pages. **Don't delete it**, or the custom domain drops |

Icons are inline [Lucide](https://lucide.dev) SVGs (ISC licence).

## Live data

`/api/public` returns only records the committee marked **public** (teams, fixtures, tournaments, notices) and the contact email. The portal must allow this site's origin (CORS) on that one endpoint. The portal is **South Africa only**, so from abroad the fetch times out after 8 s. The page then shows the empty states and "Association updates are temporarily unavailable." Everything else on the page still works worldwide.

## Preview locally

```bash
python3 -m http.server 8080
```

Live data only loads once the portal allows the origin, so locally you'll see the empty states.

## Publishing

Not published yet. The plan: GitHub Pages from `main`, custom domain `epmastershockey.co.za`, "Enforce HTTPS" on. DNS at Afrihost: apex A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`, and `www` as a CNAME to the Pages host. It may later move into the Kowin Website Lab flow (`websitelab/epmasters` → preview → ▶ publish-live).
