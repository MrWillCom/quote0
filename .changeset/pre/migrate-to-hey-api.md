---
'quote0': major
---

Replace the class-based SDK (`Quote0`, `.device.list()`, `.content.pushText()`, etc.) with Hey API generated operations (`listDevices`, `displayText`, etc.) and `createClient` / `createConfig` from `quote0/client`, and rewire the CLI onto it.
