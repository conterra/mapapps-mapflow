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
import Binding from "apprt-binding/Binding";
import CoverList from "./CoverList";
import Cover from "./Cover";

const SYM_LAYER_BINDING = Symbol("layer_binding");

function cleanupCover(cover) {
    const b = cover[SYM_LAYER_BINDING];
    b.unbind();
    delete cover[SYM_LAYER_BINDING];
}

function convertLayerToCover(layer) {
    // todo: need to listen to this property?
    if (layer.listMode === "hide") {
        return;
    }
    //TODO: images are server thumbnails
    /*if (!image && service && /AGS_/.test(service.serviceType)) {
     // support for thumbnails in AGS 10.1, dirty but working...
     image = modelItem.url + "/info/thumbnail";
     }*/

    const b = Binding.create()
        .syncToRight("id")
        .syncToRight("title")
        .syncToRight("coverImage", "image")
        .sync("visible", "selected")
        .enable();
    const cover = new Cover();
    b.bindTo(layer, cover).syncToRightNow();
    cover[SYM_LAYER_BINDING] = b;
    return cover;
}

function convertLayersToCovers(layers) {
    const covers = [];
    layers.forEach((layer) => {
        const cover = convertLayerToCover(layer);
        if (cover) {
            covers.unshift(cover);
        }
    });
    return covers;
}

function updateOnChange(allLayers, list, event) {
    let covers = list.items;
    const removedLayers = event.removed;
    if (removedLayers && removedLayers.length) {
        covers = covers.filter((cover) => {
            const remove = removedLayers.some(layer => cover.id === layer.id);
            if (remove) {
                cleanupCover(cover);
            }
            return !remove;
        });
    }
    const addedLayers = event.added;
    if (addedLayers && addedLayers.length) {
        //TODO: test ordering
        covers = convertLayersToCovers(addedLayers).concat(covers);
    }
    if (event.moved && event.moved.length) {
        const lookup = {};
        covers.forEach((c) => lookup[c.id] = c);
        covers = [];
        allLayers.forEach((l) => {
            const c = lookup[l.id];
            c && covers.unshift(c);
        });
    }
    list.items = covers;
}

function fromLayerCollection(layers) {
    const covers = convertLayersToCovers(layers);
    let list = new CoverList({
        items: covers,
        activeIndex: covers.findIndex((cover) => cover.selected)
    });

    let onChangeHandle = layers.on("change", updateOnChange.bind(this, layers, list));

    return {
        covers: list,
        cleanup: function () {
            onChangeHandle && onChangeHandle.remove();
            onChangeHandle = undefined;
            list.items.forEach(cleanupCover);
            list = undefined;
        }
    };
}

function MapCoverFactory() {
    return {
        fromMap(map, options) {
            return fromLayerCollection(map.layers, options);
        },
        fromLayerCollection
    };
}

export default MapCoverFactory;
