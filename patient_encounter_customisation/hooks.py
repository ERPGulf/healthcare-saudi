from . import __version__ as app_version

app_name = "patient_encounter_customisation"
app_title = "Patient Encounter Customisation"
app_publisher = "ERPGulf.com"
app_description = "Addition of items table in patient encounter doctype"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "support@erpgulf.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/patient_encounter_customisation/css/patient_encounter_customisation.css"
# app_include_js = "/assets/patient_encounter_customisation/js/patient_encounter_customisation.js"

# include js, css files in header of web template
# web_include_css = "/assets/patient_encounter_customisation/css/patient_encounter_customisation.css"
# web_include_js = "/assets/patient_encounter_customisation/js/patient_encounter_customisation.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "patient_encounter_customisation/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}
# doctype_js = {"Patient Encounter" : "custom/patient_encounter/patient_encounter.js"}
doctype_js = {"Patient Encounter" : "patient_encounter_customisation/doctype/healthcare_item/healthcare_item.js"}
# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "patient_encounter_customisation.install.before_install"
# after_install = "patient_encounter_customisation.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "patient_encounter_customisation.uninstall.before_uninstall"
# after_uninstall = "patient_encounter_customisation.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "patient_encounter_customisation.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"patient_encounter_customisation.tasks.all"
# 	],
# 	"daily": [
# 		"patient_encounter_customisation.tasks.daily"
# 	],
# 	"hourly": [
# 		"patient_encounter_customisation.tasks.hourly"
# 	],
# 	"weekly": [
# 		"patient_encounter_customisation.tasks.weekly"
# 	]
# 	"monthly": [
# 		"patient_encounter_customisation.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "patient_encounter_customisation.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "patient_encounter_customisation.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "patient_encounter_customisation.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

user_data_fields = [
	{
		"doctype": "{doctype_1}",
		"filter_by": "{filter_by}",
		"redact_fields": ["{field_1}", "{field_2}"],
		"partial": 1,
	},
	{
		"doctype": "{doctype_2}",
		"filter_by": "{filter_by}",
		"partial": 1,
	},
	{
		"doctype": "{doctype_3}",
		"strict": False,
	},
	{
		"doctype": "{doctype_4}"
	}
]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"patient_encounter_customisation.auth.validate"
# ]

# Translation
# --------------------------------

# Make link fields search translated document names for these DocTypes
# Recommended only for DocTypes which have limited documents with untranslated names
# For example: Role, Gender, etc.
# translated_search_doctypes = []
