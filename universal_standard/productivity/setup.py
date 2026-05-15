import frappe


def ensure_productivity_settings():
    if not frappe.db.exists("DocType", "Universal Standard Settings"):
        return
    try:
        frappe.get_single("Universal Standard Settings").save(ignore_permissions=True)
    except Exception:
        frappe.log_error(frappe.get_traceback(), "Universal Standard Settings initialization failed")


def after_migrate():
    ensure_productivity_settings()
    try:
        from universal_standard.productivity.private_comments import ensure_custom_fields
        ensure_custom_fields()
    except Exception:
        frappe.log_error(frappe.get_traceback(), "Universal Standard productivity custom fields failed")
