import frappe
from frappe.model.document import Document


class UniversalStandardSettings(Document):
	def validate(self):
		self.clear_productivity_cache()

	def on_update(self):
		self.clear_productivity_cache()

	def clear_productivity_cache(self):
		try:
			from universal_standard.productivity.settings import clear_settings_cache
			clear_settings_cache()
		except Exception:
			pass
