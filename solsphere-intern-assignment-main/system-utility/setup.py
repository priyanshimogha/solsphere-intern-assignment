from setuptools import setup

setup(
    name="system-health-monitor",
    version="0.1.0",
    description="A cross-platform system health monitoring utility",
    author="",
    author_email="",
    py_modules=["system_monitor"],
    install_requires=[
        "psutil>=5.9.0",
        "requests>=2.28.1",
    ],
    entry_points={
        "console_scripts": [
            "system-monitor=system_monitor:main",
        ],
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: System Administrators",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
)
