const ts = require('typescript');
const fs = require('fs');
const ATTR = new Set(['placeholder','title','aria-label','alt','label','tooltip','description']);
const CALLS = new Set(['success','error','info','warning','message','loading','alert','confirm']);
const hasLetter = (s) => /[A-Za-zÀ-ÿ]/.test(s);
const meaningful = (s) => { const t=s.trim(); return t.length>=2 && hasLetter(t) && /[A-Za-zÀ-ÿ].*[A-Za-zÀ-ÿ]/.test(t) && !/^[A-Z0-9_]+$/.test(t); };
const f = process.argv[2];
const src = fs.readFileSync(f,'utf8');
const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const out = [];
const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
const objOf = (node) => (ts.isPropertyAccessExpression(node.expression) ? node.expression.expression.getText() + '.' + node.expression.name.getText() : node.expression.getText());
const visit = (node) => {
  if (node.kind === ts.SyntaxKind.JsxText) { if (meaningful(node.text)) out.push([line(node),'JSX',node.text.trim()]); }
  else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) { if (ATTR.has(node.name.getText()) && meaningful(node.initializer.text)) out.push([line(node),'ATTR:'+node.name.getText(),node.initializer.text]); }
  else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) { if (CALLS.has(node.expression.name.getText()) && node.arguments[0] && ts.isStringLiteral(node.arguments[0]) && meaningful(node.arguments[0].text)) out.push([line(node),'CALL:'+objOf(node),node.arguments[0].text]); }
  else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) { const m=node.expression.getText(); if ((m==='alert'||m==='confirm') && node.arguments[0] && ts.isStringLiteral(node.arguments[0]) && meaningful(node.arguments[0].text)) out.push([line(node),'CALL:'+m,node.arguments[0].text]); }
  ts.forEachChild(node, visit);
};
visit(sf);
console.log('COUNT ' + out.length);
if (process.argv[3] === 'full') out.forEach(([l,k,s]) => console.log(l + '\t' + k + '\t' + JSON.stringify(s)));
