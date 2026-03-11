#!/bin/bash
git remote add template https://github.com/szymciogrosik/angular-firebase-accelerator.git

git fetch template main

git merge template/main --allow-unrelated-histories --no-edit --no-commit

# Invoke manually
# git commit -m "Permanently link template history"
# git push origin main
