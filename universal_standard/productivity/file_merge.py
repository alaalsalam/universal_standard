import base64
import io
import json
from pathlib import Path

import frappe
from frappe import _
from frappe.utils import cint
from frappe.utils.file_manager import save_file
from PIL import Image, ImageOps, UnidentifiedImageError
from pypdf import PdfReader, PdfWriter

from universal_standard.productivity.settings import is_enabled

MAX_FILES = 25
MAX_TOTAL_BYTES = 50 * 1024 * 1024
SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
SUPPORTED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp", "image/bmp", "image/tiff"}


def _ensure_feature_enabled():
	if frappe.session.user == "Guest":
		frappe.throw(_("Login required"), frappe.PermissionError)
	if not is_enabled("enable_file_merge"):
		frappe.throw(_("File merge is disabled in Universal Standard Settings"), frappe.PermissionError)


def _ensure_max_file_size_config_as_int():
	max_file_size = frappe.conf.get("max_file_size")
	if isinstance(max_file_size, str):
		frappe.conf["max_file_size"] = cint(max_file_size) if max_file_size else 10485760
	elif max_file_size is None:
		frappe.conf["max_file_size"] = 10485760

def _parse_files(files):
	if isinstance(files, str):
		files = json.loads(files or "[]")
	if not isinstance(files, list):
		frappe.throw(_("Files must be a list"))
	if not files:
		frappe.throw(_("Select at least one file to merge"))	
	if len(files) > MAX_FILES:
		frappe.throw(_("You can merge up to {0} files at a time").format(MAX_FILES))
	return files


def _decode_data_url(file_row):
	name = (file_row.get("name") or "file").strip()
	content_type = (file_row.get("type") or "").split(";")[0].strip().lower()
	data = file_row.get("data") or ""
	if not data:
		frappe.throw(_("File {0} has no content").format(name))
	if "," in data and data.lower().startswith("data:"):
		header, encoded = data.split(",", 1)
		if not content_type and ":" in header:
			content_type = header.split(":", 1)[1].split(";", 1)[0].lower()
	else:
		encoded = data
	try:
		content = base64.b64decode(encoded, validate=True)
	except Exception:
		frappe.throw(_("File {0} is not valid base64 data").format(name))
	return name, content_type, content


def _normalise_image_to_pdf(content):
	try:
		image = Image.open(io.BytesIO(content))
		image = ImageOps.exif_transpose(image)
	except UnidentifiedImageError:
		frappe.throw(_("One of the selected images could not be read"))

	if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
		background = Image.new("RGB", image.size, (255, 255, 255))
		alpha = image.convert("RGBA").getchannel("A")
		background.paste(image.convert("RGBA"), mask=alpha)
		image = background
	else:
		image = image.convert("RGB")

	buffer = io.BytesIO()
	image.save(buffer, format="PDF", resolution=100.0)
	buffer.seek(0)
	return buffer


def _add_pdf_pages(writer, stream, source_name):
	try:
		reader = PdfReader(stream, strict=False)
		if reader.is_encrypted:
			try:
				reader.decrypt("")
			except Exception:
				frappe.throw(_("PDF {0} is encrypted and cannot be merged").format(source_name))
		for page in reader.pages:
			writer.add_page(page)
	except Exception as exc:
		if getattr(exc, "__class__", None).__name__ == "ValidationError":
			raise
		frappe.throw(_("Could not read PDF {0}: {1}").format(source_name, exc))


def _build_merged_pdf(files):
	files = _parse_files(files)
	writer = PdfWriter()
	total_bytes = 0

	for file_row in files:
		name, content_type, content = _decode_data_url(file_row)
		total_bytes += len(content)
		if total_bytes > MAX_TOTAL_BYTES:
			frappe.throw(_("The selected files are larger than the allowed merge size"))

		extension = Path(name).suffix.lower()
		if content_type == "application/pdf" or extension == ".pdf":
			_add_pdf_pages(writer, io.BytesIO(content), name)
		elif content_type in SUPPORTED_IMAGE_TYPES or extension in SUPPORTED_IMAGE_EXTENSIONS:
			_add_pdf_pages(writer, _normalise_image_to_pdf(content), name)
		else:
			frappe.throw(_("File type is not supported for merge: {0}").format(name))

	if not writer.pages:
		frappe.throw(_("No PDF pages were generated"))

	output = io.BytesIO()
	writer.write(output)
	return output.getvalue()


def _validate_attachment_target(doctype=None, docname=None):
	if doctype and docname:
		doc = frappe.get_doc(doctype, docname)
		if not doc.has_permission("write"):
			frappe.throw(_("You do not have permission to attach files to {0} {1}").format(doctype, docname), frappe.PermissionError)


@frappe.whitelist()
def merge_files(files):
	"""Return a base64 PDF after merging selected PDFs/images without saving it."""
	_ensure_feature_enabled()
	pdf_bytes = _build_merged_pdf(files)
	return base64.b64encode(pdf_bytes).decode("utf-8")


@frappe.whitelist()
def merge_and_upload(files, filename=None, doctype=None, docname=None, fieldname=None, folder="Home", is_private=0):
	"""Merge selected PDFs/images and save the result as a File document."""
	_ensure_feature_enabled()
	_validate_attachment_target(doctype, docname)
	_ensure_max_file_size_config_as_int()

	filename = (filename or "merged-file.pdf").strip()
	if not filename.lower().endswith(".pdf"):
		filename += ".pdf"

	pdf_bytes = _build_merged_pdf(files)
	file_doc = save_file(
		fname=filename,
		content=pdf_bytes,
		dt=doctype or None,
		dn=docname or None,
		df=fieldname or None,
		folder=folder or "Home",
		is_private=cint(is_private),
	)
	return file_doc.as_dict()
