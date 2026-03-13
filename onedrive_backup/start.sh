#!/bin/bash
set -e
# If running as a Home Assistant add-on, options are available at /data/options.json
OPTIONS_FILE="/data/options.json"
if [ -f "$OPTIONS_FILE" ]; then
  # Use jq-style parsing via python to avoid adding jq dependency
  CLIENT_ID=$(python - <<'PY'
import json,sys
o=json.load(open('/data/options.json'))
print(o.get('client_id','') or '')
PY
)
  TENANT_ID=$(python - <<'PY'
import json,sys
o=json.load(open('/data/options.json'))
print(o.get('tenant_id','') or '')
PY
)
  BACKUP_PATH=$(python - <<'PY'
import json,sys,os
o=json.load(open('/data/options.json'))
print(o.get('backup_path','/backup') or '/backup')
PY
)
  LOG_LEVEL=$(python - <<'PY'
import json,sys
o=json.load(open('/data/options.json'))
print(o.get('log_level','INFO') or 'INFO')
PY
)
  LOG_FILE_PATH=$(python - <<'PY'
import json,sys
o=json.load(open('/data/options.json'))
print(o.get('log_file_path','/data/onedrive_backup.log') or '/data/onedrive_backup.log')
PY
)
  # export to environment for the python app
  export CLIENT_ID
  export TENANT_ID
  export BACKUP_PATH
  export LOG_LEVEL
  export LOG_FILE_PATH
fi

python main.py
