import frappe
from frappe.model.document import Document


class ThemeSettings(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from frappe.types import DF

	bg_canvas: DF.Color | None
	bg_muted: DF.Color | None
	bg_surface: DF.Color | None
	border_default: DF.Color | None
	font_size: DF.Literal["Small", "Medium", "Large"]
	hide_form_footer: DF.Check
	hide_left_sidebar: DF.Check
	hide_right_sidebar: DF.Check
	hide_search_bar: DF.Check
	left_sidebar_app_logo: DF.Attach | None
	left_sidebar_app_subtitle: DF.Data | None
	left_sidebar_app_title: DF.Data | None
	left_sidebar_bg: DF.Color | None
	left_sidebar_main_icon_bg: DF.Color | None
	left_sidebar_sub_icons_color: DF.Color | None
	left_sidebar_subtext_color: DF.Color | None
	left_sidebar_text_color: DF.Color | None
	navbar_show_assign: DF.Check
	navbar_show_attachments: DF.Check
	navbar_show_print: DF.Check
	navbar_show_share: DF.Check
	section_header: DF.Color | None
	sidebar_active_gradient_end: DF.Color | None
	sidebar_active_gradient_start: DF.Color | None
	text_inverse: DF.Color | None
	text_muted: DF.Color | None
	text_primary: DF.Color | None
	theme_primary: DF.Color | None
	theme_primary_hover: DF.Color | None
	theme_secondary: DF.Color | None
	theme_secondary_hover: DF.Color | None
	# end: auto-generated types

	def on_update(self) -> None:
		"""Broadcast a realtime event so all open sessions refresh instantly.

		All four toggle values are included in the payload so the client can apply
		layout changes immediately without a server round trip.
		"""
		frappe.publish_realtime(
			"theme_settings_changed",
			{
				"hide_left_sidebar": 1 if self.hide_left_sidebar else 0,
				"hide_right_sidebar": 1 if self.hide_right_sidebar else 0,
				"hide_form_footer": 1 if self.hide_form_footer else 0,
				"hide_search_bar": 1 if self.hide_search_bar else 0,
				"left_sidebar_app_logo": self.left_sidebar_app_logo or "",
				"left_sidebar_app_title": self.left_sidebar_app_title or "",
				"left_sidebar_app_subtitle": self.left_sidebar_app_subtitle or "",
			},
		)
