import frappe

ASSET_VERSION = "20260819_1"
JS_PATH = f"/assets/universal_standard/js/universal_standard_v2.js?v={ASSET_VERSION}"
THEME_JS_PATH = f"/assets/universal_standard/js/us_theme_enhancer.js?v={ASSET_VERSION}"
CSS_PATH = f"/assets/universal_standard/css/universal_standard_v2.css?v={ASSET_VERSION}"
TOGGLE_PATH = "/api/method/universal_standard.api.toggle_language_and_redirect?next=/app"


def after_request(response):
	"""Guarantee universal assets are present on Desk /app response."""
	try:
		request = getattr(frappe.local, "request", None)
		if not request:
			return response

		path = getattr(request, "path", "") or ""
		if not path.startswith("/app"):
			return response

		mimetype = getattr(response, "mimetype", "") or ""
		if "text/html" not in mimetype:
			return response

		html = response.get_data(as_text=True)
		if not html:
			return response

		if CSS_PATH not in html and "</head>" in html:
			html = html.replace("</head>", f'<link rel="stylesheet" href="{CSS_PATH}"></head>')

		if "</body>" in html:
			script_tags = []
			if JS_PATH not in html:
				script_tags.append(f'<script src="{JS_PATH}"></script>')
			if THEME_JS_PATH not in html:
				script_tags.append(f'<script src="{THEME_JS_PATH}"></script>')
			if script_tags:
				html = html.replace("</body>", "".join(script_tags) + "</body>")

		if "us-language-switch" not in html and "</body>" in html:
			language = (getattr(frappe.local, "lang", None) or "ar").lower()
			label = "EN" if language == "ar" else "AR"
			title = "Switch Language" if language == "ar" else "تغيير اللغة"
			html = html.replace(
				"</body>",
				f'<a class="us-language-switch us-floating" title="{title}" href="{TOGGLE_PATH}">{label}</a></body>',
			)

		response.set_data(html)
	except Exception:
		# Never block responses because of enhancer hook.
		pass

	return response
