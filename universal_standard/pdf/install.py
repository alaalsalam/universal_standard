import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields


def get_custom_fields():
    return {
        "Print Settings": [
            {
                "fieldname": "pdf_using_google_chrome",
                "label": "Generate PDF using Google Chrome",
                "fieldtype": "Check",
                "insert_after": "pdf_page_width",
            }
        ]
    }


def after_install():
    create_custom_fields(get_custom_fields())


def before_uninstall():
    delete_custom_fields(get_custom_fields())


def delete_custom_fields(custom_fields):
    for doctypes, fields in custom_fields.items():
        if isinstance(fields, dict):
            fields = [fields]

        if isinstance(doctypes, str):
            doctypes = (doctypes,)

        for doctype in doctypes:
            frappe.db.delete(
                "Custom Field",
                {
                    "fieldname": ("in", [field["fieldname"] for field in fields]),
                    "dt": doctype,
                },
            )
            frappe.clear_cache(doctype=doctype)
