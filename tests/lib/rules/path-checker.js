/**
 * @fileoverview feature sliced relative path checker
 * @author mikhail
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: 'module' }
});
ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename: 'C:\\Users\\mikhail\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { getAddCommentFormError, getAddCommentFormText } from '../../model/slices/addCommentFormSelectors'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными" }],
    },
  ],

  invalid: [
    {
      filename: 'C:\\Users\\mikhail\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { getAddCommentFormError, getAddCommentFormText } from '@/entities/Article/model/slices/addCommentFormSelectors'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными" }],
      options: [
        {
          alias: '@'
        }
      ]
    },
    {
      filename: 'C:\\Users\\mikhail\\Desktop\\javascript\\production_project\\src\\entities\\Article',
      code: "import { getAddCommentFormError, getAddCommentFormText } from 'entities/Article/model/slices/addCommentFormSelectors'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными" }],
    },
  ],
});
