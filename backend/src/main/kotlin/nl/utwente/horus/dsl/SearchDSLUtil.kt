package nl.utwente.horus.dsl

import nl.utwente.horus.dsl.antlr.SearchDSLGrammarLexer
import nl.utwente.horus.dsl.antlr.SearchDSLGrammarParser
import nl.utwente.horus.exceptions.InvalidSearchQueryException
import nl.utwente.horus.representations.dsl.QueryNodeDto
import org.antlr.v4.runtime.CharStreams
import org.antlr.v4.runtime.CommonTokenStream
import org.antlr.v4.runtime.tree.ParseTreeWalker

class SearchDSLUtil {

    companion object {
        fun queryStringToTree(query: String): QueryNodeDto {
            val charStream = CharStreams.fromString(query)
            val lexer = SearchDSLGrammarLexer(charStream)
            val tokens = CommonTokenStream(lexer)
            val parser = SearchDSLGrammarParser(tokens)

            val listener = SearchDSLToQueryNodeListener()
            val walker = ParseTreeWalker()
            walker.walk(listener, parser.query())
            return listener.queryRootNode ?: throw InvalidSearchQueryException()
        }
    }
}