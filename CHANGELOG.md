# quote0

## 1.0.0-alpha.6

### Minor Changes

- 3279edc: Add `content.list` method and `TASK_TYPES` to content module API.
- 575eedc: Re-export content module types and constants (`Border`, `DitherType`, `DitherKernel`, `BORDER`, `DITHER_TYPES`, `DITHER_KERNELS`) from the API entry point.
- 3f8a047: Add `pushText` method to ContentModule for pushing text content to devices.

## 1.0.0-alpha.5

### Minor Changes

- ae78b5d: Add battery and Wi-Fi info to device status in CLI.
- 5ccc3e4: Complete options for pushing images in CLI.
- 26c9eb5: Add [Continuous Releases](https://pkg.pr.new/).

### Patch Changes

- 283f0c8: Change `main` to `exports` in package.json.
- b7f0bf8: Disallow parent command without child command in CLI.

## 1.0.0-alpha.4

### Minor Changes

- 3270f6d: Add push image functionality to CLI.

### Patch Changes

- eeb7e5c: Fix unexpected React missing `key` problem.

## 1.0.0-alpha.3

### Patch Changes

- ee4e038: Protect `.apiKey` and allow access to `.display` only from instance root.

## 1.0.0-alpha.2

### Major Changes

- c37b8a1: Nest commands, `list` → `device list`, `status` → `device status`.

### Minor Changes

- 0be89b2: Add command `list`.
- c37b8a1: Implement command `device status <device-id>`.
- 1ac2358: Implement `.content.next()` method.
- 1ac2358: Add command `content next` and move `image` → `content image`.

## 1.0.0-alpha.1

### Major Changes

- e388e98: Remove command `prepare`.
- 0c72b71: Encapsulated APIs to make them more usable for external users.

## 1.0.0-alpha.0

### Major Changes

- b0c7d28: Add `bin` field to package.json to enable command-line access to quote0.
