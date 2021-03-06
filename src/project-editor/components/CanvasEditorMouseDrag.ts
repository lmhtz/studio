import { EezObject } from "project-editor/core/metaData";
import { Point, Rect } from "project-editor/core/util";

import {
    SnapLines,
    findClosestHorizontalSnapLinesToPosition,
    findClosestVerticalSnapLinesToPosition
} from "project-editor/components/CanvasEditorSnapLines";
import { TreeNode } from "project-editor/components/CanvasEditorTreeNode";
import { HitRegion } from "project-editor/components/CanvasEditorHitTest";

////////////////////////////////////////////////////////////////////////////////

export interface RubberBandSelection {
    fromPoint: Point;
    rect?: Rect;
}

interface MouseDragNode {
    node: TreeNode;
    nodeRect: Rect;
    object: EezObject;
    objectStartingPosition: Point;
}

export class MouseDrag {
    nodes: MouseDragNode[];
    savedSelectionRect: Rect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    snapLines: SnapLines;

    constructor(public offset: Point, public snapToLines: boolean, public hitRegion: HitRegion) {}

    moveX(rect: Rect, p: Point) {
        let x = p.x + this.offset.x;

        if (this.snapToLines) {
            let lines1 = findClosestVerticalSnapLinesToPosition(this.snapLines, x);
            let lines2 = findClosestVerticalSnapLinesToPosition(this.snapLines, x + rect.width);

            if (lines1 && (!lines2 || lines1.diff <= lines2.diff)) {
                x = lines1.lines[0].pos;
            } else if (lines2) {
                x = lines2.lines[0].pos - rect.width;
            }
        }

        rect.x = x;
    }

    moveY(rect: Rect, p: Point) {
        let y = p.y + this.offset.y;

        if (this.snapToLines) {
            let lines1 = findClosestHorizontalSnapLinesToPosition(this.snapLines, y);
            let lines2 = findClosestHorizontalSnapLinesToPosition(this.snapLines, y + rect.height);

            if (lines1 && (!lines2 || lines1.diff <= lines2.diff)) {
                y = lines1.lines[0].pos;
            } else if (lines2) {
                y = lines2.lines[0].pos - rect.height;
            }
        }

        rect.y = y;
    }

    snapX(x: number) {
        if (this.snapToLines) {
            let lines = findClosestVerticalSnapLinesToPosition(this.snapLines, x);
            return lines ? lines.lines[0].pos : x;
        } else {
            return x;
        }
    }

    snapY(y: number) {
        if (this.snapToLines) {
            let lines = findClosestHorizontalSnapLinesToPosition(this.snapLines, y);
            return lines ? lines.lines[0].pos : y;
        } else {
            return y;
        }
    }

    resizeWest(rect: Rect, p: Point) {
        let x = this.snapX(p.x + this.offset.x);
        let width = this.savedSelectionRect.width + this.savedSelectionRect.x - x;
        if (width < 0) {
            x = this.savedSelectionRect.x + this.savedSelectionRect.width;
            width = 0;
        }
        rect.x = x;
        rect.width = width;
    }

    resizeNorth(rect: Rect, p: Point) {
        let y = this.snapY(p.y + this.offset.y);
        let height = this.savedSelectionRect.height + this.savedSelectionRect.y - y;
        if (height < 0) {
            y = this.savedSelectionRect.y + this.savedSelectionRect.height;
            height = 0;
        }
        rect.y = y;
        rect.height = height;
    }

    resizeEast(rect: Rect, p: Point) {
        let width =
            this.snapX(p.x + this.offset.x + this.savedSelectionRect.width) -
            this.savedSelectionRect.x;
        if (width < 0) {
            width = 0;
        }
        rect.width = width;
    }

    resizeSouth(rect: Rect, p: Point) {
        let height =
            this.snapY(p.y + this.offset.y + this.savedSelectionRect.height) -
            this.savedSelectionRect.y;
        if (height < 0) {
            height = 0;
        }
        rect.height = height;
    }

    move(rect: Rect, p: Point) {
        if (this.hitRegion == HitRegion.INSIDE) {
            this.moveX(rect, p);
            this.moveY(rect, p);
        } else if (this.hitRegion != HitRegion.OUTSIDE) {
            if (this.hitRegion == HitRegion.NW) {
                this.resizeNorth(rect, p);
                this.resizeWest(rect, p);
            } else if (this.hitRegion == HitRegion.N) {
                this.resizeNorth(rect, p);
            } else if (this.hitRegion == HitRegion.NE) {
                this.resizeNorth(rect, p);
                this.resizeEast(rect, p);
            } else if (this.hitRegion == HitRegion.W) {
                this.resizeWest(rect, p);
            } else if (this.hitRegion == HitRegion.E) {
                this.resizeEast(rect, p);
            } else if (this.hitRegion == HitRegion.SW) {
                this.resizeSouth(rect, p);
                this.resizeWest(rect, p);
            } else if (this.hitRegion == HitRegion.S) {
                this.resizeSouth(rect, p);
            } else if (this.hitRegion == HitRegion.SE) {
                this.resizeSouth(rect, p);
                this.resizeEast(rect, p);
            }
        }
    }
}
