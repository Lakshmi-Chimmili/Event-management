import sys
import os

# Auto-redirect to backend virtual environment if executed with system Python
backend_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(backend_dir, 'venv', 'Scripts', 'python.exe')
if os.path.exists(venv_python) and sys.executable.lower() != os.path.abspath(venv_python).lower():
    try:
        import flask_jwt_extended
    except ImportError:
        os.execv(venv_python, [venv_python] + sys.argv)

from app import create_app

app = create_app()

if __name__ == '__main__':
    # Listen on all interfaces on port 5000
    app.run(host='127.0.0.1', port=5000, debug=True)
