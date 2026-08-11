---
'quote0': minor
---

Align with the latest Dot. Open API documentation.

- Fix response types: `.content.list()` now returns an array of task items including the `CANVAS_API` type, `.content.next()` response no longer declares the undocumented `code` field, `.device.list()` includes `alias`/`location`, and `.device.status()` marks `alias`/`location`/`renderInfo.current.image` as optional.
- Add the Device Settings API: `.device.getSettings()` / `.device.updateSettings()` and the `device settings <deviceId>` CLI command (read, or update with `--alias`, `--location`, `--timezone`, `--power-ms`, `--battery-ms`, `--sleep-start`/`--sleep-end`, `--sleep-disabled`).
- Add the Canvas API: `.canvas.pushCanvas()` and the `content canvas <deviceId> --file <windowData.json>` CLI command (with `--data`, `--layout-full-tw`).
- Add the `content list <deviceId> --task-type <fixed|loop>` CLI command.
- `content image` now accepts `--url` to push an http(s) image URL directly.
- CLI wording now refers to the device serial number, matching the official docs.
