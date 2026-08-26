import frappe
from universal_standard.productivity.settings import get_settings_dict


def _generate_pdf(doc, rule_name):
    rule = frappe.get_doc("Universal PDF On Submit Rule", rule_name)
    if not rule.enabled:
        return
    try:
        frappe.attach_print(
            doc.doctype,
            doc.name,
            print_format=rule.print_format or None,
            doc=doc,
            lang=rule.language or None,
        )
    except Exception:
        frappe.log_error(frappe.get_traceback(), f"Universal PDF on Submit failed: {doc.doctype} {doc.name}")


def handle_on_submit(doc, method=None):
    settings = get_settings_dict()
    if not (settings.get("enable_productivity_tools") and settings.get("enable_pdf_on_submit")):
        return

    rules = frappe.get_all(
        "Universal PDF On Submit Rule",
        filters={"enabled": 1, "document_type": doc.doctype, "submit_event": "on_submit"},
        fields=["name", "run_in_background"],
    )
    for rule in rules:
        if rule.run_in_background:
            frappe.enqueue(
                "universal_standard.productivity.pdf_on_submit._generate_pdf",
                queue="short",
                doc=doc,
                rule_name=rule.name,
            )
        else:
            _generate_pdf(doc, rule.name)
