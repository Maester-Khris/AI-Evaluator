#!/bin/bash
# Start the API (if you have one)
uvicorn main:app --reload --port 8000 &

# Start the Worker
export PYTHONPATH=$PYTHONPATH:.
python worker.py