const htmlparser = require('htmlparser2');
const fs = require("fs");

const html = fs.readFileSync("./markup.html", "utf-8");
function parseHTMLToObj(html) {
  const obj = {};
  const stack = [obj];
  let current = obj;

  const parser = new htmlparser.Parser({
    onopentag(tagname, attribs) {
      const newNode = {
        tag: tagname,
        style: {},
      };

      if (attribs.id) {
        newNode.id = attribs.id;
      }

      if (attribs.class) {
        newNode.class = attribs.class;
      }

      if (attribs.style) {
        const stylePairs = attribs.style.split(';').map(pair => pair.trim().split(':'));
        for (const [key, value] of stylePairs) {
          newNode.style[key.trim()] = value.trim();
        }
      }

      current.children = current.children || [];
      current.children.push(newNode);

      stack.push(newNode);
      current = newNode;
    },
    ontext(text) {
      if (text.trim()) {
        current.text = text.trim();
      }
    },
    onclosetag(tagname) {
      stack.pop();
      current = stack[stack.length - 1];
    },
  }, { decodeEntities: true });

  parser.write(html);
  parser.end();

  return obj;
}


const parsedObject = parseHTMLToObj(html);
console.log(JSON.stringify(parsedObject, null, 2));
