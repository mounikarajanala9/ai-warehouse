import uvicorn
import os
import sys

if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass
    print("================================================================================")
    print(" SMART WAREHOUSE - Operations & Order Fulfillment Intelligence Platform")
    print("================================================================================")
    print("[*] Starting server at http://localhost:8000 (or http://127.0.0.1:8000)")
    print("[*] API Documentation: http://localhost:8000/docs")
    print("================================================================================")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)


