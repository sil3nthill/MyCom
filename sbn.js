(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.sbn = factory());
}(this, (function () { 'use strict';

// \s : matches any whitespace character (equal to [\r\n\t\f\v ])
//  + : match previous condition for one and unlimited times
// implement declaration
// Type :int , double , char , String
// import, class , main ,return , public , private ,
// if,else 
//init *  i=1; line=hello; 
function lexer (code) {
  var _tokens = code
                  .replace(/[\n\r]/g, ' *nl* ')
                  .replace(/\[/g, ' *ob* ')
                  .replace(/\]/g, ' *cb* ')
                  .replace(/\{/g, ' *ocb* ')
                  .replace(/\}/g, ' *ccb* ')
		  .replace(/\=/g, ' *eq* ')
                  .split(/[\t\f\v ]+/)
  var tokens = []
  for (var i = 0; i < _tokens.length; i++) {
    var t = _tokens[i]
    if(t.length <= 0 || isNaN(t)) {
      if (t === '*nl*') {
        tokens.push({type: 'newline'})
      } else if (t === '*ob*') {
        tokens.push({type: 'ob'})
      } else if (t === '*cb*') {
        tokens.push({type: 'cb'})
      } else if (t === '*ocb*') {
        tokens.push({type: 'ocb'})
      } else if (t === '*ccb*') {
        tokens.push({type: 'ccb'})
      }else if (t === '*eq*') {
        tokens.push({type: 'eq'})
      }

	 else if(t.length > 0) {

	
        tokens.push({type: 'word', value: t})
      }
    } else {
      tokens.push({type: 'number', value: t})
    }
  }

  if (tokens.length < 1) {
    throw 'No Tokens Found. Try "i"'
  }

  return tokens
}

function parser (tokens) {
  function expectedTypeCheck (type, expect) {
    if(Array.isArray(expect)) {
      var i = expect.indexOf(type)
      return i >= 0
    }
    return type === expect // return true if both value and type are equals 
  }

  function createDot (current_token, currentPosition, node) {
    var expectedType = ['ob', 'number', 'word', 'cb']
    var expectedLength = 4
    currentPosition = currentPosition || 0
    node = node || {type: 'dot'}

    if (currentPosition < expectedLength - 1) {
      if (expectedTypeCheck(current_token.type, expectedType[currentPosition])){
        if(currentPosition === 1) {
          node.x = current_token.value
        }
        if(currentPosition === 2) {
          node.y = current_token.value
        }
        currentPosition++
        createDot(tokens.shift(), currentPosition, node)
      } else {
        throw 'Expected ' + expectedType[currentPosition] + ' but found ' + current_token.type + '.'
      }
    }
    return node
  }

  function findArguments(command, expectedLength, expectedType, currentPosition, currentList) {
    currentPosition = currentPosition || 0
    currentList = currentList || []
    while (expectedLength > currentPosition) {
      var token = tokens.shift()
      if (!token) {
        throw command + ' takes ' + expectedLength + ' argument(s). '
      }

      if (expectedType){
        var expected = expectedTypeCheck(token.type, expectedType[currentPosition])
        if (!expected) {
          throw command + ' takes ' + JSON.stringify(expectedType[currentPosition]) + ' as argument ' + (currentPosition + 1) + '. ' + (token ? 'Instead found a ' + token.type + ' '+ (token.value || '') + '.' : '')
        }
       /* if (token.type === 'number' && (token.value < 0 || token.value > 100)){
          throw 'Found value ' + token.value + ' for ' + command + '. Value must be between 0 - 100.'
        }*/
      }

      var arg = {
        type: token.type,
        value: token.value
      }
      if (token.type === 'ob') {
        arg = createDot(token)
      }
      currentList.push(arg)
      currentPosition++
    }
    return currentList
  }

  var AST = {
    type: 'Code',
    body: []
  }
  var paper = false
  var pen = false

  while (tokens.length > 0) {
    var current_token = tokens.shift()
    if (current_token.type === 'word') {
      switch (current_token.value) {
        case '{' :
          var block = {
            type: 'Block Start'
          }
          AST.body.push(block)
          break
        case '}' :
          var block = {
            type: 'Block End'
          }
          AST.body.push(block)
          break
        case '//' :
          var expression = {
            type: 'CommentExpression',
            value: ''
          }
          var next = tokens.shift()
          while (next.type !== 'newline') {
            expression.value += next.value + ' '
            next = tokens.shift()
          }
          AST.body.push(expression)
          break
        case 'var' :
        /*  if (paper) {
            throw 'You can not define Paper more than once'
          }*/
          var expression = {
            type: 'Declaration',
            name: 'var',
            arguments: []
          }
          var args = findArguments('var', 1)
          expression.arguments = expression.arguments.concat(args)
          AST.body.push(expression)
          paper = true
          break

	/*  case 'function' :
        
          var expression = {
            type: 'FuntionDeclaration',
            name: 'function',
            arguments: []
          }
          var args = findArguments('var', 1)
          expression.arguments = expression.arguments.concat(args)
          AST.body.push(expression)
          paper = true
          break*/



  
        default:
          throw current_token.value + ' is not a valid command'
      }
    } else if (['newline', 'ocb', 'ccb'].indexOf[current_token.type] < 0 ) {
      throw 'Unexpected token type : ' + current_token.type
    }
  }

  return AST
}

function transformer (ast) {

  
}

function generator (ast) {

  
}

var SBN = {}

SBN.VERSION = ''
SBN.lexer = lexer
SBN.parser = parser
SBN.transformer = transformer
SBN.generator = generator

/*SBN.compile = function (code) {
  return this.generator(this.transformer(this.parser(this.lexer(code))))
}*/

return SBN;

})));
