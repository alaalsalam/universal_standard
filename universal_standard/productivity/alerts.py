import frappe
from frappe.utils import now_datetime
from universal_standard.productivity.settings import is_enabled


def _alert_matches_user(alert, user_roles):
    target_users = [row.user for row in getattr(alert, "target_users", []) or [] if row.user]
    target_roles = [row.role for row in getattr(alert, "target_roles", []) or [] if row.role]
    if target_users and frappe.session.user not in target_users:
        return False
    if target_roles and not set(user_roles).intersection(target_roles):
        return False
    return True


@frappe.whitelist()
def get_internal_alerts():
    if not is_enabled("enable_internal_alerts"):
        return []

    current = now_datetime()
    user_roles = frappe.get_roles(frappe.session.user)
    names = frappe.get_all("Universal Standard Alert", filters={"enabled": 1}, pluck="name")
    result = []
    for name in names:
        alert = frappe.get_doc("Universal Standard Alert", name)
        if alert.show_from and alert.show_from > current:
            continue
        if alert.show_to and alert.show_to < current:
            continue
        if not _alert_matches_user(alert, user_roles):
            continue
        result.append(
            {
                "name": alert.name,
                "title": alert.title,
                "message": alert.message,
                "alert_type": alert.alert_type,
                "priority": alert.priority,
                "show_once": alert.show_once,
            }
        )
    return result
