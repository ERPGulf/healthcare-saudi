from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in patient_encounter_customisation/__init__.py
from patient_encounter_customisation import __version__ as version

setup(
	name="patient_encounter_customisation",
	version=version,
	description="Addition of items table in patient encounter doctype",
	author="ERPGulf.com",
	author_email="support@erpgulf.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
