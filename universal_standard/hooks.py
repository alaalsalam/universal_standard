app_name = "universal_standard"
app_title = "Universal Standard"
app_publisher = "alaalsalam"
app_description = "General shared UX improvements for all Frappe systems"
app_email = "alaalsalam101@gmail.com"
app_license = "mit"

ASSET_VERSION = "20260816_frappe_v16_ui"


def _v(path: str) -> str:
	return f"{path}?v={ASSET_VERSION}"


# No frontend CSS or JavaScript is injected. Frappe v16 owns the complete Desk
# layout, navbar, workspace, sidebar, cards, spacing, and typography.
app_include_css = []

# No global Desk JavaScript injection. This keeps the official Frappe v16
# navbar, workspace, sidebar, and interaction behavior untouched.
app_include_js = []

doctype_js = {}

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
