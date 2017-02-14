"use strict";
const position_1 = require('./../motion/position');
const vscode = require('vscode');
/**
 * PairMatcher finds the position matching the given character, respecting nested
 * instances of the pair.
 */
class PairMatcher {
    static nextPairedChar(position, charToMatch, closed = true) {
        /**
         * We do a fairly basic implementation that only tracks the state of the type of
         * character you're over and its pair (e.g. "[" and "]"). This is similar to
         * what Vim does.
         *
         * It can't handle strings very well - something like "|( ')' )" where | is the
         * cursor will cause it to go to the ) in the quotes, even though it should skip over it.
         *
         * PRs welcomed! (TODO)
         * Though ideally VSC implements https://github.com/Microsoft/vscode/issues/7177
         */
        const toFind = this.pairings[charToMatch];
        if (toFind === undefined) {
            return undefined;
        }
        let stackHeight = closed ? 0 : 1;
        let matchedPosition = undefined;
        for (const { char, pos } of position_1.Position.IterateDocument(position, toFind.nextMatchIsForward)) {
            if (char === charToMatch) {
                stackHeight++;
            }
            if (char === toFind.match) {
                stackHeight--;
            }
            if (stackHeight === 0) {
                matchedPosition = pos;
                break;
            }
        }
        if (matchedPosition) {
            return matchedPosition;
        }
        // TODO(bell)
        return undefined;
    }
    /**
     * Given a current position, find an immediate following bracket and return the range. If
     * no matching bracket is found immediately following the opening bracket, return undefined.
     */
    static immediateMatchingBracket(currentPosition) {
        // Don't delete bracket unless autoClosingBrackets is set
        if (!vscode.workspace.getConfiguration().get("editor.autoClosingBrackets")) {
            return undefined;
        }
        const deleteRange = new vscode.Range(currentPosition, currentPosition.getLeftThroughLineBreaks());
        const deleteText = vscode.window.activeTextEditor.document.getText(deleteRange);
        let matchRange;
        let isNextMatch = false;
        if ("{[(\"'`".indexOf(deleteText) > -1) {
            const matchPosition = currentPosition.add(new position_1.PositionDiff(0, 1));
            matchRange = new vscode.Range(matchPosition, matchPosition.getLeftThroughLineBreaks());
            isNextMatch = vscode.window.activeTextEditor.document.getText(matchRange) === PairMatcher.pairings[deleteText].match;
        }
        if (isNextMatch && matchRange) {
            return matchRange;
        }
        return undefined;
    }
}
PairMatcher.pairings = {
    "(": { match: ")", nextMatchIsForward: true, matchesWithPercentageMotion: true },
    "{": { match: "}", nextMatchIsForward: true, matchesWithPercentageMotion: true },
    "[": { match: "]", nextMatchIsForward: true, matchesWithPercentageMotion: true },
    ")": { match: "(", nextMatchIsForward: false, matchesWithPercentageMotion: true },
    "}": { match: "{", nextMatchIsForward: false, matchesWithPercentageMotion: true },
    "]": { match: "[", nextMatchIsForward: false, matchesWithPercentageMotion: true },
    // These characters can't be used for "%"-based matching, but are still
    // useful for text objects.
    "<": { match: ">", nextMatchIsForward: true },
    ">": { match: "<", nextMatchIsForward: false },
    // These are useful for deleting closing and opening quotes, but don't seem to negatively
    // affect how text objects such as `ci"` work, which was my worry.
    '"': { match: '"', nextMatchIsForward: true },
    "'": { match: "'", nextMatchIsForward: true },
    "`": { match: "`", nextMatchIsForward: true },
};
exports.PairMatcher = PairMatcher;
//# sourceMappingURL=matcher.js.map