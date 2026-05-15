import frappe
from universal_standard.productivity.settings import get_settings_dict


def _doctype_list(settings, key):
    return {row.get("document_type") for row in settings.get(key, []) if row.get("document_type")}


def apply_private_attachment_policy(doc, method=None):
    settings = get_settings_dict()
    if not (settings.get("enable_productivity_tools") and settings.get("enable_private_attachments_policy")):
        return
    if not settings.get("make_attachments_private_by_default"):
        return

    attached_to = doc.get("attached_to_doctype")
    if attached_to in _doctype_list(settings, "private_attachment_excluded_doctypes"):
        return
    if attached_to in _doctype_list(settings, "public_attachment_allowed_doctypes"):
        doc.is_private = 0
        return
    doc.is_private = 1
