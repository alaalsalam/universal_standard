import frappe
from frappe.utils.jinja_globals import bundled_asset

from universal_standard.appearance_api import _read as read_appearance

ASSET_VERSION = "20260822_appearance_transfer_v1"
JS_PATH = f"/assets/universal_standard/js/universal_standard_v2.js?v={ASSET_VERSION}"
THEME_JS_PATH = f"/assets/universal_standard/js/us_theme_enhancer.js?v={ASSET_VERSION}"
CSS_PATH = f"/assets/universal_standard/css/universal_standard_v2.css?v={ASSET_VERSION}"
LEANY_CSS_PATH = f"/assets/universal_standard/css/leany_integration.css?v={ASSET_VERSION}"
TOGGLE_PATH = "/api/method/universal_standard.api.toggle_language_and_redirect?next=/app"


def _appearance_assets():
	"""Return the Universal Standard appearance bundles for Desk only."""
	return bundled_asset("us_appearance.bundle.css"), bundled_asset("us_appearance.bundle.js")


def _appearance_prepaint_style() -> str:
	"""Paint a signed-in user's accent before the Desk JavaScript starts.

	The appearance bundle is deliberately placed at the end of the document so
	it does not compete with Frappe's own startup. Without this small server-side
	style, CSS first paints Aurora's violet defaults and only then swaps to the
	user's saved colour when the bundle reaches ``hydrate_from_boot``. Keep this
	to numeric custom properties only: preferences remain user-scoped and no
	user-provided text is interpolated into HTML.
	"""
	try:
		settings = read_appearance(frappe.session.user)
		if not settings:
			return ""

		def number(key, lower, upper):
			value = float(settings[key])
			return max(lower, min(upper, value))

		hue = number("hue", 0, 360)
		saturation = number("sat", 0, 100)
		declarations = [f"--aurora-h:{hue:g}", f"--aurora-s:{saturation:g}%"]
		if settings.get("lightness") is not None:
			declarations.append(f"--aurora-l:{number('lightness', 0, 100):g}%")
		if settings.get("features", {}).get("gradients") is False:
			declarations.extend(
				[
					"--aurora-gradient:linear-gradient(var(--aurora-500),var(--aurora-500))",
					"--aurora-gradient-soft:linear-gradient(var(--aurora-soft),var(--aurora-soft))",
				]
			)
		return f'<style data-us-appearance="prepaint">:root{{{";".join(declarations)}}}</style>'
	except (KeyError, TypeError, ValueError):
		return ""


def after_request(response):
	"""Guarantee Universal Standard assets on both supported Desk routes."""
	try:
		request = getattr(frappe.local, "request", None)
		if not request:
			return response

		path = getattr(request, "path", "") or ""
		if not path.startswith(("/app", "/desk")):
			return response

		mimetype = getattr(response, "mimetype", "") or ""
		if "text/html" not in mimetype:
			return response

		html = response.get_data(as_text=True)
		if not html:
			return response

		appearance_css, appearance_js = _appearance_assets()
		appearance_prepaint = _appearance_prepaint_style()

		if CSS_PATH not in html and "</head>" in html:
			html = html.replace("</head>", f'<link rel="stylesheet" href="{CSS_PATH}"></head>')
		if LEANY_CSS_PATH not in html and "</head>" in html:
			html = html.replace("</head>", f'<link rel="stylesheet" href="{LEANY_CSS_PATH}"></head>')
		# The appearance layer must be last in the visual cascade. A marker lets
		# the existing enhancer delegate overlapping colour/font rules.
		if appearance_css and 'data-us-appearance="css"' not in html and "</head>" in html:
			html = html.replace(
				"</head>",
				f'<link rel="stylesheet" data-us-appearance="css" href="{appearance_css}"></head>',
			)
		if appearance_prepaint and 'data-us-appearance="prepaint"' not in html and "</head>" in html:
			html = html.replace("</head>", appearance_prepaint + "</head>")

		if "</body>" in html:
			script_tags = []
			if JS_PATH not in html:
				script_tags.append(f'<script src="{JS_PATH}"></script>')
			if THEME_JS_PATH not in html:
				script_tags.append(f'<script src="{THEME_JS_PATH}"></script>')
			if appearance_js and 'data-us-appearance="js"' not in html:
				script_tags.append(f'<script data-us-appearance="js" src="{appearance_js}"></script>')
			if script_tags:
				html = html.replace("</body>", "".join(script_tags) + "</body>")

		if "us-language-switch" not in html and "</body>" in html:
			language = (getattr(frappe.local, "lang", None) or "ar").lower()
			label = "EN" if language == "ar" else "AR"
			title = "Switch Language" if language == "ar" else "تغيير اللغة"
			html = html.replace(
				"</body>",
				f'<a class="us-language-switch us-pending" aria-label="{title}" title="{title}" href="{TOGGLE_PATH}">'
				'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/>'
				'<path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3z"/>'
				f'</svg><span>{label}</span></a></body>',
			)

		response.set_data(html)
	except Exception:
		# Never block responses because of enhancer hook.
		pass

	return response
