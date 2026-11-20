from html.parser import HTMLParser
from pathlib import Path
import re
import json
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")
module = (ROOT / "modules-v2.js").read_text(encoding="utf-8")
worker = (ROOT / "sw.js").read_text(encoding="utf-8")
manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))

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
assert "ArtisanIA" in html.split("</head>", 1)[0]
assert "<title>" in html.split("</head>", 1)[0]
assert "<title>" not in html.split("</head>", 1)[1]
assert "artisans" in manifest["description"].lower()
assert manifest["lang"] == "fr"
assert all((ROOT / icon["src"]).is_file() for icon in manifest["icons"])
assert "artisania.business.v2" in module
assert "artisania.v1" in html, "Original quote storage key missing"
assert "function migrateQuotes" in module
assert "function runCommand" in module
assert "invoices:[]" in module and "expenses:[]" in module
assert "Factures à suivre" in module
assert "overdueInvoices=unpaid.filter" in module and "Factures échues" in module
assert "if(!save())" in module

assert 'class="top-in"' in html, "Launcher host element missing"
assert "$('.top-in')?.append(launch)" in module, "Business-space launcher is not attached"
assert html.count('<script src="modules-v2.js"></script>') == 1
assert "quoteId:quoteKey" in module, "Quote-to-job migration key missing"
assert all(label in module for label in ["Prospects", "Chantiers", "Planning", "Factures à suivre"])

shell_match = re.search(r"const SHELL = \[(.*?)\];", worker, re.S)
assert shell_match, "Offline cache shell list missing"
shell_files = re.findall(r"['\"]([^'\"]+)['\"]", shell_match.group(1))
for asset in shell_files:
    if asset != "./":
        assert (ROOT / asset).is_file(), f"Offline cache asset missing: {asset}"
assert "modules-v2.js" in shell_files

inline_scripts = re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", html, re.I | re.S)
assert len(inline_scripts) >= 2, f"Expected inline application scripts, got {len(inline_scripts)}"
for number, source in enumerate(inline_scripts, 1):
    with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8") as temp:
        temp.write(source)
        temp.flush()
        subprocess.run(["node", "--check", temp.name], check=True)

subprocess.run(["node", "--check", str(ROOT / "modules-v2.js")], check=True)
subprocess.run(["node", "--check", str(ROOT / "sw.js")], check=True)
print("Static checks passed: scripts, launcher, PWA assets, separate storage, quote migration, modules and guarded saves.")
