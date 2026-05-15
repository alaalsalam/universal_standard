import frappe
from frappe.utils import add_to_date, now_datetime
from universal_standard.productivity.settings import is_enabled


@frappe.whitelist()
def get_active_users():
    if not is_enabled("enable_active_users"):
        return []

    since = add_to_date(now_datetime(), minutes=-30)
    rows = frappe.db.sql(
        """
        select user, max(creation) as last_active
        from `tabActivity Log`
        where creation >= %s and user not in ('Guest', '')
        group by user
        order by last_active desc
        limit 20
        """,
        since,
        as_dict=True,
    )
    return rows
