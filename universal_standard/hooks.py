app_name = "universal_standard"
app_title = "Universal Standard"
app_publisher = "alaalsalam"
app_description = "General shared UX improvements for all Frappe systems"
app_email = "alaalsalam101@gmail.com"
app_license = "mit"

ASSET_VERSION = "20260816_frappe_v16_ui"


def _v(path: str) -> str:
	return f"{path}?v={ASSET_VERSION}"


# No global CSS is injected into the Desk. Frappe v16 owns the layout and
# component styling; productivity features must not override it.
app_include_css = []

app_include_js = [
	_v("/assets/universal_standard/js/universal_standard_v2.js"),
	_v("/assets/universal_standard/js/productivity_bootstrap.js"),
]

doctype_js = {
	"User": "public/js/us_user_impersonation.js",
	"Universal Standard Settings": "public/js/universal_standard_settings.js",
}

web_include_css = []

app_include_icons = []

after_install = "universal_standard.setup.after_install"
after_migrate = "universal_standard.setup.after_migrate"
before_uninstall = "universal_standard.pdf.install.before_uninstall"

doc_events = {
	"File": {
		"before_insert": "universal_standard.productivity.attachments.apply_private_attachment_policy",
		"validate": "universal_standard.productivity.attachments.apply_private_attachment_policy",
	},
	"User": {
		"before_insert": "universal_standard.productivity.signup.validate_signup",
	},
	"*": {
		"validate": "universal_standard.productivity.item_translation.apply_item_translation",
		"on_submit": "universal_standard.productivity.pdf_on_submit.handle_on_submit",
	},
}

override_whitelisted_methods = {}

fixtures = [
	{
		"dt": "Property Setter",
		"filters": [
			["doc_type", "in", ("User",)],
			["field_name", "in", ("desk_theme",)],
		],
	}
]
