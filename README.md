### Universal Standard

General-purpose shared UX app for Frappe/ERPNext sites.

What it includes:

- large Arabic translation file (`translations/ar.csv`) for common system strings
- bundled Arabic font applied across desk and web
- visible AR/EN language toggle in navbar
- safe backend API for user language switching

### Installation

```bash
cd /home/frappe/frappe-bench
bench --site [site-name] install-app universal_standard
bench --site [site-name] migrate
bench build --app universal_standard
```

To install on all sites:

```bash
cd /home/frappe/frappe-bench
for s in $(bench --site all list-apps >/dev/null 2>&1; ls sites | grep -v '^assets$'); do
  bench --site "$s" install-app universal_standard || true
  bench --site "$s" migrate || true
done
bench build --app universal_standard
```

### License

mit
