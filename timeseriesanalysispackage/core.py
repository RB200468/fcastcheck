import sys

def main():
    if ((len(sys.argv) != 3) or (sys.argv != "run")):
        print("Usage: timeseriesanalysispackage run <user_script.py>")
        sys.exit(1)

    user_script = sys.argv[2]

    print(user_script)
