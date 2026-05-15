import frappe
from universal_standard.productivity.settings import get_settings_dict


def _target_doctypes(settings):
    raw = settings.get("item_translation_target_doctypes") or ""
    return {part.strip() for part in raw.replace(",", "\n").splitlines() if part.strip()}


def _language_for_doc(doc):
    return doc.get("language") or getattr(frappe.local, "lang", None) or "en"


def apply_item_translation(doc, method=None):
    settings = get_settings_dict()
    if not (settings.get("enable_productivity_tools") and settings.get("enable_item_translation")):
        return
    if doc.doctype not in _target_doctypes(settings):
        return
    if not hasattr(doc, "items"):
        return

    language = _language_for_doc(doc)
    for row in doc.items:
        if not row.get("item_code"):
            continue
        translation = frappe.get_all(
            "Universal Item Translation",
            filters={"item": row.item_code, "language": language, "enabled": 1},
            fields=["translated_item_name", "translated_description"],
            limit=1,
        )
        if not translation:
            continue
        data = translation[0]
        if data.translated_description:
            row.description = data.translated_description
        elif data.translated_item_name:
            row.description = data.translated_item_name
