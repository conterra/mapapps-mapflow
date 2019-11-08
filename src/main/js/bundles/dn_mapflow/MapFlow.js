/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import declare from "dojo/_base/declare";
import MapFlowUI from "./MapFlowUI";
import MapCoverFactory from "./MapCoverFactory";
import TrackListBackSideProvider from "./TrackListBackSideProvider";

const MapFlow = declare([], {
    _coverCleanup: undefined,
    createInstance: function () {
        return this._mapFlowUI;
    },
    activate: function () {
        const props = this._properties;
        const singleSelectionMode = props.singleSelectionMode;
        const showScrollBar = props.showScrollBar;
        const autoFlipActiveCover = props.autoFlipActiveCover;
        const autoEnable = props.autoEnable || props.autoActivate;
        const autoZoomTo = props.autoZoomTo;
        const reactOnNewFrontCoverTimeout = props.reactOnNewFrontCoverTimeout;
        const contentFlowProperties = props.contentFlowProperties;
        const layersToCovers = MapCoverFactory();
        const {covers, cleanup} = layersToCovers.fromMap(this._mapWidgetModel.get("map"));

        const backsideProvider = TrackListBackSideProvider({
            findLayerById: (id) => this._mapWidgetModel.get("map").layers.items.find(l => l.id === id),
            getMapview: () => this._mapWidgetModel.get("view"),
            nodeDepth: props.nodeDepth,
            coordinateTransformer: this._coordinateTransformer
        });

        this._coverCleanup = cleanup;
        this._mapFlowUI = new MapFlowUI({
            covers,
            backsideProvider,
            contentFlowProperties,
            singleSelectionMode,
            showScrollBar,
            autoFlipActiveCover,
            autoEnable,
            autoZoomTo,
            reactOnNewFrontCoverTimeout
        });

    },
    deactivate: function () {
        const cleanup = this._coverCleanup;
        delete this._coverCleanup;
        cleanup();
    }
});

export default MapFlow;
