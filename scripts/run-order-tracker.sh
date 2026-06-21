#!/bin/bash
# Wrapper script to keep the order-tracker service alive
cd /home/z/my-project/mini-services/order-tracker

while true; do
  echo "[$(date)] Starting order-tracker..."
  bun index.ts >> /home/z/my-project/scripts/order-tracker.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] order-tracker exited with code $EXIT_CODE. Restarting in 2s..."
  sleep 2
done
