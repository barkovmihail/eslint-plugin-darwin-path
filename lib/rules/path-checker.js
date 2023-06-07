"use strict";

const path = require('path');
const {isPathRelative} = require("../helpers");

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      category: "Fill me in",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: 'code', // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          }
        }
      }
    ], // Add a schema if the rule has options
  },

  create(context) {
    const alias = context.options[0]?.alias || '';

    return {
      ImportDeclaration(node) {
        try {
          // example app/entities/Article
          const value = node.source.value;
          const importTo = alias ? value.replace(`${alias}/`, '') : value;

          // example C:\Users\mikhail\Desktop\javascript\production_project\src\entities\Article
          const fromFilename = context.getFilename();

          if(shouldBeRelative(fromFilename, importTo)) {
            context.report({
              node,
              message: 'В рамках одного слайса все пути должны быть относительными',
              fix: (fixer) => {
                // entities/Article/Article.tsx
                const normalizedPath = getNormalizedCurrentFilePath(fromFilename)
                    .split('/').slice(0, -1).join('/');

                let relativePath = path.relative(normalizedPath, `/${importTo}`).replace(/\\/g, '/');

                if (!relativePath.startsWith('.')) {
                  relativePath = './' + relativePath;
                }

                return fixer.replaceText(node.source, `'${relativePath}'`);
              },
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
    };
  },
};

const layers = {
  'entities': 'entities',
  'features': 'features',
  'shared': 'shared',
  'pages': 'pages',
  'widgets': 'widgets',
}

function getNormalizedCurrentFilePath(currentFilePath) {
  const normalizedPath = path
      .toNamespacedPath(currentFilePath)
      .replace(/\\/g, '/')

  const fromPath = normalizedPath?.split('src')[1];

  return fromPath;
}

function shouldBeRelative(from, to) {
  if(isPathRelative(to)) {
    return false;
  }

  // example entities/Article
  const toArray = to.split('/')
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article

  if(!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const fromNormalizedPath = getNormalizedCurrentFilePath(from);
  const fromArray = fromNormalizedPath.split('/');
  const fromLayer = fromArray[1]; // entities
  const fromSlice = fromArray[2]; // Article

  if(!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}

// console.log(shouldBeRelative('C:\\Users\\mikhail\\Desktop\\javascript\\src\\entities\\Article', 'entities/Article/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\mikhail\\Desktop\\javascript\\src\\entities\\Article', 'entities/ASdasd/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\mikhail\\Desktop\\javascript\\src\\entities\\Article', 'features/Article/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\mikhail\\Desktop\\javascript\\src\\features\\Article', 'features/Article/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\mikhail\\Desktop\\javascript\\src\\entities\\Article', 'app/index.tsx'))
// console.log(shouldBeRelative('C:/Users/mikhail/Desktop/javascript/src/entities/Article', 'entities/Article/asfasf/asfasf'))
// console.log(shouldBeRelative('C:\\Users\\mikhail\\Desktop\\javascript\\src\\entities\\Article', '../../model/selectors/getSidebarItems'))

