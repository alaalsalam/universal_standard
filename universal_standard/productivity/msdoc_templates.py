import frappe
from universal_standard.productivity.settings import is_enabled


@frappe.whitelist()
def render_msdoc_template(template, docname):
    if not is_enabled("enable_msdoc_templates"):
        frappe.throw("MS Doc Templates are disabled")
    try:
        import docxtpl  # noqa: F401
    except Exception:
        return {
            "status": "missing_dependency",
            "message": "docxtpl is not installed. Install it before enabling MS Doc rendering.",
        }
    return {
        "status": "not_implemented",
        "message": "MS Doc template structure is ready; rendering service needs a template-specific implementation.",
    }
