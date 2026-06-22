const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Require the actual classes from design-mcts.js
const mctsCode = fs.readFileSync(path.join(__dirname, 'design-mcts.js'), 'utf8');
const testContextCode = mctsCode.replace(`main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});`, 'module.exports = { DesignState, MonteCarloTreeSearch, MCTSNode };');

const tempFile = path.join(__dirname, 'design-mcts-temp.js');
fs.writeFileSync(tempFile, testContextCode);

const { DesignState, MonteCarloTreeSearch, MCTSNode } = require('./design-mcts-temp.js');

// Cleanup
fs.unlinkSync(tempFile);

async function runTests() {
  console.log('Running MCTS Hashing Unit Tests...');

  // Test 1: ID logic no longer uses Date.now() or Math.random()
  console.log('Test 1: Verification of code changes');
  const mutateCode = DesignState.prototype.mutate.toString();
  assert(!mutateCode.includes('Date.now()'), 'mutate() should not use Date.now()');
  assert(!mutateCode.includes('Math.random().toString'), 'mutate() should not use Math.random() for ID generation');
  console.log('✅ Test 1 Passed');

  // Test 2: Two design objects with identical properties result in identical ID strings.
  console.log('Test 2: Stable ID generation for identical properties');
  
  const state1 = new DesignState();
  const state2 = new DesignState();
  
  // Manually sync all properties to ensure they are deeply identical
  state2.colors = JSON.parse(JSON.stringify(state1.colors));
  state2.typography = JSON.parse(JSON.stringify(state1.typography));
  state2.layout = JSON.parse(JSON.stringify(state1.layout));
  state2.animation = JSON.parse(JSON.stringify(state1.animation));
  state2.components = JSON.parse(JSON.stringify(state1.components));
  
  // Re-generate IDs after syncing
  state1.id = state1.generateId();
  state2.id = state2.generateId();
  
  assert.strictEqual(state1.id, state2.id, 'Identical designs should have identical IDs');
  console.log('✅ Test 2 Passed');

  // Test 3: Changing a single property results in a different ID.
  console.log('Test 3: Collision resistance / Sensitivity');
  const state3 = new DesignState();
  state3.colors = JSON.parse(JSON.stringify(state1.colors));
  state3.typography = JSON.parse(JSON.stringify(state1.typography));
  state3.layout = JSON.parse(JSON.stringify(state1.layout));
  state3.animation = JSON.parse(JSON.stringify(state1.animation));
  state3.components = JSON.parse(JSON.stringify(state1.components));
  
  // Change one property
  state3.colors.primary = 'oklch(99% 0.1 200)';
  state3.id = state3.generateId();
  
  assert.notStrictEqual(state1.id, state3.id, 'Changing one property should result in a different ID');
  console.log('✅ Test 3 Passed');

  // Test 4: The evaluation cache successfully returns a score when an identical design is encountered.
  console.log('Test 4: Cache lookups with deterministic IDs');
  const mcts = new MonteCarloTreeSearch(state1, { iterations: 1 });
  
  // Pre-populate cache for state1's ID
  mcts.evaluationCache.set(state1.id, 99.9);
  
  // Create a node with state2 (identical properties, so identical ID)
  const node = new MCTSNode(state2);
  
  const score = await mcts.simulate(node);
  assert.strictEqual(score, 99.9, 'Cache should return 99.9 for identical state');
  console.log('✅ Test 4 Passed');

  console.log('All tests passed successfully! 🎉');
}

runTests().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
