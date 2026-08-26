import json
import frappe
from universal_standard.productivity.settings import is_enabled


@frappe.whitelist()
def unassign_selected(doctype, names):
    if not is_enabled("enable_list_unassign"):
        frappe.throw("List unassign is disabled")

    if isinstance(names, str):
        names = json.loads(names)
    if not names:
        frappe.throw("No records selected")

    removed = 0
    for name in names:
        if not frappe.has_permission(doctype, "write", name):
            continue
        todos = frappe.get_all(
            "ToDo",
            filters={
                "reference_type": doctype,
                "reference_name": name,
                "status": "Open",
            },
            pluck="name",
        )
        for todo in todos:
            frappe.delete_doc("ToDo", todo, ignore_permissions=True)
            removed += 1
        if frappe.get_meta(doctype).has_field("_assign"):
            frappe.db.set_value(doctype, name, "_assign", None, update_modified=False)
    return {"removed": removed, "records": len(names)}
