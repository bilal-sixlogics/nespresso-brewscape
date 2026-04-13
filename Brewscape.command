#!/bin/bash
# ============================================================
#  Brewscape — Double-click launcher for macOS
#  This file can be double-clicked in Finder to open a Terminal
#  and start all three Brewscape services automatically.
#
#  First time: chmod +x Brewscape.command  (run once in Terminal)
#  Then just double-click it from Finder anytime.
# ============================================================

# Move to the directory containing this file
cd "$(dirname "$0")"

# Hand off to the main start script (handles setup + services)
exec ./start.sh
