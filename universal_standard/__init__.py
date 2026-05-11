__version__ = "0.0.1"

# Import side effects to patch Frappe PDF renderer when app is loaded.
from universal_standard.pdf import apply_pdf_patch  # noqa: F401
