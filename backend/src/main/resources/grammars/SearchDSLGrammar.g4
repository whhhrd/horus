grammar SearchDSLGrammar;

import SearchDSLLexer;

query: expr EOF;

expr:
   BRACKET_LEFT expr BRACKET_RIGHT #bracketExpr
 | NOT expr                        #notExpr
 | expr (AND expr)+                #andExpr
 | expr (OR expr)+                 #orExpr
 | LABEL                           #labelExpr
 ;
