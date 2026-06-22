#!/usr/bin/env node

/**
 * UI-UX-Skill Monte Carlo Tree Search (MCTS) Engine v1.0
 * 
 * Intelligent design space exploration using MCTS algorithm
 * Finds mathematically optimal designs by:
 * 1. Exploring design variations (colors, fonts, layouts, animations)
 * 2. Simulating user experience via cognitive audits
 * 3. Evaluating design quality using Premium Score
 * 4. Converging on optimal solutions
 * 
 * Usage:
 *   node skills/utils/design-mcts.js --iterations 1000 --output best-design.html
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const crypto = require('crypto');

// ============================================================================
// DESIGN STATE REPRESENTATION
// ============================================================================

/**
 * Design State: Complete representation of a design
 * This is the "game state" that MCTS will explore
 */
class DesignState {
  constructor(config = {}) {
    // Color system (OKLCH format)
    this.colors = {
      primary: config.primary || this.randomOKLCH(),
      secondary: config.secondary || this.randomOKLCH(),
      background: config.background || 'oklch(10% 0.02 0)',
      accent: config.accent || this.randomOKLCH(),
      text: config.text || 'oklch(90% 0.01 0)',
      textSecondary: config.textSecondary || 'oklch(60% 0.01 0)',
    };
    
    // Typography
    this.typography = {
      heading: config.heading || this.randomFont('heading'),
      body: config.body || this.randomFont('body'),
      sizeScale: config.sizeScale || [16, 20, 24, 32, 48, 64],
      lineHeight: config.lineHeight || 1.6,
      maxWidth: config.maxWidth || '65ch',
    };
    
    // Layout
    this.layout = {
      type: config.type || this.randomLayoutType(),
      grid: config.grid || this.randomGrid(),
      spacing: config.spacing || 8,
      asymmetry: config.asymmetry || this.randomAsymmetry(),
    };
    
    // Animation
    this.animation = {
      easing: config.easing || this.randomEasing(),
      duration: config.duration || this.randomDuration(),
      motionPersonality: config.motionPersonality || this.randomMotionPersonality(),
    };
    
    // Components
    this.components = {
      buttons: config.buttons || this.randomButtonStyle(),
      cards: config.cards || this.randomCardStyle(),
      navigation: config.navigation || this.randomNavStyle(),
    };
    
    // Metadata
    this.generation = config.generation || 0;
    this.parentId = config.parentId || null;
    this.id = config.id || this.generateId();
  }
  
