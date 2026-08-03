# Frontend Coverage Gap Analysis

## Current evidence

- The production web image built successfully after the bodyless-checkout request-header fix.
- The corresponding API flow was exercised against the live proxy and API stack.
- The shared request helper now avoids JSON content type when a request has no body.

## Missing evidence

- No Playwright browser tests or config exist in the repository.
- No rendered UI assertions, screenshot evidence, accessibility scan, cross-browser run, or frontend coverage report exists.
- API smoke evidence must not be reported as browser-flow coverage.

## Classification

Frontend browser coverage is `AUTOMATION BLOCKED` pending Playwright installation/configuration and test authoring. The next implementation step is to add module-specific Playwright cases, not a generic login smoke.
