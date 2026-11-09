#!/usr/bin/env python3
"""
JSON Schema Validator for MSA FAST Peshawar Data Contracts.
Validates _data/events.json and _data/team.json against Draft 2020-12 schemas.
"""

import sys
import json
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("❌ Error: jsonschema library is required. Install with: pip install jsonschema")
    sys.exit(1)

root = Path(__file__).resolve().parent.parent

def validate_contract(data_path, schema_path):
    print(f"==> Validating {data_path.name} against {schema_path.name}...")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    validator = jsonschema.Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
    
    if errors:
        print(f"❌ Schema validation failed with {len(errors)} error(s):")
        for err in errors:
            print(f"   - Location: {' -> '.join(str(p) for p in err.path) or 'root'}")
            print(f"     Error: {err.message}")
        return False
    
    print(f"✅ {data_path.name} conforms 100% to Draft 2020-12 schema.")
    return True

success = True
success = validate_contract(root / "_data" / "events.json", root / "schemas" / "events.schema.json") and success
success = validate_contract(root / "_data" / "team.json", root / "schemas" / "team.schema.json") and success

if not success:
    sys.exit(1)

print("🎉 All data contracts passed verification successfully!")
