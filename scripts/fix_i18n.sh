#!/bin/bash
mkdir -p app/\[locale\]
for file in app/*; do
  if [ "$file" != "app/[locale]" ] && [ "$file" != "app/favicon.ico" ] && [ "$file" != "app/globals.css" ]; then
    mv "$file" app/\[locale\]/
  fi
done
