# Audio Assets Directory

This directory contains all audio assets for the 3D Super Mario Kart game.

## Structure

- `music/` - Background music tracks for different courses
- `sfx/` - Sound effects organized by theme
  - `common/` - Universal sound effects (engine, items, etc.)
  - `grassland/` - Grassland-specific sounds
  - `snow/` - Snow course-specific sounds  
  - `castle/` - Castle course-specific sounds

## Supported Formats

- MP3 (preferred for music)
- WAV (preferred for short sound effects)
- OGG (fallback format)

## Adding New Audio

1. Place audio files in the appropriate subdirectory
2. Update the audio paths in `js/audio.js`
3. Test in game to ensure proper loading

## Note

Due to copyright considerations, placeholder audio files are provided.
Replace with your own royalty-free audio assets.