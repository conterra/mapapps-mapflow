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
import {declare} from "apprt-core/Mutable";
import Binding from "apprt-binding/Binding";

const TreeNode = declare({
    id: "",
    title: "",
    layerId: "",
    label: {
        depends: ["title", "layerId"],
        get() {
            return this.title || this.layerId;
        }
    },
    enabled: false,

    depth: 0,
    mayHaveChildren: false,
    children: undefined,
    // The referenced layer
    layer: undefined
});

const SYM_LAYER_BINDING = Symbol("layer_binding");
const SYM_NODE_WATCH = Symbol("layer_watch");
const SYM_LAYERS_WATCH = Symbol("layers_watch");

function getRandomInt() {
    // eslint-disable-next-line no-magic-numbers
    return Math.floor(Math.random() * (10000 - 100)) + 100;
}

function mayHaveChildren(layer) {
    if (layer.layer && !layer.sublayers) {
        // Child of wms or mapserver, but no own children
        return false;
    }
    return layer.sublayers !== undefined || layer.layers !== undefined;
}

function getTreeNodeFromLayer(layer, depth, model) {
    const b = Binding.create()
        .syncAll("title")
        .sync("id", "layerId")
        .sync("visible", "enabled");

    const node = new TreeNode({
        // Ensure unique ids
        id: `_${depth}/${layer.id}_${getRandomInt()}`,
        depth,
        layer,
        mayHaveChildren: mayHaveChildren(layer)
    });
    b.bindTo(layer, node).enable().syncToRightNow();
    node[SYM_LAYER_BINDING] = b;
    node[SYM_NODE_WATCH] = node.watch("*", () => model.onChange(node));
    return node;
}

function cleanup_handle(node, name) {
    const h = node[name];
    h && h.remove && h.remove();
    delete node[name];
}

function cleanup_children(node) {
    (node.children || []).forEach((childNode) => {
        cleanup(childNode);
    });
}

function cleanup(node) {
    cleanup_handle(node, SYM_LAYER_BINDING);
    cleanup_handle(node, SYM_LAYERS_WATCH);
    cleanup_handle(node, SYM_NODE_WATCH);
    cleanup_children(node);
}

class TreeModel {

    constructor(layer, nodeDepth) {
        this.root = getTreeNodeFromLayer(layer, 0, this);
        this.nodeDepth = nodeDepth;
    }

    getRoot(onItem) {
        onItem(this.root);
    }

    getLabel(node) {
        return node.label;
    }

    getChildren(node, onComplete) {
        let children = node.children;
        if (children === undefined) {
            //TODO: watch for child changes
            const layer = node.layer;
            let layerCol = layer.sublayers || layer.layers;
            // Currently suppress WMTS sublayers in toc
            if (layer.type === "wmts") {
                layerCol = undefined;
            }
            if (layerCol) {
                node[SYM_LAYERS_WATCH] = layerCol.on("change", () => {
                    cleanup_children(node);
                    // Reset children
                    node.children = undefined;
                    this.getChildren(node, (children) => this.onChildrenChange(node, children));
                });
                children = layerCol.map((l) => getTreeNodeFromLayer(l, node.depth + 1, this))
                    .reverse()
                    .toArray();
            }
        }
        onComplete(children || []);
    }

    mayHaveChildren(node) {
        if (node.depth >= this.nodeDepth) {
            return false;
        }
        return node.mayHaveChildren;
    }

    getIdentity(node) {
        return node.id;
    }

    // Event for the dijit/Tree
    onChange() {
    }

    // Event for the dijit/Tree
    onChildrenChange() {
    }

    destroy() {
        cleanup(this.root);
    }
}

function TreeModelProvider(nodeDepth) {
    return {
        fromLayer(layer) {
            return new TreeModel(layer, nodeDepth);
        }
    };
}

export default TreeModelProvider;
