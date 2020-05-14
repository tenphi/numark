import { has, unescapeMd, replaceEntities, escapeHtml } from './common/utils';

/**
 * Renderer rules cache
 */

var rules = {};

/**
 * Blockquotes
 */

rules.blockquote_open = function(/* tokens, idx, options, env */) {
  return '<nu-blockquote>\n';
};

rules.blockquote_close = function(tokens, idx /*, options, env */) {
  return '</nu-blockquote>' + getBreak(tokens, idx);
};

/**
 * Code
 */

rules.code = function(tokens, idx /*, options, env */) {
  if (tokens[idx].block) {
    return '<nu-code><textarea>' + escapeHtml(tokens[idx].content) + '</textarea></nu-code>' + getBreak(tokens, idx);
  }
  return '<nu-code inline><textarea>' + escapeHtml(tokens[idx].content) + '</textarea></nu-code>';
};

/**
 * Fenced code blocks
 */

rules.fence = function(tokens, idx, options, env, instance) {
  var token = tokens[idx];
  var langClass = '';
  var langPrefix = options.langPrefix;
  var langName = '', fences, fenceName;
  var highlighted;

  if (token.params) {

    //
    // ```foo bar
    //
    // Try custom renderer "foo" first. That will simplify overwrite
    // for diagrams, latex, and any other fenced block with custom look
    //

    fences = token.params.split(/\s+/g);
    fenceName = fences.join(' ');

    if (has(instance.rules.fence_custom, fences[0])) {
      return instance.rules.fence_custom[fences[0]](tokens, idx, options, env, instance);
    }

    langName = escapeHtml(replaceEntities(unescapeMd(fenceName)));
    langClass = ' class="' + langPrefix + langName + '"';
  }

  if (options.highlight) {
    highlighted = options.highlight.apply(options.highlight, [ token.content ].concat(fences))
      || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  return '<nu-code' + langClass + '>'
        + highlighted
        + '</nu-code>'
        + getBreak(tokens, idx);
};

rules.fence_custom = {};

/**
 * Headings
 */

rules.heading_open = function(tokens, idx /*, options, env */) {
  return '<nu-heading level="' + tokens[idx].hLevel + '">';
};
rules.heading_close = function(tokens, idx /*, options, env */) {
  return '</nu-heading>\n';
};

/**
 * Horizontal rules
 */

rules.hr = function(tokens, idx, options /*, env */) {
  return (options.xhtmlOut ? '<hr />' : '<hr>') + getBreak(tokens, idx);
};

/**
 * Bullets
 */

rules.bullet_list_open = function(/* tokens, idx, options, env */) {
  return '<nu-list>\n';
};
rules.bullet_list_close = function(tokens, idx /*, options, env */) {
  return '</nu-list>' + getBreak(tokens, idx);
};

/**
 * List items
 */

rules.list_item_open = function(/* tokens, idx, options, env */) {
  return '<nu-listitem>';
};
rules.list_item_close = function(/* tokens, idx, options, env */) {
  return '</nu-listitem>\n';
};

/**
 * Ordered list items
 */

rules.ordered_list_open = function(tokens, idx /*, options, env */) {
  var token = tokens[idx];
  var order = token.order > 1 ? ' start="' + token.order + '"' : '';
  return '<nu-list enumerate' + order + '>\n';
};
rules.ordered_list_close = function(tokens, idx /*, options, env */) {
  return '</nu-list>' + getBreak(tokens, idx);
};

/**
 * Paragraphs
 */

rules.paragraph_open = function(tokens, idx /*, options, env */) {
  return tokens[idx].tight ? '' : '<nu-block padding="1x 0">';
};
rules.paragraph_close = function(tokens, idx /*, options, env */) {
  var addBreak = !(tokens[idx].tight && idx && tokens[idx - 1].type === 'inline' && !tokens[idx - 1].content);
  return (tokens[idx].tight ? '' : '</nu-block>') + (addBreak ? getBreak(tokens, idx) : '');
};

/**
 * Links
 */

rules.link_open = function(tokens, idx, options /* env */) {
  var title = tokens[idx].title ? (' label="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"') : '';
  var target = options.linkTarget ? (' target="' + options.linkTarget + '"') : '';
  return '<nu-link to="' + (target ? '!' : '') + escapeHtml(tokens[idx].href) + '"' + title + '>';
};
rules.link_close = function(/* tokens, idx, options, env */) {
  return '</nu-link>';
};

/**
 * Images
 */

rules.image = function(tokens, idx, options /*, env */) {
  var src = ' src="' + escapeHtml(tokens[idx].src) + '"';
  var title = tokens[idx].title ? (' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"') : '';
  var alt = ' label="' + (tokens[idx].alt ? escapeHtml(replaceEntities(unescapeMd(tokens[idx].alt))) : '') + '"';
  var suffix = options.xhtmlOut ? ' /' : '';
  return '<nu-img' + src + alt + title + suffix + '>';
};

/**
 * Tables
 */

rules.table_open = function(/* tokens, idx, options, env */) {
  return '<nu-table>\n';
};
rules.table_close = function(/* tokens, idx, options, env */) {
  return '</nu-table>\n';
};
rules.thead_open = function(/* tokens, idx, options, env */) {
  return '<nu-rowgroup>\n';
};
rules.thead_close = function(/* tokens, idx, options, env */) {
  return '</nu-rowgroup>\n';
};
rules.tbody_open = function(/* tokens, idx, options, env */) {
  return '<nu-rowgroup>\n';
};
rules.tbody_close = function(/* tokens, idx, options, env */) {
  return '</nu-rowgroup>\n';
};
rules.tr_open = function(/* tokens, idx, options, env */) {
  return '<nu-row>';
};
rules.tr_close = function(/* tokens, idx, options, env */) {
  return '</nu-row>\n';
};
rules.th_open = function(tokens, idx /*, options, env */) {
  var token = tokens[idx];
  return '<nu-row'
    + (token.align ? ' style="text-align:' + token.align + '"' : '')
    + '>';
};
rules.th_close = function(/* tokens, idx, options, env */) {
  return '</nu-row>';
};
rules.td_open = function(tokens, idx /*, options, env */) {
  var token = tokens[idx];
  return '<nu-cell'
    + (token.align ? ' style="text-align:' + token.align + '"' : '')
    + '>';
};
rules.td_close = function(/* tokens, idx, options, env */) {
  return '</nu-cell>';
};

/**
 * Bold
 */

rules.strong_open = function(/* tokens, idx, options, env */) {
  return '<nu-el text="bolder">';
};
rules.strong_close = function(/* tokens, idx, options, env */) {
  return '</nu-el>';
};

/**
 * Italicize
 */

rules.em_open = function(/* tokens, idx, options, env */) {
  return '<nu-el text="i>';
};
rules.em_close = function(/* tokens, idx, options, env */) {
  return '</nu-el>';
};

/**
 * Strikethrough
 */

rules.del_open = function(/* tokens, idx, options, env */) {
  return '<nu-block theme="deleted">';
};
rules.del_close = function(/* tokens, idx, options, env */) {
  return '</nu-block>';
};

/**
 * Insert
 */

rules.ins_open = function(/* tokens, idx, options, env */) {
  return '<nu-block theme="inserted">';
};
rules.ins_close = function(/* tokens, idx, options, env */) {
  return '</nu-block>';
};

/**
 * Highlight
 */

rules.mark_open = function(/* tokens, idx, options, env */) {
  return '<nu-mark>';
};
rules.mark_close = function(/* tokens, idx, options, env */) {
  return '</nu-mark>';
};

/**
 * Super- and sub-script
 */

rules.sub = function(tokens, idx /*, options, env */) {
  return '<nu-el text="sub">' + escapeHtml(tokens[idx].content) + '</nu-el>';
};
rules.sup = function(tokens, idx /*, options, env */) {
  return '<nu-el text="sup">' + escapeHtml(tokens[idx].content) + '</nu-el>';
};

/**
 * Breaks
 */

rules.hardbreak = function(tokens, idx, options /*, env */) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n';
};
rules.softbreak = function(tokens, idx, options /*, env */) {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
};

