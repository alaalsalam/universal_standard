import frappe

from universal_standard.pdf.install import after_install as install_pdf_settings


SAUDI_RIYAL_SYMBOL = "\u00a7"


def ensure_saudi_riyal_currency_symbol():
	"""Use the Saudi Riyal glyph code expected by the bundled Riyal font."""
	if not frappe.db.exists("DocType", "Currency"):
		return

	if frappe.db.exists("Currency", "SAR"):
		frappe.db.set_value(
			"Currency",
			"SAR",
			{
				"enabled": 1,
				"symbol": SAUDI_RIYAL_SYMBOL,
			},
			update_modified=False,
		)
	else:
		currency = frappe.new_doc("Currency")
		currency.currency_name = "SAR"
		currency.enabled = 1
		currency.symbol = SAUDI_RIYAL_SYMBOL
		currency.fraction = "Halala"
		currency.fraction_units = 100
		currency.insert(ignore_permissions=True)

	frappe.clear_cache()


def after_install():
	install_pdf_settings()
	ensure_saudi_riyal_currency_symbol()
	try:
		from universal_standard.productivity.setup import after_migrate as productivity_after_migrate
		productivity_after_migrate()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Universal Standard productivity install failed")


def after_migrate():
	ensure_saudi_riyal_currency_symbol()
	try:
		from universal_standard.productivity.setup import after_migrate as productivity_after_migrate
		productivity_after_migrate()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Universal Standard productivity migration failed")
