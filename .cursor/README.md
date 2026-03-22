# Cursor MCP (local)

**Do not commit literal SonarCloud tokens in `mcp.json`.** The SonarQube server entry uses Cursor’s interpolation:

`"SONARQUBE_TOKEN": "${env:SONARQUBE_TOKEN}"`

Set the value in your shell profile (e.g. `~/.zshrc`):

```bash
export SONARQUBE_TOKEN="your-token-here"
```

Restart Cursor after changing `~/.zshrc`. If Cursor was opened from the Dock, it may not see variables only defined for interactive shells—either launch Cursor from a terminal (`cursor .`) after exporting, or set the variable in a place GUI apps inherit (OS-specific).

Generate tokens in [SonarCloud](https://sonarcloud.io) → **My Account** → **Security**. Revoke any token that was ever committed or shared.
