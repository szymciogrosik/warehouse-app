#!/bin/bash
git fetch template main

git checkout main

git merge template/main --no-edit --no-commit

# Invoke manually
# git commit -m "Merged latest changes from template repository"
# git push origin main
