import frappe
from universal_standard.productivity.settings import get_settings_dict


def _blocked_domains(settings):
    raw = settings.get("blocked_signup_domains") or ""
    return {part.strip().lower().lstrip("@") for part in raw.replace(",", "\n").splitlines() if part.strip()}


def validate_signup(doc, method=None):
    settings = get_settings_dict()
    if not (settings.get("enable_productivity_tools") and settings.get("enable_signup_controls")):
        return

    if frappe.session.user == "Administrator" and not settings.get("block_admin_user_creation"):
        return

    email = (doc.get("email") or doc.get("name") or "").lower()
    if "@" not in email:
        return
    domain = email.rsplit("@", 1)[-1]
    if domain in _blocked_domains(settings):
        frappe.throw(f"Signup is not allowed for email domain: {domain}")
