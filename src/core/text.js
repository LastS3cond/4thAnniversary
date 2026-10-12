/**
 * Undertale 4th Anniversary - Shared text layout
 *
 * One word-wrapping rule for every text box (overworld dialogue, battle box, finale):
 * an explicit '\n' always starts a new line, and longer lines wrap greedily at spaces.
 */
const TextLayout = {
  // Wraps text into lines of at most maxChars characters (a single longer word stays whole).
  wrapLines(text, maxChars) {
    const lines = [];
    for (const line of text.split('\n')) {
      if (line.length <= maxChars) {
        lines.push(line);
        continue;
      }
      let cur = '';
      for (const word of line.split(' ')) {
        if (!cur) {
          cur = word;
        } else if ((cur + ' ' + word).length <= maxChars) {
          cur += ' ' + word;
        } else {
          lines.push(cur);
          cur = word;
        }
      }
      if (cur) lines.push(cur);
    }
    return lines;
  },

  // Wrapped text as a single string.
  wrap(text, maxChars) {
    return TextLayout.wrapLines(text, maxChars).join('\n');
  },

  // Wrapped text split into pages of at most maxLines lines (always at least one page).
  paginate(text, maxChars, maxLines) {
    const lines = TextLayout.wrapLines(text, maxChars);
    const pages = [];
    for (let i = 0; i < lines.length; i += maxLines) {
      pages.push(lines.slice(i, i + maxLines).join('\n'));
    }
    return pages.length > 0 ? pages : [''];
  }
};
