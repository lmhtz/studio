import { observer } from "mobx-react";
import * as React from "react";

import { objectToClipboardData, loadObject, setClipboardData } from "project-editor/core/store";
import { DragAndDropManager } from "project-editor/core/dd";

import { getPages } from "project-editor/project/features/gui/gui";
import { PageProperties } from "project-editor/project/features/gui/page";
import {
    StoryboardProperties,
    storyboardPageMetaData,
    StoryboardPageProperties
} from "project-editor/project/features/gui/storyboard";

////////////////////////////////////////////////////////////////////////////////

class PageProps {
    page: PageProperties;
    selected: boolean;
    onSelect: () => void;
}

class PageState {
    dragging: boolean;
}

@observer
class Page extends React.Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            dragging: false
        };
    }

    onDragStart(event: any) {
        this.props.onSelect();

        this.setState({
            dragging: true
        });

        let object = loadObject(
            undefined,
            {
                x: 0,
                y: 0,
                page: this.props.page.name
            },
            storyboardPageMetaData
        );

        setClipboardData(event, objectToClipboardData(object));

        event.dataTransfer.effectAllowed = "copy";

        event.dataTransfer.setDragImage(DragAndDropManager.blankDragImage, 0, 0);
    }

    onDragEnd() {
        this.setState({
            dragging: false
        });
    }

    render() {
        let className = "EezStudio_ProjectEditor_page-palette-page";
        if (this.props.selected) {
            className += " selected";
        }
        if (this.state.dragging) {
            className += " dragging";
        }

        return (
            <div
                className={className}
                onClick={this.props.onSelect}
                draggable={true}
                onDragStart={this.onDragStart.bind(this)}
                onDragEnd={this.onDragEnd.bind(this)}
            >
                {this.props.page.name}
            </div>
        );
    }
}

////////////////////////////////////////////////////////////////////////////////

interface PagesPaletteProps {
    storyboard: StoryboardProperties;
}

interface PagesPaletteState {
    selectedPage: PageProperties | undefined;
}

@observer
export class PagesPalette extends React.Component<PagesPaletteProps, PagesPaletteState> {
    constructor(props: PagesPaletteProps) {
        super(props);
        this.state = {
            selectedPage: undefined
        };
    }

    getMissingPages() {
        return getPages().filter(page => {
            return !this.props.storyboard.pages.find(storyboardPage => {
                return (storyboardPage as StoryboardPageProperties).page == page.name;
            });
        });
    }

    onSelect(page: PageProperties) {
        this.setState({
            selectedPage: page
        });
    }

    render() {
        let pages = this.getMissingPages().map(page => {
            return (
                <Page
                    key={page.name}
                    page={page}
                    onSelect={this.onSelect.bind(this, page)}
                    selected={page == this.state.selectedPage}
                />
            );
        });

        return (
            <div tabIndex={0} className="EezStudio_ProjectEditor_page-palette layoutCenter">
                {pages}
            </div>
        );
    }
}
