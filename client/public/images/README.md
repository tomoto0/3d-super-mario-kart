# Images and Textures

This directory contains all visual assets for the 3D Super Mario Kart game.

## Structure

- `textures/` - Texture files for 3D models and environments
- `ogp-preview.jpg` - Open Graph preview image for social media

## Texture Categories

- **Course Textures**: Road surfaces, grass, snow, lava
- **Character Textures**: Kart and character skins
- **UI Textures**: Buttons, icons, HUD elements
- **Effect Textures**: Particles, explosions, trails

## Supported Formats

- **PNG** - For textures with transparency
- **JPG** - For solid textures and photos
- **WebP** - Modern format for better compression

## Texture Guidelines

- Power-of-two dimensions (256x256, 512x512, 1024x1024)
- Optimize for web loading (keep file sizes reasonable)
- Use mipmaps for better performance

## Adding New Textures

1. Place texture files in appropriate subdirectories
2. Update texture loading code in `js/textures.js`
3. Test performance impact