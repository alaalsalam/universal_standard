import json
import frappe

CACHE_KEY = "universal_standard:productivity_settings"

DEFAULTS = {
	"enable_productivity_tools": 1,
	"enable_debug_logs": 0,
	"enable_attachment_preview": 1,
	"enable_sidebar_collapsed": 1,
	"enable_list_unassign": 1,
	"enable_language_switcher": 1,
	"language_switcher_languages": "ar,en",
	"enable_navbar_tools": 1,
	"enable_active_users": 0,
	"active_users_refresh_interval": 120,
	"enable_internal_alerts": 0,
	"enable_export_defaults": 0,
	"enable_signup_controls": 0,
	"blocked_signup_domains": "",
	"block_admin_user_creation": 0,
	"enable_private_attachments_policy": 0,
	"make_attachments_private_by_default": 1,
	"enable_private_comments": 0,
	"enable_item_translation": 0,
	"item_translation_target_doctypes": "Quotation\nSales Order\nSales Invoice\nDelivery Note\nPurchase Order\nPurchase Invoice",
	"enable_pdf_on_submit": 0,
	"enable_msdoc_templates": 0,
	"enable_tinymce_optional": 0,
	"enable_frappe_tools_safe_features": 0,
}

TABLE_FIELDS = {
	"export_defaults": [
		"document_type",
		"export_all_fields",
		"export_visible_fields",
		"include_child_tables",
		"default_file_type",
	],
	"public_attachment_allowed_doctypes": ["document_type"],
	"private_attachment_excluded_doctypes": ["document_type"],
	"tinymce_fields": ["document_type", "fieldname", "enabled"],
	"frappe_tools_safe_features": ["feature_name", "enabled"],
}


def _safe_int(value, fallback=0):
	try:
		return int(value or 0)
	except Exception:
		return fallback


def clear_settings_cache():
	frappe.cache().delete_value(CACHE_KEY)


def _serialize_child_rows(doc, table_field):
	rows = []
	fields = TABLE_FIELDS.get(table_field, [])
	for row in getattr(doc, table_field, []) or []:
		rows.append({field: row.get(field) for field in fields})
	return rows


def get_settings_dict():
	cached = frappe.cache().get_value(CACHE_KEY)
	if cached:
		if isinstance(cached, str):
			return json.loads(cached)
		return cached

	settings = dict(DEFAULTS)
	if frappe.db.exists("DocType", "Universal Standard Settings"):
		doc = frappe.get_single("Universal Standard Settings")
		for key in DEFAULTS:
			value = doc.get(key)
			if isinstance(DEFAULTS[key], int):
				value = _safe_int(value, DEFAULTS[key])
			settings[key] = DEFAULTS[key] if value is None else value
		for table_field in TABLE_FIELDS:
			settings[table_field] = _serialize_child_rows(doc, table_field)
	else:
		for table_field in TABLE_FIELDS:
			settings[table_field] = []

	settings["enabled_modules"] = get_enabled_modules_from_settings(settings)
	frappe.cache().set_value(CACHE_KEY, settings, expires_in_sec=300)
	return settings


def is_enabled(feature):
	settings = get_settings_dict()
	return bool(settings.get("enable_productivity_tools")) and bool(settings.get(feature))


def get_enabled_modules_from_settings(settings):
	if not settings.get("enable_productivity_tools"):
		return []
	mapping = {
		"attachment_preview": "enable_attachment_preview",
		"sidebar_collapsed": "enable_sidebar_collapsed",
		"list_unassign": "enable_list_unassign",
		"language_switcher": "enable_language_switcher",
		"navbar_tools": "enable_navbar_tools",
		"active_users": "enable_active_users",
		"internal_alerts": "enable_internal_alerts",
		"export_defaults": "enable_export_defaults",
		"tinymce_optional": "enable_tinymce_optional",
	}
	return [module for module, flag in mapping.items() if settings.get(flag)]


@frappe.whitelist()
def get_productivity_settings():
	return get_settings_dict()


@frappe.whitelist()
def clear_productivity_settings_cache():
	clear_settings_cache()
	return {"cleared": True}


@frappe.whitelist()
def get_enabled_productivity_modules():
	return get_settings_dict().get("enabled_modules", [])


@frappe.whitelist()
def enable_safe_desk_features_for_development():
	"""Enable only low-risk Desk UX modules for development/demo verification."""
	if "System Manager" not in frappe.get_roles(frappe.session.user):
		frappe.throw("System Manager role required")

	doc = frappe.get_single("Universal Standard Settings")
	for fieldname in (
		"enable_productivity_tools",
		"enable_attachment_preview",
		"enable_sidebar_collapsed",
		"enable_list_unassign",
		"enable_language_switcher",
		"enable_navbar_tools",
	):
		doc.set(fieldname, 1)
	doc.set("active_users_refresh_interval", 120)
	doc.set("make_attachments_private_by_default", 1)
	doc.save(ignore_permissions=True)
	frappe.db.commit()
	clear_settings_cache()
	return get_settings_dict()
