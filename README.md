# Flight Data Lab (`flightdatalab.com`)

**Flight Data. Open Tools. Better Insights.**

Official Jekyll website for **Flight Data Lab**, an open-source UAV data engineering and analytics ecosystem focused on flight log normalization, telemetry intelligence, and battery endurance estimation.

## Structure

- `_config.yml` — Jekyll and GitHub Pages configuration
- `CNAME` — Custom domain configuration (`flightdatalab.com`)
- `_data/core_areas.yml` — Five core focus areas
- `_data/projects.yml` — Foundational open-source repositories
- `_layouts/` & `_includes/` — Responsive dark-telemetry layout components
- `assets/css/style.css` — Custom CSS styling
- `assets/js/main.js` — Interactive UAV Telemetry & Anomaly Inspector
- `assets/images/` — Flight Data Lab UAV telemetry icon and favicon

## Local Preview

```bash
bundle install
bundle exec jekyll serve
```

## GitHub Pages Deployment

1. Push the contents of this archive to your GitHub Pages repository (e.g., `flightdatalab/flightdatalab.github.io`).
2. In **Settings → Pages**, set the source branch to `main` (root `/`).
3. Verify the custom domain `flightdatalab.com` and enable **Enforce HTTPS**.
