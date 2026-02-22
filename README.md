# Quote/0 SDK & CLI

TypeScript SDK and CLI for Quote/0.

> [!CAUTION]
> `quote0` is currently in early development stage. The API is not stable and may change without notice. Use at your own risk.

# Getting Started

## Use as CLI

```sh
npm install -g quote0@alpha
```

Then, call `quote0` in your terminal to see the usage.

## Use as SDK

```sh
npm install quote0@alpha
```

```js
import Quote0 from 'quote0'

const quote0 = new Quote0({
  apiKey: 'dot_app_ABCD1234....EFGH5678',
})
```
