// syntax-tree-drawer.js
(function(global) {
  'use strict';
  
  const SyntaxTree = {
    config: {
      spacing: 15,
      verticalGap: 40,
      animationDuration: 300,
      width: 800,
      height: 300
    },
    
    draw: function(data, containerId, options = {}) {
      const config = {...this.config, ...options};
      const container = document.getElementById(containerId);
      if (!container) {
        console.error('Container not found:', containerId);
        return;
      }
      
      // Check dependencies
      if (typeof SVG === 'undefined') {
        console.error('SVG.js is required. Include it before syntax-tree-drawer.js');
        return;
      }
      if (typeof anime === 'undefined') {
        console.warn('Anime.js not found. Animations will be disabled.');
      }
      
      const draw = SVG().addTo('#' + containerId).size(config.width, config.height);
      const treeStructure = parseTreeData(data);
      const treeLayout = calculateLayout(treeStructure, draw, config);
      drawTreeNode(treeStructure, treeLayout, draw, config);
    }
  };
  
  // Parse data into tree node structure
  function parseTreeData(data) {
    if (typeof data === 'string') {
      return {label: data, isLeaf: true, children: [], summary: [data]};
    }
    
    const node = {
      label: data[0],
      isLeaf: false,
      children: [],
      summary: []
    };
    
    for (let i = 1; i < data.length; i++) {
      const child = parseTreeData(data[i]);
      node.children.push(child);
      node.summary.push(...child.summary);
    }
    
    return node;
  }
  
  // Calculate layout positions
  function calculateLayout(node, draw, config, x=0, y=0) {
    const layout = {
      x: x,
      y: y,
      headWidth: 0,
      totalWidth: 0,
      nodeCenter: 0,
      childCenters: [],
      childLayouts: []
    };
    
    const tempText = draw.text(node.label);
    layout.headWidth = tempText.bbox().width;
    tempText.remove();
    
    let childX = x;
    for (let i = 0; i < node.children.length; i++) {
      const childLayout = calculateLayout(node.children[i], draw, config, childX, y + config.verticalGap);
      layout.childLayouts.push(childLayout);
      layout.childCenters.push(childLayout.nodeCenter);
      childX += childLayout.totalWidth + config.spacing;
    }
    
    if (node.children.length > 0) {
      layout.totalWidth = childX - x - config.spacing;
      layout.nodeCenter = x + layout.totalWidth / 2;
    } else {
      layout.totalWidth = layout.headWidth;
      layout.nodeCenter = x + layout.headWidth / 2;
    }
    
    return layout;
  }
  
  // Draw tree node
  function drawTreeNode(node, layout, draw, config) {
    const nodeGroup = draw.group();
    
    const headText = draw.text(node.label);
    headText.move(layout.nodeCenter - layout.headWidth/2, layout.y);
    headText.node.firstChild.group = nodeGroup;
    nodeGroup.childGroups = [];
    nodeGroup.summary = node.summary;
    
    if (!node.isLeaf) {
      headText.click(toggleChildren);
      headText.css('cursor', 'pointer');
    }
    nodeGroup.add(headText);
    
    for (let i = 0; i < node.children.length; i++) {
      const childGroup = drawTreeNode(node.children[i], layout.childLayouts[i], draw, config);
      nodeGroup.add(childGroup);
      nodeGroup.childGroups.push(childGroup);
    }
    
    if (!node.isLeaf && node.children.length > 0) {
      const summaryText = draw.text(nodeGroup.summary.join(' '));
      const summaryX = (layout.childCenters[0] + layout.childCenters[layout.childCenters.length-1])/2 - summaryText.bbox().width/2;
      summaryText.move(summaryX, layout.y + config.verticalGap);
      summaryText.hide();
      nodeGroup.sumtext = summaryText;
      nodeGroup.add(summaryText);
    }
    
    for (let i = 0; i < layout.childCenters.length; i++) {
      const line = draw.line(layout.nodeCenter, layout.y+18, layout.childCenters[i], layout.y+38)
        .stroke({width: 1, color:'black'});
      nodeGroup.add(line);
    }
    
    return nodeGroup;
  }
  
  // Toggle animation
  function toggleChildren(e) {
    const group = e.target.group;
    const visible = group.childGroups[0].visible();
    
    if (typeof anime === 'undefined') {
      // Fallback without animation
      for (let g of group.childGroups) {
        visible ? g.hide() : g.show();
      }
      if (group.sumtext) {
        visible ? group.sumtext.show() : group.sumtext.hide();
      }
      return;
    }
    
    if (visible) {
      anime({
        targets: group.childGroups.map(g => g.node),
        opacity: [1, 0],
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => {
          for (let g of group.childGroups) g.hide();
          group.sumtext.show();
          anime({
            targets: group.sumtext.node,
            opacity: [0, 1],
            duration: 300
          });
        }
      });
    } else {
      anime({
        targets: group.sumtext.node,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => {
          group.sumtext.hide();
          for (let g of group.childGroups) g.show();
          anime({
            targets: group.childGroups.map(g => g.node),
            opacity: [0, 1],
            duration: 300
          });
        }
      });
    }
  }
  
  global.SyntaxTree = SyntaxTree;
})(typeof window !== 'undefined' ? window : this);
