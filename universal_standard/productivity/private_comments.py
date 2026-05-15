import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields


def get_custom_fields():
    return {
        "Comment": [
            {
                "fieldname": "custom_visibility",
                "label": "Visibility",
                "fieldtype": "Select",
                "options": "Visible to everyone\nPrivate to owner\nVisible to mentioned users\nVisible to selected roles",
                "insert_after": "comment_email",
                "default": "Visible to everyone",
            },
            {
                "fieldname": "custom_mentions",
                "label": "Visible To Mentioned Users",
                "fieldtype": "Small Text",
                "insert_after": "custom_visibility",
            },
            {
                "fieldname": "custom_roles",
                "label": "Visible To Roles",
                "fieldtype": "Small Text",
                "insert_after": "custom_mentions",
            },
        ]
    }


def ensure_custom_fields():
    create_custom_fields(get_custom_fields(), ignore_validate=True)
