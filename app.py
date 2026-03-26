"""
Launcher so running `python app.py` from project root starts the backend server.
This makes `python app.py` behave the way you expected (no top-level app.py previously).
"""
import os
import sys
import runpy

ROOT = os.path.dirname(__file__)
BACKEND = os.path.join(ROOT, "backend")

# Ensure `backend` package is importable and working directory is backend
if BACKEND not in sys.path:
    sys.path.insert(0, BACKEND)

os.chdir(BACKEND)

# Run the server script in this process
runpy.run_path("server.py", run_name="__main__")
