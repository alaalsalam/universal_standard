import frappe
from universal_standard.productivity.settings import get_settings_dict


@frappe.whitelist()
def get_export_defaults(doctype=None):
    settings = get_settings_dict()
    if not (settings.get("enable_productivity_tools") and settings.get("enable_export_defaults")):
        return {}
    rows = settings.get("export_defaults") or []
    for row in rows:
        if row.get("document_type") == doctype:
            return row
    return {}
