app_name = "universal_standard"
app_title = "Universal Standard"
app_publisher = "alaalsalam"
app_description = "General shared UX improvements for all Frappe systems"
app_email = "alaalsalam101@gmail.com"
app_license = "mit"

ASSET_VERSION = "20260616_disabled_global_ui"


def _v(path: str) -> str:
	return f"{path}?v={ASSET_VERSION}"


app_include_css = []

app_include_js = []

doctype_js = {}

web_include_css = []

app_include_icons = []

# after_install disabled to avoid global UI setup side effects
# after_migrate disabled to avoid reapplying global UI setup
before_uninstall = "universal_standard.pdf.install.before_uninstall"

doc_events = {}

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
