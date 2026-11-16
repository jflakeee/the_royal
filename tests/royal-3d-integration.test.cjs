const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'../royal-3d.js'),'utf8');
test('3D renderer is opt-in and existing 2D canvas remains intact',()=>{assert.match(html,/id="view-toggle"/);assert.match(html,/id="royal-3d" hidden/);assert.match(html,/id="world" width="800" height="480"/);assert.match(html,/type="module" src="royal-3d.js"/)});
test('3D scene reads live game state and forwards resource clicks to original command',()=>{assert.match(html,/window\.royal3DState=\(\)=>s/);assert.match(html,/window\.royal3DCommand=o=>command\(o\.x,o\.y\)/);assert.match(js,/window\.royal3DState\?\.\(\)/);assert.match(js,/window\.royal3DCommand\?\.\(g\.userData\.resource\)/)});
test('3D mode does not change save format or require model assets',()=>{assert.doesNotMatch(js,/localStorage|setItem\(/);assert.doesNotMatch(js,/\\.(?:glb|gltf|fbx|obj)(?:['\"?]|$)/);assert.match(js,/new THREE\.BoxGeometry/);assert.match(js,/new THREE\.WebGLRenderer/)});
