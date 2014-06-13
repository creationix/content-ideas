var tokens = [
  "VAR",           // 0
  ["IDENT","add"],
  "=",
  "{",             // 3
  ["IDENT","a"],
  ["IDENT","b"],
  "|",
  ["IDENT","a"],   // 7
  "+",
  ["IDENT","b"],   // 9
  "}",             // 10
  "TERM"
];

a(asd)
a;(asd)
a[1]
a;[1]
add{1 2}

add = {a b|a+b}
add{}
add;{}

block {}
define fn {|}
call fn {}

object literal
array literal
object access []


grouping ()
math <>
string "" ''
buffer

add 1 2

@fn