import frappe
from frappe.utils import pdf as frappe_pdf_module

_PATCH_FLAG = "_universal_standard_pdf_patched"


def apply_pdf_patch():
    if getattr(frappe_pdf_module, _PATCH_FLAG, False):
        return

    original_get_pdf = frappe_pdf_module.get_pdf

    def patched_get_pdf(*args, **kwargs):
        try:
            if frappe.db.get_single_value("Print Settings", "pdf_using_google_chrome"):
                from universal_standard.pdf.utils.pdf import get_pdf as get_pdf_gc

                return get_pdf_gc(*args, **kwargs)
        except Exception:
            pass
        return original_get_pdf(*args, **kwargs)

    frappe_pdf_module.get_pdf = patched_get_pdf
    setattr(frappe_pdf_module, _PATCH_FLAG, True)