  generateId() {
    const data = JSON.stringify({
      colors: this.colors,
      typography: this.typography,
      layout: this.layout,
      animation: this.animation,
      components: this.components
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  randomOKLCH() {
    const lightness = 10 + Math.random() * 80;
    const chroma = 0.01 + Math.random() * 0.25;
    const hue = Math.random() * 360;
    return `oklch(${lightness.toFixed(1)}% ${chroma.toFixed(2)} ${hue.toFixed(1)})`;
  }
  
  randomFont(type) {
    const fonts = {
      heading: ['Instrument Sans', 'Instrument Serif', 'Bricolage Grotesque', 'Fraunces', 'Cormorant Garamond'],
      body: ['Instrument Sans', 'Instrument Serif', 'Bricolage Grotesque', 'Arapey', 'Work Sans'],
    };
    return fonts[type]?.[Math.floor(Math.random() * fonts[type].length)] || fonts.heading[0];
  }
  
  randomLayoutType() {
    return ['bento', 'asymmetric', 'organic', 'masonry', 'split-screen'][Math.floor(Math.random() * 5)];
  }
  
  randomGrid() {
    const sizes = [1, 2, 3, 4];
    const length = 2 + Math.floor(Math.random() * 4);
    return Array.from({ length }, () => sizes[Math.floor(Math.random() * sizes.length)]);
  }
  
  randomAsymmetry() {
    return {
      horizontal: Math.random() > 0.5 ? 'left' : 'right',
      vertical: Math.random() > 0.5 ? 'top' : 'bottom',
      ratio: [0.3, 0.4, 0.5, 0.6, 0.7][Math.floor(Math.random() * 5)],
    };
  }
  
  randomEasing() {
    const easings = [
      'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Snap
      'cubic-bezier(0.25, 0.1, 0.25, 1)',   // Whisper
      'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Breathe
      'cubic-bezier(0.4, 0, 0.2, 1)',      // Flow
      'cubic-bezier(0.4, 0, 0.6, 1)',      // Pulse
    ];
    return easings[Math.floor(Math.random() * easings.length)];
  }
  
  randomDuration() {
    return [150, 200, 300, 400, 500, 600][Math.floor(Math.random() * 6)];
  }
  
  randomMotionPersonality() {
    return ['Whisper', 'Breathe', 'Snap', 'Flow', 'Pulse'][Math.floor(Math.random() * 5)];
  }
  
  randomButtonStyle() {
    return {
      shape: ['squircle', 'pill', 'rectangle', 'organic'][Math.floor(Math.random() * 4)],
      size: ['sm', 'md', 'lg'][Math.floor(Math.random() * 3)],
      hoverEffect: ['scale', 'glow', 'color-shift', 'rotate'][Math.floor(Math.random() * 4)],
    };
  }
  
  randomCardStyle() {
    return {
      borderRadius: this.randomBorderRadius(),
      glassmorphism: Math.random() > 0.5,
      shadow: Math.random() > 0.5,
      hoverEffect: ['lift', 'glow', 'scale', 'none'][Math.floor(Math.random() * 4)],
    };
  }
  
  randomNavStyle() {
    return {
      position: ['top', 'side', 'floating'][Math.floor(Math.random() * 3)],
      style: ['minimal', 'glass', 'solid', 'gradient'][Math.floor(Math.random() * 4)],
      animation: Math.random() > 0.5,
    };
  }
  
  randomBorderRadius() {
    const types = [
      '61% 39% 34% 66% / 62% 31% 69% 38%',  // Organic squircle
      '24px',
      '12px',
      '8px',
      '50%',
      '0px',
    ];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  // Clone the state
  clone() {
    return new DesignState({
      ...this,
      colors: { ...this.colors },
      typography: { ...this.typography, sizeScale: [...this.typography.sizeScale] },
      layout: { ...this.layout, grid: [...this.layout.grid] },
      animation: { ...this.animation },
      components: {
        buttons: { ...this.components.buttons },
        cards: { ...this.components.cards },
        navigation: { ...this.components.navigation },
      },
    });
  }
  
  // Mutate the state (apply a random action)
  mutate() {
    const newState = this.clone();
    const mutation = Math.floor(Math.random() * 15);
    
    switch (mutation) {
      case 0: newState.colors.primary = newState.randomOKLCH(); break;
      case 1: newState.colors.secondary = newState.randomOKLCH(); break;
      case 2: newState.colors.background = newState.randomOKLCH(); break;
      case 3: newState.colors.accent = newState.randomOKLCH(); break;
      case 4: newState.typography.heading = newState.randomFont('heading'); break;
      case 5: newState.typography.body = newState.randomFont('body'); break;
      case 6: newState.layout.type = newState.randomLayoutType(); break;
      case 7: newState.layout.grid = newState.randomGrid(); break;
      case 8: newState.layout.asymmetry = newState.randomAsymmetry(); break;
      case 9: newState.animation.easing = newState.randomEasing(); break;
      case 10: newState.animation.duration = newState.randomDuration(); break;
      case 11: newState.animation.motionPersonality = newState.randomMotionPersonality(); break;
      case 12: newState.components.buttons = newState.randomButtonStyle(); break;
      case 13: newState.components.cards = newState.randomCardStyle(); break;
      case 14: newState.components.navigation = newState.randomNavStyle(); break;
    }
    
    newState.generation = this.generation + 1;
    newState.parentId = this.id;
    newState.id = newState.generateId();
    
    return newState;
  }
  
  // Convert to CSS variables
  toCSS() {
    return `
:root {
  /* Colors */
  --color-primary: ${this.colors.primary};
  --color-secondary: ${this.colors.secondary};
  --color-background: ${this.colors.background};
  --color-accent: ${this.colors.accent};
  --color-text: ${this.colors.text};
  --color-text-secondary: ${this.colors.textSecondary};
  
  /* Typography */
  --font-heading: '${this.typography.heading}', sans-serif;
  --font-body: '${this.typography.body}', sans-serif;
  --font-size-scale: ${this.typography.sizeScale.join(', ')};
  --line-height: ${this.typography.lineHeight};
  --max-width: ${this.typography.maxWidth};
  
  /* Layout */
  --layout-type: ${this.layout.type};
  --grid-template: ${this.layout.grid.join('fr ')}fr;
  --spacing: ${this.layout.spacing}px;
  --asymmetry-horizontal: ${this.layout.asymmetry.horizontal};
  --asymmetry-vertical: ${this.layout.asymmetry.vertical};
  --asymmetry-ratio: ${this.layout.asymmetry.ratio};
  
  /* Animation */
  --easing: ${this.animation.easing};
  --duration: ${this.animation.duration}ms;
  --motion-personality: ${this.animation.motionPersonality};
  
  /* Components */
  --button-shape: ${this.components.buttons.shape};
  --button-size: ${this.components.buttons.size};
  --button-hover: ${this.components.buttons.hoverEffect};
  --card-border-radius: ${this.components.cards.borderRadius};
  --card-glassmorphism: ${this.components.cards.glassmorphism};
  --card-shadow: ${this.components.cards.shadow};
  --nav-position: ${this.components.navigation.position};
  --nav-style: ${this.components.navigation.style};
}
`;
  }
  
  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      generation: this.generation,
      parentId: this.parentId,
      colors: this.colors,
      typography: this.typography,
      layout: this.layout,
      animation: this.animation,
      components: this.components,
    };
  }
}

// ============================================================================
// MCTS NODE
// ============================================================================

class MCTSNode {
  constructor(state, parent = null, action = null) {
    this.state = state;
    this.parent = parent;
    this.action = action;
    this.children = [];
    this.visits = 0;
    this.value = 0;
    this.untriedActions = this.getLegalActions();
  }
  
  getLegalActions() {
    // Return all possible mutations
    return [
      'mutate_primary_color',
      'mutate_secondary_color',
      'mutate_background_color',
      'mutate_accent_color',
      'mutate_heading_font',
      'mutate_body_font',
      'mutate_layout_type',
      'mutate_grid',
      'mutate_asymmetry',
      'mutate_easing',
      'mutate_duration',
      'mutate_motion_personality',
      'mutate_button_style',
      'mutate_card_style',
      'mutate_nav_style',
    ];
  }
  
  isFullyExpanded() {
    return this.untriedActions.length === 0;
  }
  
  isTerminal() {
    // Design is terminal when we've expanded enough
    // In practice, we stop at a certain depth
    return this.state.generation >= 30; // Max 30 mutations from root
  }
}

// ============================================================================
// MONTE CARLO TREE SEARCH
// ============================================================================

class MonteCarloTreeSearch {
  constructor(rootState, options = {}) {
    this.root = new MCTSNode(rootState);
    this.iterations = options.iterations || 50;
    this.exploration = options.exploration || 1.414; // UCB1 constant
    this.timeout = options.timeout || 60000; // 60 seconds
    this.bestScore = 0;
    this.bestState = null;
    this.startTime = Date.now();
    
    // Cache for evaluation
    this.evaluationCache = new Map();
    
    // Evaluation weights
    this.weights = options.weights || {
      cognitive: 0.4,
      antiSlop: 0.3,
      visual: 0.2,
      novelty: 0.1
    };
  }
  
  // Main search loop
  async search() {
    console.log('\n' + '='.repeat(80));
    console.log('   🎲 UI-UX-SKILL MONTE CARLO TREE SEARCH');
    console.log('='.repeat(80) + '\n');
    console.log(`Iterations: ${this.iterations}`);
    console.log(`Exploration: ${this.exploration}`);
    console.log(`Timeout: ${this.timeout}ms\n`);
    
    const intentFile = path.join(__dirname, '../../.vg-canvas/mcts_intent.json');
    const intentDir = path.dirname(intentFile);
    let intentWatcher;
    let pendingIntentUpdate = false;
    
    try {
      this.ensureDir(intentDir);
      if (!fs.existsSync(intentFile)) {
        fs.writeFileSync(intentFile, JSON.stringify({}), 'utf8');
      }
      intentWatcher = fs.watch(intentDir, (eventType, filename) => {
        if (filename === 'mcts_intent.json') {
          pendingIntentUpdate = true;
        }
      });
    } catch (error) {
      console.warn('Could not set up file watcher for intent file:', error.message);
    }
    
    try {
      let iteration = 0;
      while (iteration < this.iterations && Date.now() - this.startTime < this.timeout) {
        // Check for interrupt signals / intent updates at iteration boundaries
        if (pendingIntentUpdate) {
          pendingIntentUpdate = false;
          try {
            if (fs.existsSync(intentFile)) {
              const fileContent = await fs.promises.readFile(intentFile, 'utf8');
              if (fileContent.trim()) {
                const intentData = JSON.parse(fileContent);
                
                if (intentData.stop === true) {
                  console.log(`\n⚠️  [INTERRUPT] Received early stop signal. Exiting search loop gracefully.`);
                  break;
                }
                
                let updated = false;
                if (intentData.exploration !== undefined && this.exploration !== intentData.exploration) {
                  this.exploration = intentData.exploration;
                  updated = true;
                }
                if (intentData.iterations !== undefined && this.iterations !== intentData.iterations) {
                  this.iterations = intentData.iterations;
                  updated = true;
                }
                if (intentData.timeout !== undefined) {
                  this.timeout = intentData.timeout;
                  updated = true;
                }
                if (intentData.weights) {
                  this.weights = { ...this.weights, ...intentData.weights };
                  // Clear cache so evaluations reflect new design constraints/priorities
                  this.evaluationCache.clear();
                  updated = true;
                }
                
                if (updated) {
                  console.log(`\n🔄 [INTERRUPT] Steering signal applied mid-run: ${JSON.stringify(intentData)}`);
                }
              }
            }
          } catch (error) {
            // File might be mid-write or invalid JSON, ignore and it may trigger again on next change
          }
        }

        iteration++;
        
        // Progress update
        if (iteration % 5 === 0 || iteration === 1) {
          process.stdout.write(`\rIteration: ${iteration}/${this.iterations} | Best Score: ${this.bestScore.toFixed(1)}/100`);
        }
        
        // MCTS cycle
        let node = this.select(this.root);
        node = this.expand(node);
        const reward = await this.simulate(node);
        this.backpropagate(node, reward);
        
        // Track best
        if (reward > this.bestScore) {
          this.bestScore = reward;
          this.bestState = node.state;
        }
      }
      
      console.log(`\n\n${'='.repeat(80)}`);
      console.log(`   🎯 SEARCH COMPLETE`);
      console.log('='.repeat(80) + '\n');
      console.log(`Iterations: ${iteration}`);
      console.log(`Time: ${(Date.now() - this.startTime) / 1000}s`);
      console.log(`Best Score: ${this.bestScore.toFixed(1)}/100`);
      console.log(`Explored States: ${this.countNodes(this.root)}\n`);
      
      return this.bestState;
    } finally {
      if (intentWatcher) {
        intentWatcher.close();
      }
    }
  }
  
  // Selection: Traverse tree using UCB1
  select(node) {
    while (!node.isTerminal() && node.isFullyExpanded()) {
      node = this.bestChild(node);
    }
    return node;
  }
  
  // Expansion: Add a new child node
  expand(node) {
    if (node.isTerminal()) {
      return node; // Can't expand terminal nodes
    }
    
    const action = node.untriedActions.pop();
    const newState = this.applyAction(node.state, action);
    const child = new MCTSNode(newState, node, action);
    node.children.push(child);
    return child;
  }
  
  // Simulation: Evaluate the design
  async simulate(node) {
    // Check cache
    if (this.evaluationCache.has(node.state.id)) {
      return this.evaluationCache.get(node.state.id);
    }
    
    // Generate HTML from state
    const html = this.generateHTML(node.state);
    
    // Write to temp file
    const tempFile = path.join(__dirname, `../../.vg-canvas/temp/${node.state.id}.html`);
    this.ensureDir(path.dirname(tempFile));
    fs.writeFileSync(tempFile, html, 'utf8');
    
    // Evaluate using multiple metrics
    const cognitiveScore = await this.evaluateCognitive(tempFile);
    
    const antiSlopScore = await this.evaluateAntiSlop(tempFile);
    const visualScore = this.evaluateVisual(node.state);
    const noveltyScore = this.evaluateNovelty(node);
    
    let finalScore;
    if (cognitiveScore === -1) {
      finalScore = 0;
    } else {
      // Combine scores (weighted average)
      finalScore = (
        cognitiveScore * this.weights.cognitive +
        antiSlopScore * this.weights.antiSlop +
        visualScore * this.weights.visual +
        noveltyScore * this.weights.novelty
      );
    }
    
    // Cache the result
    this.evaluationCache.set(node.state.id, finalScore);
    
    return finalScore;
  }
  
  // Backpropagation: Update tree with reward
  backpropagate(node, reward) {
    while (node !== null) {
      node.visits++;
      node.value += reward;
      node = node.parent;
    }
  }
  
  // Best child using UCB1
  bestChild(node) {
    if (node.children.length === 0) return null;
    
    let bestChild = null;
    let bestScore = -Infinity;
    
    for (const child of node.children) {
      // UCB1 formula: value/visits + exploration * sqrt(ln(parentVisits)/childVisits)
      const ucb = (child.value / child.visits) + 
                  (this.exploration * Math.sqrt(Math.log(node.visits) / child.visits));
      
      if (ucb > bestScore) {
        bestScore = ucb;
        bestChild = child;
      }
    }
    
    return bestChild;
  }
  
  // Apply action to state
  applyAction(state, action) {
    const newState = state.clone();
    
    switch (action) {
      case 'mutate_primary_color':
        newState.colors.primary = newState.randomOKLCH();
        break;
      case 'mutate_secondary_color':
        newState.colors.secondary = newState.randomOKLCH();
        break;
      case 'mutate_background_color':
        newState.colors.background = newState.randomOKLCH();
        break;
      case 'mutate_accent_color':
        newState.colors.accent = newState.randomOKLCH();
        break;
      case 'mutate_heading_font':
        newState.typography.heading = newState.randomFont('heading');
        break;
      case 'mutate_body_font':
        newState.typography.body = newState.randomFont('body');
        break;
      case 'mutate_layout_type':
        newState.layout.type = newState.randomLayoutType();
        break;
      case 'mutate_grid':
        newState.layout.grid = newState.randomGrid();
        break;
      case 'mutate_asymmetry':
        newState.layout.asymmetry = newState.randomAsymmetry();
        break;
      case 'mutate_easing':
        newState.animation.easing = newState.randomEasing();
        break;
      case 'mutate_duration':
        newState.animation.duration = newState.randomDuration();
        break;
      case 'mutate_motion_personality':
        newState.animation.motionPersonality = newState.randomMotionPersonality();
        break;
      case 'mutate_button_style':
        newState.components.buttons = newState.randomButtonStyle();
        break;
      case 'mutate_card_style':
        newState.components.cards = newState.randomCardStyle();
        break;
      case 'mutate_nav_style':
        newState.components.navigation = newState.randomNavStyle();
        break;
      default:
        // Random mutation
        return newState.mutate();
    }
    
    newState.generation = state.generation + 1;
    newState.parentId = state.id;
    newState.id = newState.generateId();
    
    return newState;
  }
  
  // Generate HTML from design state
  generateHTML(state) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCTS Generated Design</title>
    <style>
        ${state.toCSS()}
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--font-body);
            background-color: var(--color-background);
            color: var(--color-text);
            line-height: var(--line-height);
            min-height: 100vh;
        }
        
