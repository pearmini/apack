# APack: Alphabet Packing Writing

**APack** is a writing system that explores writing alphabets in a Chinese character style. Instead of placing letters sequentially, APack packs letters for one word into a single grid.

## API Reference

<a href="#ap-render" id="ap-render">#</a> ap.**render**(_content[, options]_)

Renders the given content with optional styling and layout options.

```js
ap.render("hello world");
```

![example-render-content](./output/renderContent.svg)

<a href="#options-size" id="options-size">#</a> options.**size**

Sets the size of the rendered output.

```js
ap.render("hello world", {size: 200});
```

![example-options-size](./output/optionSize.svg)

<a href="#options-font" id="options-font">#</a> options.**font**

Specifies the font to use for rendering.

```js
ap.render("hello world", {font: "astrology"});
```

![example-options-font](./output/optionFont.svg)

<a href="#options-word" id="options-word">#</a> options.**word**

Customizes the word styling.

```js
ap.render("hello world", {
  word: {
    stroke: "red",
    strokeWidth: 3,
    fill: "none",
  },
});
```

![example-options-word](./output/optionWord.svg)

<a href="#options-style" id="options-style">#</a> options.**style**

Configures the overall style of the output.

```js
ap.render("hello world", {
  style: {
    styleBackground: "red",
  },
});
```

![example-options-style](./output/optionStyle.svg)

<a href="#options-grid" id="options-grid">#</a> options.**grid**

Adds and customizes a grid overlay.

```js
ap.render("hello world", {
  grid: {
    stroke: "#ccc",
    fill: "none",
  },
});
```

![example-options-grid](./output/optionGrid.svg)

<a href="#options-padding" id="options-padding">#</a> options.**padding**

Sets the padding around the content.

```js
ap.render("hello world", {padding: 0.2, grid: true});
```

![example-options-padding](./output/optionPadding.svg)
