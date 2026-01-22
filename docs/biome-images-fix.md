# Fix Broken Biome Images

## Problem
All images on `/biomes/index.html` are broken because:
1. Image paths reference `/Photos/Biomes/` but images are located at `/assets/images/biomes/`
2. Filenames in HTML use spaces (e.g., "Xeric Hammock.png") but actual files use hyphens (e.g., "Xeric-Hammock.png")

## Required Changes
Update all image `src` attributes in `/biomes/index.html` to:
- Change path from `/Photos/Biomes/` to `/assets/images/biomes/`
- Replace spaces in filenames with hyphens

## Example Changes

| Current (broken) | Fixed |
|-----------------|-------|
| `/Photos/Biomes/Xeric Hammock.png` | `/assets/images/biomes/Xeric-Hammock.png` |
| `/Photos/Biomes/Wet Prairie.png` | `/assets/images/biomes/Wet-Prairie.png` |
| `/Photos/Biomes/Wet Flatwoods.png` | `/assets/images/biomes/Wet-Flatwoods.png` |
| `/Photos/Biomes/Baygall Final 2.png` | `/assets/images/biomes/Baygall-Final-2.png` |
| `/Photos/Biomes/Slough Final.png` | `/assets/images/biomes/Slough-Final.png` |

## Files to Modify
- `/biomes/index.html` — update all ~40 image `src` attributes

## Verification
After changes, all biome cards should display their landscape images correctly.
