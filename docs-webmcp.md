# WebMCP demo

The site registers browser-native tools through `document.modelContext` when available. No API keys, MCP server, new cloud resources, or agent SDK are needed. Unsupported browsers keep the normal manual flow.

WebMCP is experimental. Use a Chromium build with WebMCP enabled and an agent/extension that supports that build's API. This implementation targets `document.modelContext.registerTool(tool, { signal })`, not the removed `navigator.modelContext` API. See [Chrome's current setup and API documentation](https://developer.chrome.com/docs/ai/webmcp/imperative-api) and the [Model Context Tool Inspector](https://developer.chrome.com/docs/ai/webmcp).

Agents should call `get_exchange_guide` first. It returns the [Markdown workflow guide](src/lib/webmcp/guide.md) and is registered on every WebMCP-enabled page state, including during drawing and delivery. This is a discoverable tool, not a native skills mechanism; the description recommends calling it first rather than enforcing an invocation order.

## Demo prompt

> Organize a Secret Santa called Holiday Demo for Alice (alice@example.com), Bob (bob@example.com), Cara (cara@example.com), and Dan (dan@example.com). Alice is the organizer. Alice and Bob must not draw each other. Set up the group and draw names, keeping the matches secret. Stop before sending email.

Use test addresses for a setup/draw-only demo. For a delivery demo, substitute inboxes you control and explicitly approve sending after reviewing the group. The organizer receives the full assignment summary. Turnstile may require a person to interact with the page.

## Tools

| Page | Tool | Behavior |
| --- | --- | --- |
| All tool surfaces | `get_exchange_guide` | Read-only Markdown guide; description tells agents to call it first |
| `/` | `start_secret_santa` | Opens the setup flow |
| `/assign` | `configure_exchange` | Validates and saves a complete group, event name, and exclusions into an empty draft; opens review |
| `/assign` | `get_exchange_status` | Returns participants, exclusions, and draw progress, without matches |
| `/assign` | `draw_secret_santa` | Uses the existing solver and animation; refuses to overwrite a draw |
| After animation | `get_delivery_status` | Reports verification, cooldown, server acceptance, `emailRecipientCount`, and `revealCardsFor` (names needing a printed card or link); `cards_only` when no one has email |
| After animation | `send_assignment_emails` | Requires `confirmed: true`, valid verification, and no cooldown; uses the existing send endpoint; skips people without email; refuses when no one has email |

Email is optional per participant. People without one get a QR reveal card (print) or private `/reveal` link (copy or share) from the page; agents get their names, never the links. Organizers can set `sitsOut: true` to stay out of the draw and still get the summary.

Discover tools again after navigation and after the animation. Wait for the page to render after configuration before drawing. Existing draft edits, redraws, and resend overrides stay in the visible interface. Invalid inputs leave the draft untouched. Duplicate participant names are rejected; the first participant becomes organizer if none is specified. Status outputs containing participant data are marked untrusted.

Tools register only for the current document, with no cross-origin exposure. React updates use current callbacks without re-registering on every status tick, and unmount aborts registrations. A registration failure disables that component's tools while leaving the manual flow usable.

## Verification boundary

`bun run ci` exercises input validation, tool registration/lifecycle, current state, configure → draw, privacy, email approval, verification, cooldowns, and duplicate-send guards against a simulated browser registry and mocked email endpoint. `bun run build` checks bundling. These checks do not prove native browser discovery, agent tool selection, Turnstile completion, or real inbox delivery. Verify those separately with a compatible browser agent on a running local/preview site before recording the demo.

## Discovery and native verification

The homepage describes free manual and WebMCP-assisted setup. `/llms.txt` gives visiting agents a short service description and directs compatible browser agents to `get_exchange_guide`. These are discovery aids, not a promise of search ranking or automatic recommendations. WebMCP tools become discoverable only after an agent visits the site in a compatible browser.

A local native walkthrough on October 28, 2026 used installed Chrome 156 with `--enable-blink-features=WebMCP`, driven through agent-browser. It discovered the real `ModelContext`, read the guide first, configured four participants and a mutual exclusion, drew valid assignments, completed normal verification, and invoked the send tool. The dev simulator wrote five text and five HTML files for five messages: four participant assignments and one organizer summary. No external email was sent. This establishes native API execution locally; consumer-assistant automatic discovery and production inbox delivery remain separate checks.
