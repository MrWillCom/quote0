# quote0

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
