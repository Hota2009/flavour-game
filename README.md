# Bean Catcher - Cozy Coffee Shop Game 🫘☕

A fun, casual 2D mobile game with a warm coffee shop theme where players catch falling coffee beans in their cup!

## 🎮 Game Features

### Core Gameplay
- **Coffee Cup Control**: Move your cup left and right to catch falling beans
- **Heart System**: Start with 3 hearts, lose one when you miss a bean
- **Progressive Difficulty**: Bean falling speed increases over time
- **Score System**: Earn points for each bean caught

### Special Features
- **Boss Beans**: Golden special beans that provide powerful bonuses:
  - Extra heart (if not at maximum)
  - Temporary slow motion
  - Bonus points
- **Boss Progress Bar**: Fill up by catching regular beans to spawn boss beans
- **Particle Effects**: Beautiful visual feedback for catches and misses
- **Steam Animations**: Cozy coffee shop atmosphere with rising steam

### Visual Design
- **Warm Color Palette**: Browns, golds, and cream colors for cozy vibes
- **Smooth Animations**: Fluid cup movement and bean rotations
- **Coffee Shop Atmosphere**: Decorative background elements and ambient steam
- **Responsive UI**: Clean interface showing score, hearts, and boss progress

## 🎯 Controls

### Desktop
- **Arrow Keys**: Left/Right arrow keys to move cup
- **WASD**: A/D keys for movement
- **Mouse**: Move mouse to control cup position

### Mobile/Touch
- **Touch & Drag**: Touch and move finger to control cup position
- **Responsive Design**: Optimized for mobile screens

## 🚀 How to Play

1. **Start the Game**: Click "Start Brewing!" to begin
2. **Catch Beans**: Move your cup to catch falling coffee beans
3. **Avoid Missing**: Don't let beans fall past your cup or you'll lose a heart
4. **Collect Boss Beans**: Golden beans provide special bonuses
5. **Survive**: Keep playing as long as you have hearts remaining!

## 📁 Project Structure

```
flavour game/
├── index.html          # Main HTML file
├── styles.css          # Game styling and animations
├── game.js            # Core game logic and mechanics
├── sounds/            # Audio files directory
│   └── README.md      # Audio setup instructions
└── README.md          # This file
```

## 🔧 Setup Instructions

1. **Local Development**:
   - Place files in your web server directory (e.g., `htdocs` for XAMPP)
   - Open `index.html` in a web browser
   - No additional dependencies required!

2. **Adding Sound Effects**:
   - Add MP3 files to the `sounds/` directory
   - See `sounds/README.md` for specific file requirements
   - Game works without audio but sounds enhance the experience

3. **Mobile Testing**:
   - Test on actual mobile devices for best touch experience
   - Use browser developer tools to simulate mobile screens

## 🎨 Customization

### Easy Modifications
- **Colors**: Edit CSS variables in `styles.css`
- **Difficulty**: Adjust values in `CONFIG` object in `game.js`
- **Bean Spawn Rate**: Modify `spawnRate` in configuration
- **Boss Bean Frequency**: Change `spawnChance` for boss beans

### Advanced Customization
- **New Bean Types**: Add different bean classes with unique behaviors
- **Power-ups**: Extend boss bean bonus system
- **Backgrounds**: Add new decorative elements or themes
- **Animations**: Enhance particle effects and transitions

## 🌟 Game Mechanics Details

### Scoring System
- **Regular Bean**: 10 points
- **Boss Bean**: 100 points
- **Boss Bonus Points**: Additional 100 points (random bonus)

### Boss Bean Bonuses
1. **Extra Heart**: Restores one heart (if below maximum)
2. **Slow Motion**: Reduces game speed for 3 seconds
3. **Bonus Points**: Awards extra 100 points

### Difficulty Progression
- Game speed increases gradually over time
- Bean falling speed becomes more challenging
- Boss beans appear more frequently as you progress

## 🎵 Audio System

The game includes placeholder audio elements for:
- Bean catch sounds
- Miss/heart loss sounds  
- Boss bean collection sounds
- Background coffee shop ambience

Add your own MP3 files to the `sounds/` directory to enable audio.

## 📱 Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **HTML5 Canvas**: Required for game rendering
- **Touch Events**: Supported for mobile gameplay

## 🐛 Troubleshooting

### Common Issues
1. **Game not loading**: Check browser console for JavaScript errors
2. **Touch not working**: Ensure you're testing on a touch device or using browser dev tools
3. **Audio not playing**: Add MP3 files to sounds directory and check browser audio permissions
4. **Performance issues**: Try closing other browser tabs or applications

### Performance Tips
- Game is optimized for 60 FPS gameplay
- Particle system automatically manages memory
- Canvas rendering is efficient for smooth animations

## 🎯 Future Enhancement Ideas

- **Multiple Levels**: Different coffee shop environments
- **Achievement System**: Unlock rewards for milestones
- **Leaderboards**: Local high score tracking
- **More Bean Types**: Different coffee varieties with unique effects
- **Seasonal Themes**: Holiday decorations and special events
- **Multiplayer**: Competitive bean catching modes

## 📄 License

This project is open source and free to use, modify, and distribute. Perfect for learning game development or creating your own coffee-themed games!

---

**Enjoy your cozy coffee catching adventure!** ☕✨