        .container {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 2rem;
        }
        
        h1 {
            font-family: var(--font-heading);
            color: var(--color-primary);
            font-size: clamp(2rem, 5vw, 4rem);
            margin-bottom: 1rem;
            animation: fadeIn 0.8s var(--easing);
        }
        
        p {
            margin-bottom: 1.5rem;
            color: var(--color-text-secondary);
        }
        
        .hero {
            background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
            color: var(--color-background);
            padding: 4rem 2rem;
            text-align: center;
            clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 95% 100%, 5% 100%, 0% 85%);
            margin-bottom: 2rem;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing);
            margin: 2rem 0;
        }
        
        .card {
            background: var(--color-background);
            border-radius: ${state.components.cards.borderRadius};
            padding: 1.5rem;
            ${state.components.cards.glassmorphism ? 'backdrop-filter: blur(10px);' : ''}
            ${state.components.cards.shadow ? 'box-shadow: 0 4px 20px rgba(0,0,0,0.1);' : ''}
            transition: transform var(--duration) var(--easing);
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: var(--color-primary);
            color: var(--color-background);
            border: none;
            border-radius: ${state.components.buttons.shape === 'pill' ? '50px' : 
                          state.components.buttons.shape === 'squircle' ? state.components.cards.borderRadius :
                          state.components.buttons.shape === 'rectangle' ? '0' :
                          state.components.buttons.shape};
            font-family: var(--font-heading);
            cursor: pointer;
            transition: all var(--duration) var(--easing);
        }
        
        .button:hover {
            ${state.components.buttons.hoverEffect === 'scale' ? 'transform: scale(1.05);' :
              state.components.buttons.hoverEffect === 'glow' ? 'box-shadow: 0 0 20px var(--color-primary);' :
              state.components.buttons.hoverEffect === 'color-shift' ? 'background: var(--color-accent);' :
              ''}
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @media (prefers-reduced-motion) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>MCTS Generated Design</h1>
            <p>Score: ${this.bestScore.toFixed(1)}/100 | Personality: ${state.animation.motionPersonality}</p>
            <button class="button">Explore More</button>
        </div>
    </div>
    
    <div class="container">
        <h2>Design Parameters</h2>
        <div class="grid">
            <div class="card">
                <h3>Colors</h3>
                <p><strong>Primary:</strong> ${state.colors.primary}</p>
                <p><strong>Secondary:</strong> ${state.colors.secondary}</p>
                <p><strong>Background:</strong> ${state.colors.background}</p>
            </div>
            <div class="card">
                <h3>Typography</h3>
                <p><strong>Heading:</strong> ${state.typography.heading}</p>
                <p><strong>Body:</strong> ${state.typography.body}</p>
                <p><strong>Max Width:</strong> ${state.typography.maxWidth}</p>
            </div>
            <div class="card">
                <h3>Layout</h3>
                <p><strong>Type:</strong> ${state.layout.type}</p>
                <p><strong>Grid:</strong> ${state.layout.grid.join('fr ')}fr</p>
                <p><strong>Spacing:</strong> ${state.layout.spacing}px</p>
            </div>
            <div class="card">
                <h3>Animation</h3>
                <p><strong>Easing:</strong> ${state.animation.easing}</p>
                <p><strong>Duration:</strong> ${state.animation.duration}ms</p>
                <p><strong>Personality:</strong> ${state.animation.motionPersonality}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }
  
  // Evaluate cognitive design quality
  async evaluateCognitive(tempFile) {
    try {
      // Use design-simulator to analyze the design
      const { stdout } = await exec(`node ${path.join(__dirname, 'design-simulator.js')} --file ${tempFile}`);
      
      if (stdout.includes('[SPATIAL_VIOLATION]')) return -1;
      
      let tasteScore = 50;
      let cognitiveLoadScore = 50;
      
      const tasteMatch = stdout.match(/Taste & Aesthetic Score:\s*([\d.]+)\/100/i);
      if (tasteMatch) {
        tasteScore = parseFloat(tasteMatch[1]);
      }
      
      const cogMatch = stdout.match(/Cognitive Load Index:\s*([\d.]+)/i);
      if (cogMatch) {
        const load = parseFloat(cogMatch[1]);
        // Lower cognitive load is better.
        // If load is 0, score is 100. If load is 50+, score is 0.
        cognitiveLoadScore = Math.max(0, 100 - (load * 2));
      }
      
      // Combine metrics for the continuous cognitive score
      return (tasteScore + cognitiveLoadScore) / 2;
    } catch (error) {
      // Even if it errors, try parsing stdout first
      const stdout = error.stdout || '';
      
      if (stdout.includes('[SPATIAL_VIOLATION]')) return -1;
      
      let tasteScore = 50;
      let cognitiveLoadScore = 50;
      
      const tasteMatch = stdout.match(/Taste & Aesthetic Score:\s*([\d.]+)\/100/i);
      if (tasteMatch) {
        tasteScore = parseFloat(tasteMatch[1]);
      }
      
      const cogMatch = stdout.match(/Cognitive Load Index:\s*([\d.]+)/i);
      if (cogMatch) {
        const load = parseFloat(cogMatch[1]);
        cognitiveLoadScore = Math.max(0, 100 - (load * 2));
      }
      
      if (tasteMatch || cogMatch) {
        return (tasteScore + cognitiveLoadScore) / 2;
      }
      
      return 50;
    }
  }
  
  // Evaluate anti-slop quality
  async evaluateAntiSlop(tempFile) {
    try {
      const { stdout } = await exec(`node ${path.join(__dirname, 'anti-slop-checker.js')} --file ${tempFile} 2>&1`);
      
      // Extract the score from output
      const scoreMatch = stdout.match(/PREMIUM SCORE:\s*(\d+)\/100/i);
      if (scoreMatch) {
        return parseInt(scoreMatch[1]);
      }
      
      return 50;
    } catch (error) {
      // If there's an error but we have stdout, try parsing it
      const stdout = error.stdout || '';
      const scoreMatch = stdout.match(/PREMIUM SCORE:\s*(\d+)\/100/i);
      if (scoreMatch) {
        return parseInt(scoreMatch[1]);
      }
      return 50;
    }
  }
  
  // Evaluate visual quality
  evaluateVisual(state) {
    let score = 0;
    
    // OKLCH colors
    if (Object.values(state.colors).every(c => c.startsWith('oklch'))) {
      score += 20;
    }
    
    // Underrated fonts
    const underratedFonts = ['Instrument Sans', 'Instrument Serif', 'Bricolage Grotesque', 'Fraunces', 'Cormorant Garamond', 'Arapey'];
    if (underratedFonts.includes(state.typography.heading)) score += 10;
    if (underratedFonts.includes(state.typography.body)) score += 10;
    
    // Bento or asymmetric layout
    if (['bento', 'asymmetric', 'organic'].includes(state.layout.type)) score += 15;
    
    // Spring physics easing
    if (state.animation.easing.includes('cubic-bezier')) score += 10;
    
    // Custom border radius
    if (state.components.cards.borderRadius !== '0px') score += 10;
    
    // Glassmorphism
    if (state.components.cards.glassmorphism) score += 5;
    
    // 65ch max width
    if (state.typography.maxWidth === '65ch') score += 5;
    
    // Motion personality
    if (['Whisper', 'Breathe', 'Snap', 'Flow', 'Pulse'].includes(state.animation.motionPersonality)) score += 5;
    
    return Math.min(100, score);
  }
  
  // Evaluate novelty (diversity from parent)
  evaluateNovelty(node) {
    if (!node.parent || !node.parent.state) return 100; // Root node is most novel
    
    const state = node.state;
    const parentState = node.parent.state;

    // Calculate a similarity hash based on layout type and grid ratios
    const getLayoutHash = (s) => `${s.layout.type}-${s.layout.grid.join(':')}`;
    const childHash = getLayoutHash(state);
    const parentHash = getLayoutHash(parentState);

    let score = 50; // baseline

    // Reward higher generation counts (depth-positive)
    score += state.generation * 2;

    // Child states with identical layout hashes to their parent receive a lower novelty priority
    if (childHash === parentHash) {
      score -= 30; // lower novelty priority
    } else {
      score += 20; // unique hashes
    }

    return Math.max(0, Math.min(100, score));
  }
  
  // Count all nodes in tree
  countNodes(node) {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }
  
  // Ensure directory exists
  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    iterations: 50,
    exploration: 1.414,
    timeout: 60000,
    output: null,
    json: false,
    help: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      options.iterations = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--exploration' && args[i + 1]) {
      options.exploration = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--timeout' && args[i + 1]) {
      options.timeout = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--json') {
      options.json = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      options.help = true;
    }
  }
  
  if (options.help) {
    console.log('\n📖 UI-UX-Skill Monte Carlo Tree Search');
    console.log('='.repeat(50));
    console.log('\nUsage:');
    console.log('  node skills/utils/design-mcts.js [options]');
    console.log('\nOptions:');
    console.log('  --iterations <n>    Number of MCTS iterations (default: 50)');
    console.log('  --exploration <x>   UCB1 exploration constant (default: 1.414)');
    console.log('  --timeout <ms>      Maximum runtime in ms (default: 60000)');
    console.log('  --output <file>     Save best design to file');
    console.log('  --json             Output result as JSON');
    console.log('  --help, -h         Show this help message');
    console.log('\nExamples:');
    console.log('  node skills/utils/design-mcts.js --iterations 5000 --output best-design.html');
    console.log('  node skills/utils/design-mcts.js --exploration 2.0 --json');
    process.exit(0);
  }
  
  // Create root state (empty or random design)
  const rootState = new DesignState();
  
  // Create MCTS instance
  const mcts = new MonteCarloTreeSearch(rootState, options);
  
  // Run search
  const bestState = await mcts.search();
  
  // Output result
  if (options.json) {
    console.log(JSON.stringify(bestState.toJSON(), null, 2));
  } else {
    // Generate and save HTML
    const html = mcts.generateHTML(bestState);
    
    if (options.output) {
      fs.writeFileSync(options.output, html, 'utf8');
      console.log(`\n✅ Best design saved to: ${options.output}\n`);
    } else {
      // Save to temp file
      const tempFile = path.join(__dirname, `../../.vg-canvas/temp/mcts-best-design.html`);
      mcts.ensureDir(path.dirname(tempFile));
      fs.writeFileSync(tempFile, html, 'utf8');
      console.log(`\n✅ Best design saved to: ${tempFile}\n`);
    }
    
    // Display summary
    console.log('='.repeat(80));
    console.log('   🏆 BEST DESIGN FOUND');
    console.log('='.repeat(80) + '\n');
    console.log(`ID: ${bestState.id}`);
    console.log(`Generation: ${bestState.generation}`);
    console.log(`Score: ${mcts.bestScore.toFixed(1)}/100\n`);
    
    console.log('Colors:');
    console.log(`  Primary: ${bestState.colors.primary}`);
    console.log(`  Secondary: ${bestState.colors.secondary}`);
    console.log(`  Background: ${bestState.colors.background}`);
    console.log(`  Accent: ${bestState.colors.accent}\n`);
    
    console.log('Typography:');
    console.log(`  Heading: ${bestState.typography.heading}`);
    console.log(`  Body: ${bestState.typography.body}`);
    console.log(`  Max Width: ${bestState.typography.maxWidth}\n`);
    
    console.log('Layout:');
    console.log(`  Type: ${bestState.layout.type}`);
    console.log(`  Grid: ${bestState.layout.grid.join('fr ')}fr`);
    console.log(`  Spacing: ${bestState.layout.spacing}px\n`);
    
    console.log('Animation:');
    console.log(`  Easing: ${bestState.animation.easing}`);
    console.log(`  Duration: ${bestState.animation.duration}ms`);
    console.log(`  Personality: ${bestState.animation.motionPersonality}\n`);
    
    console.log('Components:');
    console.log(`  Buttons: ${bestState.components.buttons.shape} / ${bestState.components.buttons.hoverEffect}`);
    console.log(`  Cards: ${bestState.components.cards.borderRadius} / Glass: ${bestState.components.cards.glassmorphism}`);
    console.log(`  Navigation: ${bestState.components.navigation.position} / ${bestState.components.navigation.style}\n`);
    
    console.log('='.repeat(80) + '\n');
    console.log('💡 To view the design, open the HTML file in a browser.');
    console.log('💡 To verify quality, run: node skills/utils/anti-slop-checker.js --file <output-file>');
    console.log('💡 To audit design, run: node skills/utils/design-simulator.js --file <output-file>\n');
  }
}

// Run
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
