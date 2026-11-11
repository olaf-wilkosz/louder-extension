# Security policy

## Reporting a vulnerability

Please **do not** open a public issue for a security problem. Use GitHub's private reporting:
[Report a vulnerability](https://github.com/olaf-wilkosz/louder-extension/security/advisories/new).

Include what you found, how to reproduce it, the Louder version and the browser. You will get a first answer within a few days.

## What is in scope

Louder runs on every page you open it on, so reports about how it could be abused through a web page are especially welcome, for example:

- a page reading or changing Louder's state, its settings or the text it reads, or interfering with its widget or selection trigger (both live in shadow roots);
- anything that makes Louder send data anywhere: it is designed to make no network requests of its own;
- script or HTML injection into a page through Louder.

The design, the permissions it asks for and why are described on the [privacy page](https://olaf-wilkosz.github.io/louder-extension/privacy.html).

## Supported versions

Only the latest release receives fixes.
