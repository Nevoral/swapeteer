# swapeteer

**swapeteer** is a Go library and lightweight JavaScript companion that lets you drive HTMX swaps and alerts entirely from your Go server—no client-side framework required. You define swap envelopes or alerts in Go, and HTMX along with our JS will apply them in the browser. Additionally, a small loader (`loader.js`) lets you dynamically import and invoke client‐side modules (inspired by Qwik’s module‐loader) to keep your client bundle tiny.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
   2.1 [Go](#go)
   2.2 [JavaScript](#javascript)
3. [Quick Start](#quick-start)
4. [Go API](#go-api)
   4.1 [Swaps](#swaps)
   4.2 [Alerts](#alerts)
   4.3 [Envelope & Response](#envelope--response)
5. [HTMX Integration](#htmx-integration)
6. [Dynamic Client Modules](#dynamic-client-modules)
7. [Examples](#examples)
8. [Contributing](#contributing)
9. [License](#license)

---

## Features

- Server‐driven DOM updates via HTMX swaps
- Built‐in alert notifications (info, success, warning, danger, dark)
- Headers encoded as JSON in the `X-Swapeteer` HTTP response header
- Client JavaScript (`swapeteer.js`) parses envelopes and performs swaps/alerts
- Dynamic module loader (`loader.js`) for on‐demand client behavior (Qwik‐style)
- Zero runtime dependencies beyond HTMX

---

## Installation

### Go

```bash
go get github.com/yourusername/swapeteer
```

Initialize your module if needed:

```bash
go mod init github.com/yourusername/yourapp
go get github.com/yourusername/swapeteer
```

### JavaScript

Copy or serve the two JS files in your HTML page:

- `swapeteer/loader.js` &rarr; dynamic module loader
- `swapeteer/swapeteer.js` &rarr; HTMX swap & alert handler

Example in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>
  </head>
  <body>
    <div id="alert-container"></div>
    <div id="content">Loading…</div>

    <script type="module" src="/path/to/loader.js"></script>
    <script type="module" src="/path/to/swapeteer.js"></script>
    <script src="https://unpkg.com/htmx.org@1.9.2"></script>
  </body>
</html>
```

---

## Quick Start

1. In Go, build swaps or alerts and send them in `X-Swapeteer` header.
2. In the browser, HTMX will fetch HTML and our JS will apply swaps or show alerts.

---

## Go API

Import the swapeteer package (replace with your module path):

```go
import "github.com/Nevoral/swapeteer/swap"
```

### Swaps

Create a swap envelope targeting a CSS selector:

```go
swap := swap.NewSwap("#content", "<h1>Hello, World!</h1>").
          WithSwapStyle(swap.InnerHTML).
          WithSwapDelay(100).
          Build()
```

#### Chainable Options

- `WithSwapStyle(swap.SwapStyle)` &mdash; `"innerHTML"` (default), `"outerHTML"`, `"beforebegin"`, …
- `WithSwapDelay(ms int)` &mdash; delay before the swap (ms)
- `WithSettleDelay(ms int)` &mdash; delay before HTMX settle (ms)
- `WithTransition(on bool)` &mdash; enable View Transitions
- `WithIgnoreTitle(on bool)`
- `WithHead(html string)`
- `WithScroll(v any)` &mdash; `"top"`, `"bottom"`, or number
- `WithScrollTarget(sel string)`
- `WithShow(v string)` &mdash; `"top"` or `"bottom"`
- `WithShowTarget(sel string)`
- `WithFocusScroll(on bool)`
- …and more (see package docs)

### Alerts

Server‐side alerts map to client notifications:

```go
alertEnv := swap.NewAlert(
  swap.Info("Heads-up", "This is an informational alert", 5000),
)
```

Or:

```go
alertEnv := swap.NewAlert(
  swap.Success("Hooray", "Everything went well!", 3000),
)
```

Available alert constructors: `Info`, `Success`, `Warning`, `Danger`, `Dark`.

### Envelope & Response

An Envelope holds a swap or alert:

```go
type Envelope struct {
  Type string `json:"type"` // "swap" or "alert"
  Data any    `json:"data"`
}
```

Wrap one or more Envelopes into a header payload:

```go
payload := swap.SwapeteerResponce(swapEnv, alertEnv...)
jsonBytes, _ := json.Marshal(payload)

w.Header().Set("X-Swapeteer", string(jsonBytes))
w.Write(htmlBytes)
```

---

## HTMX Integration

1. Use HTMX attributes (`hx-get`, `hx-post`, etc.) on your elements.
2. Return HTML fragment in the response body.
3. Set `X-Swapeteer` header to JSON array of Envelopes.
4. `swapeteer.js` will parse the header and apply swaps or show alerts.

Example handler:

```go
func greetHandler(w http.ResponseWriter, r *http.Request) {
  // Build swap to update #greeting
  swapEnv := swap.NewSwap("#greeting", "<p>Hello, HTMX!</p>").Build()
  payload := swap.SwapeteerResponce(swapEnv)
  data, _ := json.Marshal(payload)
  w.Header().Set("X-Swapeteer", string(data))
  w.WriteHeader(http.StatusOK)
  w.Write([]byte("<div id=\"greeting\"></div>"))
}
```

---

## Dynamic Client Modules

The provided `loader.js` scans for attributes prefixed with `sp-` (e.g. `sp-click`, `sp-submit`). On matching events it:

1. Prevents default / stops propagation (configurable via `sp-preventDefault`/`sp-stopPropagation`).
2. Dynamically imports the specified JS module.
3. Calls the exported function with parsed arguments (`this`, `event`, strings, numbers).

### Usage

In HTML:

```html
<button
  sp-click="/js/handlers.js$onClick('world')"
  sp-preventDefault="false"
  sp-stopPropagation="true"
>
  Say Hello
</button>
```

In `/js/handlers.js`:

```js
export async function onClick(name) {
  // you could fetch more data, then trigger a swap via HTMX headers
  console.log("Hello, " + name);
}
```

Call `window.swapeteer.scan()` if you inject elements dynamically.

---

## Examples

1. **Simple Swap**
   ```html
   <button hx-get="/greet" hx-target="#greeting">Greet</button>
   <div id="greeting"></div>
   ```
2. **Server Alert**
   ```go
   alertEnv := swap.NewAlert(swap.Warning("Watch out!", "Be careful here.", 4000))
   // set header, return any body...
   ```
3. **Dynamic Module**
   ```html
   <a href="#" sp-click="/js/foo.js$doSomething(123, 'abc')">Do Something</a>
   ```

---

## Contributing

Contributions welcome! Please open issues or PRs on the GitHub repository.

---

## License

This project is licensed under the [MIT License](LICENSE).
