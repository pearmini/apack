from setuptools import setup, find_packages
import os

setup(
    name="pyapack",
    version="0.0.1",
    packages=find_packages(),
    install_requires=[],
    author="Bairui Su",
    author_email="subairui@icloud.com",
    description="Python wrapper for apack text rendering",
    long_description=open("README.md").read() if os.path.exists("README.md") else "",
    long_description_content_type="text/markdown",
    url="https://github.com/pearmini/apack",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
) 