app_name = "universal_standard"
app_title = "Universal Standard"
app_publisher = "alaalsalam"
app_description = "General shared UX improvements for all Frappe systems"
app_email = "alaalsalam101@gmail.com"
app_license = "mit"

ASSET_VERSION = "20260511_2"


def _v(path: str) -> str:
	return f"{path}?v={ASSET_VERSION}"


app_include_css = [
	_v("/assets/universal_standard/css/universal_standard_v2.css"),
	_v("/assets/universal_standard/css/us_themes.bundle.css"),
	_v("/assets/universal_standard/css/css-rtl/us_translations_ar_eg.css"),
	_v("/assets/universal_standard/css/us_preview_attachment.bundle.css"),
]

app_include_js = [
	_v("/assets/universal_standard/js/universal_standard_v2.js"),
	_v("/assets/universal_standard/js/us_custom_sidebar.js"),
	_v("/assets/universal_standard/js/us_themes.bundle.js"),
	_v("/assets/universal_standard/js/us_preview_attachment.bundle.js"),
	_v("/assets/universal_standard/js/us_preview_attachment_patch.js"),
]

doctype_js = {
	"User": "public/js/us_user_impersonation.js",
}

web_include_css = [
	_v("/assets/universal_standard/css/universal_standard_v2.css"),
	_v("/assets/universal_standard/css/css-rtl/us_translations_ar_eg.css"),
]

app_include_icons = [
	"universal_standard/icons/my_custom_icons.svg",
]

after_install = "universal_standard.setup.after_install"
after_migrate = "universal_standard.setup.after_migrate"
before_uninstall = "universal_standard.pdf.install.before_uninstall"

override_whitelisted_methods = {
	"frappe.core.doctype.user.user.switch_theme": "universal_standard.api.switch_theme"
}

fixtures = [
	{
		"dt": "Property Setter",
		"filters": [
			["doc_type", "in", ("User",)],
			["field_name", "in", ("desk_theme",)],
		],
	}
]
