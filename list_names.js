const fs = require('fs');
const content = fs.readFileSync('mcp_output.json', 'utf8');

// Use regex to find name patterns
const matches = content.match(/"name":"([a-zA-Z0-9_]+)"/g);
if (matches) {
  const names = Array.from(new Set(matches.map(m => m.split(':')[1].replace(/"/g, ''))));
  console.log('Unique tool/property names found:', names);
} else {
  console.log('No matches found.');
}
