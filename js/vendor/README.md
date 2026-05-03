# Vendored Trystero strategy bundles

Pre-built ESM bundles of [Trystero](https://github.com/dmotz/trystero) v0.22.0,
one per signaling strategy. Vendored so the multiplayer game has zero runtime
CDN dependencies.

| File | Strategy | Raw | Gzipped |
|---|---|---:|---:|
| `trystero-mqtt.min.js` | MQTT (broker.emqx.io and friends, WSS:443) | 378 KB | 115 KB |
| `trystero-nostr.min.js` | Nostr relays (WSS) | 20 KB | 9 KB |
| `trystero-torrent.min.js` | WebTorrent trackers (WSS) | 12 KB | 6 KB |

Each bundle exports `joinRoom`, `selfId`, `getRelaySockets`, etc. — see
[Trystero docs](https://github.com/dmotz/trystero#usage).

## Rebuilding

```bash
npm i trystero@0.22.0 esbuild
for s in mqtt nostr torrent; do
  npx esbuild "node_modules/trystero/src/$s.js" \
    --bundle --format=esm --minify \
    --outfile="js/vendor/trystero-$s.min.js"
done
```

To upgrade to a newer Trystero, change the version number above. Note:
v0.23+ split out the strategies into separate `@trystero-p2p/*` packages —
the build command will need adjustment.

## License

Trystero is MIT licensed. See https://github.com/dmotz/trystero/blob/main/LICENSE