/**
 * Text
 */

rules.text = function(tokens, idx /*, options, env */) {
  return escapeHtml(tokens[idx].content);
};

/**
 * Content
 */

rules.htmlblock = function(tokens, idx /*, options, env */) {
  return tokens[idx].content;
};
rules.htmltag = function(tokens, idx /*, options, env */) {
  return tokens[idx].content;
};

/**
 * Abbreviations, initialism
 */

rules.abbr_open = function(tokens, idx /*, options, env */) {
  return '<nu-el text="u"><tooltip>' + escapeHtml(replaceEntities(tokens[idx].title)) + '</tooltip>';
};
rules.abbr_close = function(/* tokens, idx, options, env */) {
  return '</nu-el>';
};

/**
 * Footnotes
 */

rules.footnote_ref = function(tokens, idx) {
  var n = Number(tokens[idx].id + 1).toString();
  var id = 'fnref' + n;
  if (tokens[idx].subId > 0) {
    id += ':' + tokens[idx].subId;
  }
  return '<nu-el text="sup" class="footnote-ref"><nu-link to="#fn' + n + '" id="' + id + '">[' + n + ']</nu-link></nu-el>';
};
rules.footnote_block_open = function(tokens, idx, options) {
  var hr = options.xhtmlOut
    ? '<nu-line class="footnotes-sep" ></nu-line>\n'
    : '<nu-line class="footnotes-sep">\n';
  return hr + '<nu-block class="footnotes">\n<nu-list enumerate class="footnotes-list">\n';
};
rules.footnote_block_close = function() {
  return '</nu-list>\n</nu-block>\n';
};
rules.footnote_open = function(tokens, idx) {
  var id = Number(tokens[idx].id + 1).toString();
  return '<nu-listitem id="fn' + id + '"  class="footnote-item">';
};
rules.footnote_close = function() {
  return '</nu-listitem>\n';
};
rules.footnote_anchor = function(tokens, idx) {
  var n = Number(tokens[idx].id + 1).toString();
  var id = 'fnref' + n;
  if (tokens[idx].subId > 0) {
    id += ':' + tokens[idx].subId;
  }
  return ' <nu-link to="#' + id + '" class="footnote-backref">↩</nu-link>';
};

