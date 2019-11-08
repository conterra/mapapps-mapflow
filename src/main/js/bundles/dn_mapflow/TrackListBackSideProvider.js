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
import TrackListUI from "./TrackListUI";
import TrackListTreeModelProvider from "./TrackListTreeModelProvider";

function BacksideProvider({findLayerById, getMapview, nodeDepth, coordinateTransformer}) {
    return {
        getBacksideForCover(cover) {
            const id = cover.id;
            const layer = findLayerById(id);
            const view = getMapview();
            const treeModel = TrackListTreeModelProvider(nodeDepth).fromLayer(layer);
            const maxOpacity = 100;

            const transparency = layer.opacity >= 0 ? ((1 - layer.opacity) * maxOpacity) : null;
            const showSlider = layer.type !== "feature" && transparency !== null;

            const trackListUI = new TrackListUI({
                title: layer.title,
                treeModel: treeModel,
                description: layer.description,
                initialTransparency: transparency,
                showTransparencySlider: showSlider,
                showZoom: !!layer.fullExtent
            });

            trackListUI.on("transparency-change", (evt) => {
                layer.set("opacity", (1 - (evt.value / maxOpacity)));
            });
            trackListUI.on("zoom-to", () => {
                let newExtent = layer.fullExtent;
                if (!newExtent) {
                    return;
                }
                if (coordinateTransformer) {
                    newExtent = coordinateTransformer.transform(newExtent, view.spatialReference.wkid);
                } else {
                    console.warn("MapFlow: No coordinate transformer available -> extent will not be transformed");
                }
                newExtent && view.goTo(newExtent);
            });

            return trackListUI;
        }
    }
}

export default BacksideProvider;
