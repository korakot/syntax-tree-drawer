# Syntax Tree Drawer

Interactive syntax tree visualizer with collapsible nodes and smooth animations.

## Features

- Draw hierarchical syntax trees from nested arrays
- Click nodes to collapse/expand subtrees
- Smooth fade animations
- Zero build step - just include via CDN

## Installation

Include the required dependencies in your HTML:

    <script src="https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.0.12/svg.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/korakot/syntax-tree-drawer@1.0.0/syntax-tree-drawer.js"></script>

## Usage

    <div id="my-tree"></div>
    
    var data = ['S',
        ['NP', ['D', 'the'], ['N', 'boy']],
        ['VP', ['V', 'plays'], ['PP', ['P', 'with'], ['NP', 'the', 'ball']]]];
    
    SyntaxTree.draw(data, 'my-tree');

## Configuration

    SyntaxTree.draw(data, 'my-tree', {
        spacing: 20,
        verticalGap: 50,
        animationDuration: 400,
        width: 1000,
        height: 400
    });

## Data Format

Trees are nested arrays. First element is the node label, remaining elements are children.

## License

Apache-2.0

## Author

Created by Korakot Chaovavanich