/**
 * Definition lists
 */

rules.dl_open = function() {
  return '<dl>\n';
};
rules.dt_open = function() {
  return '<dt>';
};
rules.dd_open = function() {
  return '<dd>';
};
rules.dl_close = function() {
  return '</dl>\n';
};
rules.dt_close = function() {
  return '</dt>\n';
};
rules.dd_close = function() {
  return '</dd>\n';
};

/**
 * Helper functions
 */

function nextToken(tokens, idx) {
  if (++idx >= tokens.length - 2) {
    return idx;
  }
  if ((tokens[idx].type === 'paragraph_open' && tokens[idx].tight) &&
      (tokens[idx + 1].type === 'inline' && tokens[idx + 1].content.length === 0) &&
      (tokens[idx + 2].type === 'paragraph_close' && tokens[idx + 2].tight)) {
    return nextToken(tokens, idx + 2);
  }
  return idx;
}

/**
 * Check to see if `\n` is needed before the next token.
 *
 * @param  {Array} `tokens`
 * @param  {Number} `idx`
 * @return {String} Empty string or newline
 * @api private
 */

var getBreak = rules.getBreak = function getBreak(tokens, idx) {
  idx = nextToken(tokens, idx);
  if (idx < tokens.length && tokens[idx].type === 'list_item_close') {
    return '';
  }
  return '\n';
};

export default rules;
