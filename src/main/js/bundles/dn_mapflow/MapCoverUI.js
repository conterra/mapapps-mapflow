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
import require from "require";
import declare from "dojo/_base/declare";
import d_kernel from "dojo/_base/kernel";
import d_domevent from "dojo/_base/event";
import templateStringContent from "dojo/text!./templates/MapCoverUI.html";
import on from "dojo/on";
import _WidgetBase from "dijit/_WidgetBase";
import _TemplatedMixin from "dijit/_TemplatedMixin";
import css from "ct/util/css";
import Binding from "apprt-binding/Binding";

function stopEvent(evt) {
    d_domevent.fix(evt).stopPropagation();
}

function blockEventBubbelling(node) {
    // Block mouse wheel bubbeling up to cover flow if backside is shown
    return on(node, (d_kernel.isFF ? 'DOMMouseScroll' : "mousewheel") + ",click,mousedown,mouseup,mousemove",
        stopEvent);
}

/**
 * @fileOverview this class represents a single map cover.
 */
const MapCoverWidgetUI = declare([_WidgetBase, _TemplatedMixin], {
    templateString: templateStringContent,
    baseClass: "ctMapCover",
    /**
     * Show front state
     */
    showFront: true,
    /**
     * Selected state
     */
    selected: false,
    /**
     * The back cover side widget, can be set/unset
     */
    backSide: null,

    defaultImage: require.toUrl("./styles/images/defaultCover.png"),
    // ./Cover
    state: null,
    /**
     * Representation of a cover in the map flow.
     * It has no associated logic and encapsulates only some layout.
     * @constructs
     */
    constructor: function () {
    },
    postCreate: function postCreate() {
        this.inherited(arguments);
        this._bindToState();
        this.own(blockEventBubbelling(this.backNode));
    },
    _bindToState: function () {
        const state = this.state;
        this.set({
            width: 267,
            height: 159
        });
        const b = this._binding = Binding.create()
            .syncToRight("selected")
            .syncToRight("image", "imageUrl", (url) => url || this.defaultImage);
        b.bindTo(state, this).enable().syncToRightNow();
    },
    _setImageUrlAttr: {
        node: "imageNode",
        attribute: "src",
        type: "attribute"
    },
    _setWidthAttr: {
        node: "imageNode",
        attribute: "width",
        type: "attribute"
    },
    _setHeightAttr: {
        node: "imageNode",
        attribute: "height",
        type: "attribute"
    },
    _setSelectedAttr: function (value) {
        const selected = this.selected = !!value;
        css.toggleClass(this.domNode, "ctSelectedTheme", selected);
    },
    _setShowFrontAttr: function (showFront) {
        this.showFront = showFront = !!showFront;
        css.toggleClass(this.domNode, "ctMapCoverRotated", !showFront);
        css.switchHidden(this.backNode, showFront);
    },
    _setBacksideAttr: function (backSide) {
        const old = this.backSide;
        const backNode = this.backNode;
        this.backSide = backSide;
        if (old !== backSide) {
            if (old) {
                backNode.removeChild(old.domNode);
                old.destroyRecursive();
            }
            if (backSide) {
                backSide.placeAt(backNode).startup();
            }
        }
    },
    destroy: function () {
        const b = this._binding;
        b && b.unbind();
        const backSide = this.backSide;
        if (backSide) {
            backSide.destroyRecursive();
            this.backSide = null;
        }
        this.inherited(arguments);
    }
});
export default MapCoverWidgetUI;
