import * as React from "react";
import { observer } from "mobx-react";

import { formatDateTimeLong } from "shared/util";
import { IActivityLogEntry } from "shared/activity-log";

import { IAppStore } from "instrument/window/history/history";
import { HistoryItem } from "instrument/window/history/item";

////////////////////////////////////////////////////////////////////////////////

@observer
export class RequestHistoryItemComponent extends React.Component<
    {
        historyItem: HistoryItem;
    },
    {}
> {
    render() {
        return (
            <div className="EezStudio_HistoryItem EezStudio_HistoryItem_Request">
                <p>
                    <small className="EezStudio_HistoryItemDate text-muted">
                        {formatDateTimeLong(this.props.historyItem.date)}
                    </small>
                </p>
                {this.props.historyItem.sourceDescriptionElement}
                <pre>{this.props.historyItem.message}</pre>
            </div>
        );
    }
}

export class RequestHistoryItem extends HistoryItem {
    constructor(activityLogEntry: IActivityLogEntry, appStore: IAppStore) {
        super(activityLogEntry, appStore);
    }

    get listItemElement(): JSX.Element | null {
        return <RequestHistoryItemComponent historyItem={this} />;
    }
}
