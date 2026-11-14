# Planet Poems

Classic Persian poems among the planets. Pick a planet on a small solar-system map, pick a
poem, and read it in Persian and English. Keep the ones you love and they become stars in
your own constellation.

Dependency-free: plain HTML, CSS and JavaScript, bundled into one file.

```
node build.js          # one self-contained file: dist/planet-poems.html
node build.js --site   # deployable folder with hashed assets: dist/site/
npm test               # all test suites
npm run check          # tests, then the single-file build
```

To host it on your own server, jump to [Hosting with Docker](#hosting-with-docker).

## Project layout

```
manifest.js              the one list of source files and their bundling order
build.js                 bundles src/ (single file, or --site for deployment)
Dockerfile               multi-stage build: test + build, then serve with nginx
docker-compose.yml       one-command deployment
docker/nginx/            nginx server config and security headers
scripts/
  self-host-fonts.js     downloads the web fonts at build time so visitors never contact Google
src/
  index.template.html    page structure (no styles, no script)
  styles/                00 tokens, 10 base, 20 components, 30 map, 40 poem, 50 keepsakes, 60 motion
  js/
    config.js            every tunable value (timings, storage keys, recipient name)
    data/                poems, poets, planets, map layout: pure data, no logic
    domain/              pure logic: catalog, daily poem, orbit geometry, constellation, text, greeting
    state/               actions, reducer, store, selectors
    infra/               safe storage wrapper, DOM helpers
    render/              pixel-art planets and stars
    ui/                  one small module per piece of screen, plus effects
    app.js               composition root: creates and connects everything
test/
  run.js                 data, domain, reducer, storage and pixel-art tests
  smoke.js               integration test: boots the whole app against a fake DOM
  fonts.test.js          font self-hosting, including its failure fallbacks
  site.test.js           the deployable build: hashed assets, no inline script
```

## How it is put together

**Separation of concerns.** Content (`data/`), rules (`domain/`, `state/`), drawing
(`render/`) and screens (`ui/`) never reach into each other's jobs. Poems are data, not code.

**Pure core, imperative shell.** Everything that makes decisions (picking today's poem,
laying out the map, navigating, favouriting) is a pure function with no DOM, storage or
timers, so it is tested directly. The `ui/` modules only translate state into the page and
user input into actions.

**One-way data flow.** Input dispatches an action, the reducer returns a new state, the store
notifies subscribers, and each view updates itself from the state. Views never change each
other. Side effects that follow a change (the celebration when a poem is kept, saving to
storage) are derived from the state transition, so they happen however the change came about.

**Dependency injection.** Modules are factories (`createDock({ store, toast, elements })`).
They receive their collaborators instead of reaching for globals, which keeps them small and
swappable. `app.js` is the only file that knows about all of them.

**Single source of truth.** Tunable numbers live in `config.js`, visual values in
`styles/00-tokens.css`, keyframes in `60-motion.css`, planet positions in `data/map-layout.js`.
Nothing is written twice.

**Fail fast, degrade gracefully.** The catalog validates all data at start-up and the tests
check it too, so a typo in a poem fails loudly. At run time, blocked storage, corrupt saved
values and reduced-motion settings are all handled quietly.

**Secure and accessible by default.** Every string is escaped before it goes into a template.
There is one focus style, real buttons, ARIA labels, keyboard and swipe navigation, a dialog
that makes the page inert and restores focus, and a full `prefers-reduced-motion` path.

**Modules without a bundler.** Each file defines one `const`. `manifest.js` lists them in
dependency order, and `build.js` wraps them in one strict-mode closure (no globals) and
inlines the CSS. Files in `manifest.pure` never touch the DOM, which is how the tests load them.

## Common changes

| I want to... | Change |
| --- | --- |
| Add a poem | add an entry to `src/js/data/poems.js`, run `npm run check`, then redeploy |
| Add a planet | add it to `data/planets.js`, give it a sprite in `render/pixel-planet.js` and a place in `data/map-layout.js` |
| Change her name in the greeting | `recipientName` in `config.js` |
| Change colours, corners, shadows | `styles/00-tokens.css` |
| Speed up or slow down animations | `config.js` (timings) and `60-motion.css` |

## Hosting with Docker

The image is two stages. The first runs every test and builds the site (the build fails if a
test fails, so a broken edit can never ship). The second is nginx running as a non-root user,
serving only static files: no Node, no database, nothing to patch at run time.

### Quick start

You need Docker with the Compose plugin on the server.

```
# copy the project folder to the server, then, inside it:
docker compose up -d --build
```

Open `http://YOUR-SERVER:8080`. To change the port or who can reach it, copy `.env.example`
to `.env` and edit `PORT` and `BIND_ADDRESS`.

Without Compose:

```
docker build -t planet-poems .
docker run -d --name planet-poems --restart unless-stopped -p 8080:8080 \
  --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges planet-poems
```

### Day to day

| Task | Command |
| --- | --- |
| Update after changing poems or code | `docker compose up -d --build` (the old container keeps running until the new image is ready) |
| See logs | `docker compose logs -f` |
| Is it healthy? | `docker inspect --format '{{.State.Health.Status}}' planet-poems` |
| Stop it | `docker compose down` |

Check it from the server itself:

```
curl -s  http://localhost:8080/healthz          # prints: ok
curl -sI http://localhost:8080/ | head -20      # 200, plus Content-Security-Policy and friends
```

### Making it reachable

1. **Firewall.** Allow the port you chose (`sudo ufw allow 8080/tcp`), or 80 and 443 if you put
   a reverse proxy in front.
2. **HTTPS.** For anything public, put a reverse proxy in front of the container, set
   `BIND_ADDRESS=127.0.0.1` so only the proxy can reach it, and point a DNS record at the server.
   With [Caddy](https://caddyserver.com) (it gets certificates by itself):

   ```
   poems.example.com {
       encode zstd gzip
       reverse_proxy 127.0.0.1:8080
   }
   ```

   With nginx on the host, proxy `location /` to `http://127.0.0.1:8080` and set
   `proxy_set_header Host $host;`. Once HTTPS works, add
   `Strict-Transport-Security: max-age=31536000` at the proxy (it is not set inside the
   container because it only makes sense over HTTPS).
3. **A sub-path** such as `/poems/` also works if the proxy strips the prefix, because every
   link in the page is relative.

### What the server does

- **Caching.** `index.html` is always revalidated, so a deploy shows up immediately. Script,
  styles and fonts carry a content hash in their file name and are cached for a year.
- **Security headers.** A strict Content-Security-Policy (only this site's own script may run),
  `nosniff`, no framing, no referrer, and the unused browser features switched off. Only `GET`
  and `HEAD` are accepted. The container runs as a non-root user with a read-only filesystem and
  no extra Linux capabilities.
- **Privacy.** No cookies, no analytics, no database. The fonts are downloaded at build time and
  served from your own server, so visitors' browsers never contact Google. If that download fails
  the build says so (`fonts: could not self-host ...`) and the page falls back to Google Fonts;
  build with `--build-arg SELF_HOST_FONTS=0` to skip the attempt. Kept poems and the language
  choice are stored only in the visitor's own browser.
- **Inline styles.** The policy allows inline *styles* (not scripts) because the app sets
  per-element CSS variables such as each planet's colour.

### If something looks wrong

- *Blank page or missing fonts:* open the browser's developer console; a blocked resource names
  the rule that blocked it.
- *Port already in use:* set a different `PORT` in `.env`.
- *Build stops at the tests:* the output names the failing check, usually a typo in a poem entry.

## About the poems

The Persian verses are classical and in the public domain; they are typed from memory and
should be checked by a Persian speaker. The English renderings are original and a little free.
Some lines, Khayyam's quatrains especially, circulate in slightly different versions, so those
poems are labelled "attributed to Khayyam".
