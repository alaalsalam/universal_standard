from universal_standard.productivity.settings import get_settings_dict


def get_enabled_fields():
    settings = get_settings_dict()
    if not (settings.get("enable_productivity_tools") and settings.get("enable_tinymce_optional")):
        return []
    return [row for row in settings.get("tinymce_fields", []) if row.get("enabled")]
