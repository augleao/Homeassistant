Onedrive Backup Machine

Minimal scaffold for a Home Assistant OS add-on that downloads backups from OneDrive to local disk.

Files of interest:
- `config.json`, `Dockerfile`, `start.sh`, `requirements.txt`, `main.py`, `static/`

Account linking flow:
- Open add-on Web UI and click `Vincular conta OneDrive`.
- Open the shown Microsoft URL and type the displayed device code.
- Wait for the UI status to change to authenticated.

Backup storage layout:
- Backups are organized by task under the configured `backup_path`.
- Each run creates a dedicated folder identified by mode and timestamp:
	- `full_YYYYMMDD_HHMMSS`
	- `incremental_YYYYMMDD_HHMMSS`
- The add-on keeps an internal `_latest` folder per task to track incremental changes efficiently.
