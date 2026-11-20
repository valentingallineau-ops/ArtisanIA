from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")
module = (ROOT / "modules-v2.js").read_text(encoding="utf-8")
worker = (ROOT / "sw.js").read_text(encoding="utf-8")

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []
    def handle_starttag(self, tag, attrs):
        if tag == "script":
            src = dict(attrs).get("src")
            if src:
                self.sources.append(src)

parser = Scripts()
parser.feed(html)
assert parser.sources.count("modules-v2.js") == 1, parser.sources
assert "modules-v2.js" in worker.split("const SHELL", 1)[1].split(";", 1)[0]
assert "artisania.business.v2" in module
assert "artisania.v1" in html, "Original quote storage key missing"
assert "function migrateQuotes" in module
assert "function runCommand" in module
assert "if(!save())" in module

inline_scripts = re.findall(r"<script(?:\\s[^>]*)?>(.*?)</script>", html, re.I | re.S)
assert len(inline_scripts) >= 2, f"Expected inline application scripts, got {len(inline_scripts)}"
for number, source in enumerate(inline_scripts, 1):
    with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8") as temp:
        temp.write(source)
        temp.flush()
        subprocess.run(["node", "--check", temp.name], check=True)

subprocess.run(["node", "--check", str(ROOT / "modules-v2.js")], check=True)
subprocess.run(["node", "--check", str(ROOT / "sw.js")], check=True)
print("Static checks passed: JavaScript syntax, module loader, offline cache, separate storage, quote migration and guarded saves.")
