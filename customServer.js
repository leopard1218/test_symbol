const fs = require("fs");
const html = fs.readFileSync("./markup.html", "utf-8");

function parseHTMLToObj(html) {
  const tagRegex = /<(\w+)[^>]*>/g;
  const attrRegex = /(\w+)="([^"]*)"/g;

  const root = {
    tag: 'root',
    text: '',
    style: {},
    children: [],
  };

  let current = root;
  const stack = [];

  const parseAttributes = (attributes) => {
    const parsedAttributes = {};
    let match;

    while ((match = attrRegex.exec(attributes))) {
      const [, attrName, attrValue] = match;
      parsedAttributes[attrName] = attrValue;
    }

    return parsedAttributes;
  };

  html.replace(tagRegex, (tag, tagName, index) => {
    if (tagName.startsWith('/')) {
      // Closing tag
      current = stack.pop();
    } else {
      // Opening tag
      const element = {
        tag: tagName,
        text: '',
        style: {},
        children: [],
      };

      const startTagIndex = index;
      const endTagIndex = index + tag.length;

      const attributes = tag.slice(tagName.length + 1, -1).trim();
      const parsedAttributes = parseAttributes(attributes);

      for (const key in parsedAttributes) {
        if (key === 'style') {
          const styles = parsedAttributes[key].split(';');
          styles.forEach((style) => {
            const [styleKey, styleValue] = style.split(':').map((s) => s.trim());
            if (styleKey && styleValue) {
              element.style[styleKey] = styleValue;
            }
          });
        } else {
          element[key] = parsedAttributes[key];
        }
      }

      if (current) {
        current.children.push(element);
        stack.push(current);
        current = element;
      } else {
        current = element;
      }

      const textBeforeTag = html.slice(endTagIndex, html.indexOf('<', endTagIndex));
      if (textBeforeTag) {
        current.text = textBeforeTag.trim();
      }
    }
    return '';
  });

  return formatObject(root.children[0]);
}

function formatObject(obj) {
  const formattedObj = {
    tag: obj.tag,
    text: obj.text,
  };

  for (const key in obj) {
    if (key !== 'tag' && key !== 'text' && key !== 'children') {
      if (key === 'style' && Object.keys(obj.style).length === 0) {
        continue; // Skip empty style objects
      }
      formattedObj[key] = obj[key];
    }
  }

  if (obj.children && obj.children.length > 0) {
    formattedObj.children = obj.children.map(formatObject);
  }

  return formattedObj;
}


const parsedObject = parseHTMLToObj(html);
console.log(JSON.stringify(parsedObject, null, 2));
