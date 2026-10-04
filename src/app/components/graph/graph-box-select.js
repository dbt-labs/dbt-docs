'use strict';

/**
 * Right-button drag box selection for the lineage graph.
 *
 * Cytoscape's own box selection is bound to the primary button (shift+drag) and
 * is disabled in this app so that plain drags pan. This binds the same idea to
 * the right button instead, through cytoscape's cxt* events: drag with the right
 * button to draw a rectangle, release to select every visible node it touches.
 * Hold shift to add to the current selection. Dragging a selected node with the
 * left button then moves the whole selection, which is cytoscape's default.
 *
 * The node context menu (cytoscape-context-menus) listens to `cxttap`, which
 * cytoscape only emits for a right click without a drag, so the two don't
 * conflict: a right-drag draws, a right-click opens the menu.
 */
module.exports = function enableRightDragBoxSelect(cy) {
    var container = cy.container();
    if (!container) {
        return;
    }

    var box = null;
    var start = null;
    var dragged = false;

    function ensureBox() {
        if (box) {
            return box;
        }
        box = document.createElement('div');
        box.className = 'graph-box-select';
        if (!container.style.position) {
            container.style.position = 'relative';
        }
        container.appendChild(box);
        return box;
    }

    function hideBox() {
        if (box) {
            box.style.display = 'none';
        }
    }

    cy.on('cxttapstart', function(e) {
        // Start anywhere: background, edge or node.
        start = e.renderedPosition;
        dragged = false;
    });

    cy.on('cxtdrag', function(e) {
        if (!start) {
            return;
        }
        var p = e.renderedPosition;
        var b = ensureBox();
        dragged = true;
        b.style.left = Math.min(start.x, p.x) + 'px';
        b.style.top = Math.min(start.y, p.y) + 'px';
        b.style.width = Math.abs(p.x - start.x) + 'px';
        b.style.height = Math.abs(p.y - start.y) + 'px';
        b.style.display = 'block';
    });

    cy.on('cxttapend', function(e) {
        if (!start) {
            return;
        }
        var s = start;
        var p = e.renderedPosition;
        start = null;
        hideBox();
        if (!dragged) {
            return;
        }

        var x1 = Math.min(s.x, p.x), x2 = Math.max(s.x, p.x);
        var y1 = Math.min(s.y, p.y), y2 = Math.max(s.y, p.y);
        if (x2 - x1 < 4 && y2 - y1 < 4) {
            return;
        }

        var hit = cy.nodes().filter(function(n) {
            if (!n.visible()) {
                return false;
            }
            var r = n.renderedBoundingBox({includeLabels: false});
            return r.x1 < x2 && r.x2 > x1 && r.y1 < y2 && r.y2 > y1;
        });

        var additive = !!(e.originalEvent && e.originalEvent.shiftKey);
        cy.batch(function() {
            if (!additive) {
                cy.elements().unselect();
            }
            hit.select();
        });
    });

    cy.on('destroy', function() {
        start = null;
        hideBox();
    });
};
