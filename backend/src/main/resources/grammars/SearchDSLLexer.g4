lexer grammar SearchDSLLexer;

NOT: '!';
AND: '&';
OR: '|';
BRACKET_LEFT: '(';
BRACKET_RIGHT: ')';

LABEL: ('0'..'9')+;

WS : (' ' | '\t')+ -> skip;
