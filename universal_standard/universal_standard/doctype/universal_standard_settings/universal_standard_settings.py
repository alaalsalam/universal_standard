import frappe
from frappe.model.document import Document


class UniversalStandardSettings(Document):
	def validate(self):
		try:
			from universal_standard.productivity.settings import clear_settings_cache
			clear_settings_cache()
		except Exception:
			pass
