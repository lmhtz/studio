import * as React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";

import { formatDateTimeLong } from "shared/util";
import { IActivityLogEntry } from "shared/activity-log";

import { getConnectionParametersInfo } from "instrument/window/connection";

import { IAppStore } from "instrument/window/history/history";
import { HistoryItem } from "instrument/window/history/item";

////////////////////////////////////////////////////////////////////////////////

@observer
export class ConnectedHistoryItemComponent extends React.Component<
    {
        historyItem: HistoryItem;
    },
    {}
> {
    @computed
    get message(): {
        connectionParameters?: any;
        sessionName?: string;
    } {
        if (!this.props.historyItem.message) {
            return {};
        }

        try {
            return JSON.parse(this.props.historyItem.message);
        } catch (err) {
            return {
                sessionName: this.props.historyItem.message
            };
        }
    }

    render() {
        return (
            <div className="EezStudio_HistoryItem EezStudio_HistoryItem_Connected">
                <p>
                    <small className="EezStudio_HistoryItemDate text-muted">
                        {formatDateTimeLong(this.props.historyItem.date)}
                    </small>
                    <span>
                        CONNECTED
                        {this.message.connectionParameters
                            ? " to " +
                              getConnectionParametersInfo(this.message.connectionParameters)
                            : ""}
                    </span>
                </p>
                {this.props.historyItem.sourceDescriptionElement}
            </div>
        );
    }
}

export class ConnectedHistoryItem extends HistoryItem {
    constructor(activityLogEntry: IActivityLogEntry, appStore: IAppStore) {
        super(activityLogEntry, appStore);
    }

    get listItemElement(): JSX.Element | null {
        return <ConnectedHistoryItemComponent historyItem={this} />;
    }
}
