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
module.exports = {
    root: {
        menu: {
            title: "Map Flow"
        },
        widget: {
            description: "Configuration of the Map Flow widget.",
            singleSelectionMode: {
                title: "Single activation",
                tooltip: "Allows only one map cover to be active at a time."
            },
            autoZoomTo: {
                title: "Auto-zoom",
                tooltip: "Automatically zoom to cover's initial extent (if provided) on activation"
            },
            visibleItems: {
                title: "Visible items",
                tooltip: "Number of visible items (min. 3)"
            },
            nodeDepth: {
                title: "Node depth",
                tooltip: "Depth of tree on the cover's back side (min. 1)"
            },
            showScrollBar: {
                title: "Show scrollbars",
                tooltip: "Show scrollbars on cover's back side."
            },
            autoFlipActiveCover: {
                title: "Auto-flip",
                tooltip: "Automatically flip to the backside of the active cover."
            },
            autoActivate: {
                title: "Auto-activate",
                tooltip: "Automatically activate the cover when it is in front."
            }
        }
    },
    "de": true
};
