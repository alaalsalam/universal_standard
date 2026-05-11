import frappe
from collections import defaultdict


def _apply_user_language(language: str):
    frappe.db.set_value("User", frappe.session.user, "language", language, update_modified=False)
    frappe.defaults.set_user_default("lang", language, user=frappe.session.user)
    frappe.defaults.set_user_default("language", language, user=frappe.session.user)
    frappe.local.cookie_manager.set_cookie("preferred_language", language, max_age=31536000)
    frappe.clear_cache(user=frappe.session.user)
    frappe.local.lang = language
    frappe.local.flags.commit = True


@frappe.whitelist()
def set_language(language: str):
    if language not in {"ar", "en"}:
        frappe.throw("Unsupported language")

    if frappe.session.user == "Guest":
        frappe.throw("Login required")

    _apply_user_language(language)

    return {"language": language}


@frappe.whitelist()
def toggle_language():
    if frappe.session.user == "Guest":
        frappe.throw("Login required")

    current_language = frappe.db.get_value("User", frappe.session.user, "language") or "en"
    next_language = "en" if current_language == "ar" else "ar"
    _apply_user_language(next_language)
    return {"language": next_language, "next": "/app"}


@frappe.whitelist()
def toggle_language_and_redirect(next: str = "/app"):
    if frappe.session.user == "Guest":
        frappe.throw("Login required")

    current_language = frappe.db.get_value("User", frappe.session.user, "language") or "en"
    next_language = "en" if current_language == "ar" else "ar"

    _apply_user_language(next_language)

    if not next or not str(next).startswith("/"):
        next = "/app"

    frappe.local.response["type"] = "redirect"
    frappe.local.response["location"] = next


@frappe.whitelist()
def switch_theme(theme):
    allowed_themes = {"Dark", "Light", "Automatic", "Purple", "Green", "Blue", "Dark-blue"}
    if theme not in allowed_themes:
        frappe.throw("Unsupported theme")

    if frappe.session.user == "Guest":
        frappe.throw("Login required")

    frappe.db.set_value("User", frappe.session.user, "desk_theme", theme, update_modified=False)
    frappe.local.flags.commit = True
    return {"theme": theme}


@frappe.whitelist()
def get_sidebar_menu():
    try:
        menus = frappe.get_all(
            "Sidebar Menu",
            filters={"is_hidden": 0},
            fields=[
                "label",
                "name",
                "icon",
                "type",
                "link_type",
                "link_to",
                "external_link",
                "parent_menu",
                "category",
                "sequence_id",
            ],
            order_by="sequence_id asc",
        )

        categories = frappe.get_all(
            "Sidebar Menu Category",
            filters={"is_hidden": 0},
            fields=["name", "label", "sequence_id"],
            order_by="sequence_id asc",
        )
    except Exception:
        # Keep Desk stable even when sidebar doctypes are not present on a site.
        return []

    category_label_map = {cat.name: cat.label for cat in categories}
    menu_map = {}

    for menu in menus:
        if menu.type == "Custom Link":
            route = menu.external_link or "#"
        elif menu.type == "Link" and menu.link_to:
            slug = menu.link_to.lower().replace(" ", "-")
            if menu.link_type == "DocType":
                route = f"/app/{slug}"
            elif menu.link_type == "Report":
                route = f"/app/query-report/{slug}"
            elif menu.link_type in {"Page", "Workspace"}:
                route = f"/app/{slug}"
            else:
                route = "#"
        else:
            route = "#"

        menu_map[menu.name] = {
            "label": menu.label,
            "name": menu.name,
            "icon": menu.icon or "octicon-file-directory",
            "route": route,
            "children": [],
            "parent_menu": menu.parent_menu,
            "category": menu.category,
        }

    root_items = []
    for item in menu_map.values():
        if item["parent_menu"] and item["parent_menu"] in menu_map:
            menu_map[item["parent_menu"]]["children"].append(item)
        else:
            root_items.append(item)

    categorized = defaultdict(list)
    for item in root_items:
        category = item.get("category") or "Custom Menu"
        categorized[category].append(item)

    result = []
    for category in sorted(categories, key=lambda item: item.sequence_id or 0):
        result.append(
            {"category": category_label_map.get(category.name, category.name), "items": categorized.get(category.name, [])}
        )

    if "Custom Menu" in categorized:
        result.append({"category": "Custom Menu", "items": categorized["Custom Menu"]})

    return result
