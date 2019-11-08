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
import d_lang from "dojo/_base/lang";
import d_domGeometry from "dojo/dom-geometry";
import templateStringContent from "dojo/text!./templates/MapFlowUI.html";
import _WidgetBase from "dijit/_WidgetBase";
import _TemplatedMixin from "dijit/_TemplatedMixin";
import css from "ct/util/css";
import async from "ct/async";
import _Connect from "ct/_Connect";
import Binding from "apprt-binding/Binding";
import MapCoverUI from "./MapCoverUI";
import DblClickCheck from "./DblClickCheck";
import ContentFlowModule from "./lib/contentflow_src";

const MapFlowUI = declare([_WidgetBase, _TemplatedMixin], {
    templateString: templateStringContent,
    baseClass: "ctMapFlow",
    /**
     * The cover flow lib properties.
     */
    contentFlowProperties: {},
    /**
     * Flag if cover scroll bar should be shown
     */
    showScrollBar: true,
    /**
     * Array of created MapCoverUI covers.
     */
    covers: null,
    i18n: {
        transparency: "Transparency",
        transparencyTooltip: "Change transparency",
        zoomToTooltip: "Zoom to extent of category",
        showDetailsTooltip: "Show detail information",
        rotatorTooltip: "Rotate"
    },
    _setActiveCoverLabelAttr: {
        node: "labelNode",
        type: "innerText"
    },
    activeIndex: 0,
    /*
     * UI representation of the map flow.
     * @constructs
     */
    constructor: function () {
        this._listeners = new _Connect({
            defaultConnectScope: this
        });
        this.covers = [];
        // TODO: Find better way to import/bind
        const {ContentFlowGlobal, ContentFlow} = ContentFlowModule();
        this.ContentFlowGlobal = ContentFlowGlobal;
        this.ContentFlow = ContentFlow;
        this._registerSelfWatches();
    },
    /**
     * Show/hide the scrollbar
     */
    _setShowScrollBarAttr: function (value) {
        this.showScrollBar = value;
        css.switchHidden(this.scrollbarNode, !value);
    },
    /**
     * Show/hide the label
     */
    _setShowLabelAttr: function (value) {
        this.showLabelNode = value;
        css.switchHidden(this.labelNode, !value);
    },
    _registerSelfWatches() {
        this.own(this.watch("activeIndex", this._createActiveLabel.bind(this)));
        this.own(this.watch("activeIndex", () => {
            const cf = this._cf;
            if (!cf) {
                return;
            }
            const currentIndex = cf.getActiveItem().index;
            const targetIndex = this.activeIndex;
            if (currentIndex !== targetIndex) {
                cf.moveToIndex(targetIndex);
            }
        }));
        this.own(this.watch("coverUIs", (name, oldCovers) => {
            this._destroyCoverFlow(oldCovers || []);
            this.coverUIs.forEach((ui) => ui.placeAt(this.itemsNode));
            this._createCoverFlow();
        }));
    },
    startup: function () {
        if (this._started) {
            return;
        }
        this.ContentFlowGlobal.earliestInitTimestamp = this.earliestInitTimestamp ? this.earliestInitTimestamp : 0;
        this.inherited(arguments);
        this._binding = Binding.create()
            .sync("activeIndex")
            .syncToRight("items", "coverUIs", this._buildCoverItems.bind(this));
        this._binding.bindTo(this.covers, this).enable().syncToRightNow();
    },
    _createCoverFlow: function () {
        let cf = this._cf;
        if (!cf) {
            const contentFlowProperties = d_lang.mixin({}, this.contentFlowProperties, {
                onclickActiveItem: DblClickCheck(this._onActiveCoverClick.bind(this),
                    this._onActiveCoverDblClick.bind(this)),
                onMakeActive: this._onMakeCoverActive.bind(this),
                onMakeInactive: this._deactivateActiveCover.bind(this),
                onInit: this._onCoversReady.bind(this),
                onMoveTo: this._onCoverMoveTo.bind(this)
            });
            contentFlowProperties.startItem = this.covers.activeIndex;
            cf = this._cf = new this.ContentFlow(this.contentFlowNode, contentFlowProperties);
            const size = d_domGeometry.getContentBox(this.domNode);
            if (size.w && size.h) {
                cf.init();
            }
        } else {
            this.coverUIs.forEach((cover, i) => cf.addItem(cover.domNode, i));
        }
    },
    _destroyCoverFlow: function (coverUIs) {
        const coversToDestroy = (coverUIs || this.coverUIs);
        coversToDestroy.forEach(this._destroyCover.bind(this));
        if (coversToDestroy === this.coverUIs) {
            this.coverUIs = [];
        }
    },
    _destroyCover: function (cover) {
        const cf = this._cf;
        if (cf && cf.items) {
            cf.rmItem(cf.items.findIndex(c => c.element === cover.domNode));
        }
        cover.destroyRecursive();
    },

    destroy: function destroy() {
        if (!this.destroyed) {
            if (this._coverInFrontTask) {
                this._coverInFrontTask.cancel();
                this._coverInFrontTask = null;
            }
            this._listeners.disconnect();
            this.contentFlowProperties = null;
            this.coverUIs && this.coverUIs.slice(0).forEach((c) => {
                this._destroyCover(c);
            });
            this.coverUIs = [];
            this._cf = null;
            const b = this._binding;
            b && b.unbind();
        }
        this.inherited(arguments);
    },
    _buildCoverItems: function () {
        const covers = this.covers;
        return covers.items.map(this._buildCoverItem, this);
    },
    _buildCoverItem: function (cover) {
        return new MapCoverUI({state: cover});
    },
    _onCoversReady: function () {
        // Method is called if all images are loaded
        this.coversReady = true;
        // Recalculate sizes
        this._cf.resize();
    },
    _onActiveCoverClick: function (coverItem) {
        this._showFrontOfCover(coverItem, false);
    },
    _onActiveCoverDblClick: function (coverItem) {
        this._synchronizeCoverStates(coverItem);
    },
    _onMakeCoverActive: function (coverItem) {
        this.set("activeIndex", coverItem.index);
        this._reactOnCoverInFront(coverItem)
    },
    _onCoverMoveTo: function (coverItem) {
        this._showFrontOfCover(coverItem, true);
    },
    _synchronizeCoverStates: function (coverItem) {
        const cover = this.covers.items[coverItem.index];
        cover.selected = !cover.selected;
        if (this.singleSelectionMode && cover.selected) {
            this.covers.items.forEach((item, index) => {
                if (coverItem.index !== index) {
                    item.selected = false;
                }
            });
        }
    },
    _deactivateActiveCover: function (coverItem) {
        const coverUi = this.coverUIs[coverItem.index];
        if (coverUi) {
            coverUi.set("showFront", true);
            coverUi.set("backside");
        }
        this._reactOnCoverInFront(coverItem);
    },
    _showFrontOfCover(coverItem, show) {
        const coverUi = this.coverUIs[coverItem.index];
        coverUi.set("showFront", show);
        if (!show && !coverUi.get("backSide")) {
            const cover = coverUi.get("state");
            const backSide = this.backsideProvider.getBacksideForCover(cover);
            backSide.on("show-front", () => coverUi.set("showFront", true));
            backSide.on("title-click", () => this._synchronizeCoverStates(coverItem));
            coverUi.set("backside", backSide);
        }
    },
    _reactOnCoverInFront: function (coverItem) {
        if (!coverItem) {
            if (this._coverInFrontTask) {
                this._coverInFrontTask.cancel();
            }
            return;
        }

        const flip = this.autoFlipActiveCover;
        const activate = this.autoEnable;
        const autoZoomTo = this.autoZoomTo;
        const task = this._coverInFrontTask || (this._coverInFrontTask = async.task(function (coverItem) {
            if (flip) {
                this._showFrontOfCover(coverItem, !flip);
            }
            const cover = this.covers.items[coverItem.index];
            if (activate && !cover.selected) {
                this._synchronizeCoverStates(coverItem);
            }
            if (autoZoomTo && cover.selected) {
                const coverUi = this.coverUIs[coverItem.index];
                const backSide = coverUi.get("backSide");
                backSide.emit("zoom-to");
            }
        }, this));
        task.delay(this.reactOnNewFrontCoverTimeout, coverItem);
    },
    _createActiveLabel() {
        const index = this.get("activeIndex");
        const cover = this.covers.items[index];
        this.set("activeCoverLabel", this._createLabel(cover, index));
    },
    _createLabel: function (cover, index) {
        const covers = this.covers;
        const title = (cover && cover.title) || "";
        const length = covers.items.length;
        let indexLabel = String(index + 1);
        const lengthLabel = String(length);
        // Append leading zeros
        const delta = lengthLabel.length - indexLabel.length;
        for (let i = 0; i < delta; ++i) {
            indexLabel = "0" + indexLabel;
        }
        return indexLabel + "/" + lengthLabel + " " + title;
    },
    resize: function (dim) {
        if (dim) {
            d_domGeometry.setMarginBox(this.domNode, dim);
        }
        clearTimeout(this._resizeTimer);
        const resizeTimeout = 100;
        this._resizeTimer = setTimeout(() => {
            const cf = this._cf;
            if (cf) {
                if (!cf.isInit && !cf.isInitializing) {
                    // Initialize the cf if size is bigger zero
                    const size = d_domGeometry.getContentBox(this.domNode);
                    if (size.w && size.h) {
                        cf.init();
                    }
                } else if (this.coversReady) {
                    cf.resize();
                }
            }
        }, resizeTimeout);
    }
});

export default MapFlowUI;
