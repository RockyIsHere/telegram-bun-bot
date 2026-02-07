#!/bin/bash

git add -A

message=$(git diff --cached --stat | head -20)

if [ -z "$message" ]; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$message"
git push
