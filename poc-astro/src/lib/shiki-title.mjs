/**
 * Shiki transformer: ```php title="file.php" puts the file name and the language
 * on the <pre>, the CSS draws the header bar from these attributes.
 */
export function transformerTitle() {
  return {
    name: 'prestaedit:title',
    pre(node) {
      const title = (this.options.meta?.__raw ?? '').match(/title="([^"]+)"/)?.[1];
      if (!title) return;
      node.properties['data-title'] = title;
      // Plain text and unknown languages (smarty…, which fall back to plaintext): no label.
      if (!['plaintext', 'text', 'txt'].includes(this.options.lang)) node.properties['data-lang'] = this.options.lang;
    },
  };
}
