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

  // Replace Tailwind hardcoded brackets
  if (content.includes('[#F74838]')) {
    content = content.replace(/\[#F74838\]/g, 'brand');
    changed = true;
  }
  // Replace bare #F74838 in CSS or styles
  if (content.includes('#F74838') && file.endsWith('.css')) {
    content = content.replace(/#F74838/g, 'var(--color-brand)');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated: ' + file);
  }
});
