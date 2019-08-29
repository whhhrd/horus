package nl.utwente.horus.dsl

import nl.utwente.horus.dsl.antlr.SearchDSLGrammarBaseListener
import nl.utwente.horus.dsl.antlr.SearchDSLGrammarLexer
import nl.utwente.horus.dsl.antlr.SearchDSLGrammarParser
import nl.utwente.horus.entities.group.LabelFilterOperator
import nl.utwente.horus.representations.dsl.LabelQueryNodeDto
import nl.utwente.horus.representations.dsl.OperatorQueryNodeDto
import nl.utwente.horus.representations.dsl.QueryNodeDto
import org.antlr.v4.runtime.tree.ErrorNode
import org.antlr.v4.runtime.tree.TerminalNode
import java.util.*

class SearchDSLToQueryNodeListener: SearchDSLGrammarBaseListener() {
    /**
     * Data structure to keep track of children operators and labels.
     * New empty lists are pushed to the stack when a nested expression is entered.
     * All children of this operation (e.g. the expressions to which this operation is applied) are then added to the
     * LinkedList, which is popped once all children have been evaluated (exit-methods).
     */
    private val queryStack = Stack<LinkedList<QueryNodeDto>>()
    var queryRootNode: QueryNodeDto? = null
        private set
    val errors = LinkedList<ErrorNode>()

    override fun enterQuery(ctx: SearchDSLGrammarParser.QueryContext?) {
        enterExpr()
    }

    override fun exitQuery(ctx: SearchDSLGrammarParser.QueryContext?) {
        if (queryStack.peek().isNotEmpty()) {
            queryRootNode = queryStack.pop().first
        }
    }

    override fun enterNotExpr(ctx: SearchDSLGrammarParser.NotExprContext?) {
        enterExpr()
    }

    override fun exitNotExpr(ctx: SearchDSLGrammarParser.NotExprContext?) {
        exitOpExpr(LabelFilterOperator.NOT)
    }

    override fun enterOrExpr(ctx: SearchDSLGrammarParser.OrExprContext?) {
        enterExpr()
    }

    override fun exitOrExpr(ctx: SearchDSLGrammarParser.OrExprContext?) {
        exitOpExpr(LabelFilterOperator.OR)
    }

    override fun enterAndExpr(ctx: SearchDSLGrammarParser.AndExprContext?) {
        enterExpr()
    }

    override fun exitAndExpr(ctx: SearchDSLGrammarParser.AndExprContext?) {
        exitOpExpr(LabelFilterOperator.AND)
    }

    override fun visitTerminal(node: TerminalNode?) {
        if (node != null && node.symbol.type == SearchDSLGrammarLexer.LABEL) {
            queryStack.peek().push(LabelQueryNodeDto(node.symbol.text.toLong()))
        }
    }

    override fun visitErrorNode(node: ErrorNode?) {
        if (node != null) {
            println(node.text)
            errors.push(node)
        }
    }

    private fun enterExpr() {
        queryStack.push(LinkedList())
    }

    private fun exitOpExpr(op: LabelFilterOperator) {
        val children = queryStack.pop()
        val opQueryNode = OperatorQueryNodeDto(op, children)
        queryStack.peek().push(opQueryNode)
    }
}
