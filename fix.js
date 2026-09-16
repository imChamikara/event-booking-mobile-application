const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) {
      if (file !== 'node_modules' && file !== '.expo' && file !== '.git' && file !== 'assets') {
        walk(fp);
      }
    } else if (fp.endsWith('.ts') || fp.endsWith('.tsx')) {
      let content = fs.readFileSync(fp, 'utf8');
      const newContent = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
      if (content !== newContent) {
        fs.writeFileSync(fp, newContent, 'utf8');
        console.log('Fixed', fp);
      }
    }
  }
}

walk('server');
