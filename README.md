# Quote/0 SDK & CLI

[![pkg.pr.new](https://pkg.pr.new/badge/MrWillCom/quote0)](https://pkg.pr.new/~/MrWillCom/quote0)

TypeScript SDK and CLI for Quote/0.

> [!CAUTION]
> `quote0` is currently in early development stage. The API is not stable and may change without notice. Use at your own risk.

# Getting Started

## Use as CLI

```sh
npm install -g quote0@alpha
```

Then, call `quote0` in your terminal to see the usage. Run `quote0 auth` to save an API key, then use curated commands such as `quote0 device list` and `quote0 content text`.

For endpoints without a curated command, `quote0 api` makes an authenticated HTTP request (same idea as `gh api`):

```sh
quote0 api devices
quote0 api device/ABCD1234/status
quote0 api -X POST device/ABCD1234/text -f message="Hello"
```

Short paths are prefixed with `/api/authV2/open/`. `quote0 api` always prints indented JSON.

## Use as SDK

```sh
npm install quote0@alpha
```

```js
import { listDevices } from 'quote0'
import { createClient, createConfig } from 'quote0/client'

const client = createClient(
  createConfig({
    auth: 'dot_app_ABCD1234....EFGH5678',
    baseUrl: 'https://dot.mindreset.tech',
  }),
)

const { data } = await listDevices({ client, throwOnError: true })
```
