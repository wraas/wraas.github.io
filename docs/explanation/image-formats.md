# Why Both rick.gif and rick.webp?

W.R.A.A.S. ships two copies of the Rick Astley dancing animation in different formats. This is intentional.

## The `<picture>` element

Every rickroll page uses a `<picture>` element to serve the right format:

```html
<picture>
   <source srcset="/rick.webp" type="image/webp">
   <img class="rick-bg" src="/rick.gif" alt="" aria-hidden="true">
</picture>
```

The browser picks the first `<source>` it supports. If it understands WebP, it loads `rick.webp` and never fetches the GIF. If it doesn't, it falls back to the `<img>` and loads `rick.gif`.

## Why not just one format?

Our mission is to rickroll **absolutely anyone, seriously**. That means:

- **WebP-only** would exclude users on older browsers (IE11, legacy Android WebViews, some embedded browsers, corporate machines frozen on ancient software). Those people would see a blank background and miss the GIF entirely. A failed rickroll is worse than no rickroll at all.
- **GIF-only** would work everywhere but misses the opportunity to serve a more efficient format to modern browsers. WebP generally offers better compression, though in this specific case the file sizes are comparable (~4.5 MB each).

The dual-format approach guarantees that every visitor — regardless of browser vintage — gets the full Rick Astley experience with zero JavaScript required for the fallback.

## When could we drop the GIF?

When the last browser that doesn't support WebP stops being used. As of 2024, global WebP support exceeds 97%, but the remaining 3% still deserve to be rickrolled. The GIF stays.
