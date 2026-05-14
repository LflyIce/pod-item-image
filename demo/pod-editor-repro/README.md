# POD Editor local repro

This folder is a static local reproduction of the public GitHub Pages demo:

https://darkdragonblade.github.io/POD-Editor/demo/#/demo

The upstream repository publishes the built demo assets, not the original Vue source tree. This reproduction mirrors the public `demo/` files so the same bundled single-page app can run locally.

## Run

From this folder:

```powershell
python -m http.server 8123
```

Then open:

http://localhost:8123/#/demo

Opening `index.html` directly as a file may fail in some browsers because the app loads module scripts and image assets.
