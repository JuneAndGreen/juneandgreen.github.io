module.exports = {
  // 文档结点
  element: function(name, attrs, children){
    return {
      type: 'element',
      tag: name,
      attrs: attrs,
      children: children
    }
  },
  // 属性结点
  attribute: function(name, value, mdf){
    return {
      type: 'attribute',
      name: name,
      value: value,
      mdf: mdf
    }
  },
  // 判断语句结点
  "if": function(test, consequent, alternate){
    return {
      type: 'if',
      test: test, // 判断条件
      consequent: consequent, // 条件为true时的内容
      alternate: alternate // 条件为false时的内容
    }
  },
  // 列表语句结点
  list: function(sequence, variable, body, alternate, track){
    return {
      type: 'list',
      sequence: sequence, // 被遍历列表
      alternate: alternate, // 列表为空时的内容
      variable: variable, // 每次遍历时注入的变量
      body: body, // 列表语句内的内容
      track: track
    }
  },
  // 表达式结点
  expression: function( body, setbody, constant ){
    return {
      type: "expression",
      body: body, // getter函数字符串
      constant: constant || false,
      setbody: setbody || false // setter函数字符串
    }
  },
  // 文本结点
  text: function(text){
    return {
      type: "text",
      text: text
    }
  },
  // 模板结点
  template: function(template){
    return {
      type: 'template',
      content: template
    }
  }
}
