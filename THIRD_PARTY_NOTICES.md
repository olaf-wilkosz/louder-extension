# Third-party notices

The Louder extension is MIT-licensed (see [LICENSE](LICENSE)). The built extension bundles the
following third-party code into `content.js`; its license requires this notice to travel with it
(the build copies this file and `LICENSE` into the extension package).

## @mozilla/readability

Used to extract the main article text from web pages.

- Version: 0.6.x (see `package-lock.json` for the exact version)
- Source: <https://github.com/mozilla/readability>
- License: Apache License, Version 2.0 (<https://www.apache.org/licenses/LICENSE-2.0>)

```
Copyright (c) 2010 Arc90 Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

No other third-party code or fonts are bundled: the extension uses the system font stack and the
browser's built-in Web Speech API.

## The website (not part of the extension package)

The website in `landing/` self-hosts the **DM Sans** variable font (latin and latin-ext subsets,
from the `@fontsource-variable/dm-sans` 5.3.0 package), licensed under the SIL Open Font License,
Version 1.1. The copyright line and license text are in `landing/fonts/OFL.txt` and are published
with the site at `fonts/OFL.txt`.
