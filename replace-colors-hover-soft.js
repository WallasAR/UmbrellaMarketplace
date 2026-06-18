const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('[#e03d2f]')) {
    content = content.replace(/\[#e03d2f\]/g, 'brand-hover');
    changed = true;
  }
  if (content.includes('[#fff1ef]')) {
    content = content.replace(/\[#fff1ef\]/g, 'brand-soft');
    changed = true;
  }
  if (content.includes('#e03d2f') && file.endsWith('.css')) {
    content = content.replace(/#e03d2f/g, 'var(--color-brand-hover)');
    changed = true;
  }
  if (content.includes('#fff1ef') && file.endsWith('.css')) {
    content = content.replace(/#fff1ef/g, 'var(--color-brand-soft)');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated: ' + file);
  }
});
