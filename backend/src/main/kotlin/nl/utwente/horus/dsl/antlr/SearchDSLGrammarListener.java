package nl.utwente.horus.dsl.antlr;
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link SearchDSLGrammarParser}.
 */
public interface SearchDSLGrammarListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link SearchDSLGrammarParser#query}.
	 * @param ctx the parse tree
	 */
	void enterQuery(SearchDSLGrammarParser.QueryContext ctx);
	/**
	 * Exit a parse tree produced by {@link SearchDSLGrammarParser#query}.
	 * @param ctx the parse tree
	 */
	void exitQuery(SearchDSLGrammarParser.QueryContext ctx);
	/**
	 * Enter a parse tree produced by the {@code notExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void enterNotExpr(SearchDSLGrammarParser.NotExprContext ctx);
	/**
	 * Exit a parse tree produced by the {@code notExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void exitNotExpr(SearchDSLGrammarParser.NotExprContext ctx);
	/**
	 * Enter a parse tree produced by the {@code bracketExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void enterBracketExpr(SearchDSLGrammarParser.BracketExprContext ctx);
	/**
	 * Exit a parse tree produced by the {@code bracketExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void exitBracketExpr(SearchDSLGrammarParser.BracketExprContext ctx);
	/**
	 * Enter a parse tree produced by the {@code labelExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void enterLabelExpr(SearchDSLGrammarParser.LabelExprContext ctx);
	/**
	 * Exit a parse tree produced by the {@code labelExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void exitLabelExpr(SearchDSLGrammarParser.LabelExprContext ctx);
	/**
	 * Enter a parse tree produced by the {@code orExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void enterOrExpr(SearchDSLGrammarParser.OrExprContext ctx);
	/**
	 * Exit a parse tree produced by the {@code orExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void exitOrExpr(SearchDSLGrammarParser.OrExprContext ctx);
	/**
	 * Enter a parse tree produced by the {@code andExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void enterAndExpr(SearchDSLGrammarParser.AndExprContext ctx);
	/**
	 * Exit a parse tree produced by the {@code andExpr}
	 * labeled alternative in {@link SearchDSLGrammarParser#expr}.
	 * @param ctx the parse tree
	 */
	void exitAndExpr(SearchDSLGrammarParser.AndExprContext ctx);
}