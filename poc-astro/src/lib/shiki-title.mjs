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
      // Unknown languages (smarty…) fall back to plaintext: no label rather than a wrong one.
      if (this.options.lang !== 'plaintext') node.properties['data-lang'] = this.options.lang;
    },
  };
}
