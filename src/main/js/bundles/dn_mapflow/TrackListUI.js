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
import d_domclass from "dojo/dom-class";
import templateStringContent from "dojo/text!./templates/TrackListUI.html";
import on from "dojo/on";
import _WidgetBase from "dijit/_WidgetBase";
import _TemplatedMixin from "dijit/_TemplatedMixin";
import popup from "dijit/popup";
import Tree from "dijit/Tree";
import TooltipDialog from "dijit/TooltipDialog";
import Tooltip from "dijit/Tooltip";
import _WidgetsInTemplateMixin from "dijit/_WidgetsInTemplateMixin";
import ct_lang from "ct/_lang";
import css from "ct/util/css";
import async from "ct/async";
import encodeHTML from "apprt-core/string-escape";
import TransparencySlider from "ct/ui/controls/forms/TransparencySlider";

const TrackListUI = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    templateString: templateStringContent,
    baseClass: "ctMapCoverTrackListUI",
    _setTitleAttr: {
        node: "titleNode",
        type: "innerText"
    },
    _setDetailAttr: {
        node: "detailNode",
        type: "innerHTML"
    },
    // The internal tree model
    treeModel: null,
    i18n: {
        transparency: "Transparency",
        transparencyTooltip: "Change transparency",
        zoomToTooltip: "Zoom to extent of category",
        showDetailsTooltip: "Show detail information",
        rotatorTooltip: "Rotate"
    },
    showDelete: false,
    showDetail: false,
    showZoom: false,
    showTransparencySlider: false,

    postCreate: function () {
        this.inherited(arguments);
        this.connect(this.trackList, "onLoad", function () {
            // Show tree
            this.set("showDetail", false);
        });
        const i18n = this.i18n;
        this._createTooltip(i18n.transparencyTooltip, this.sliderNode);
        this._createTooltip(i18n.zoomToTooltip, this.zoomToNode);
        this._createTooltip(i18n.showDetailsTooltip, this.showDetailNode);
        this._createTooltip(i18n.rotatorTooltip, this.rotatorNode);
    },
    _createTooltip: function (text, node) {
        new Tooltip({
            label: text
        }).addTarget(node);
    },
    _setDescriptionAttr: function (desc) {
        css.switchHidden(this.showDetailNode, !desc);
        desc = desc || "";
        desc = this.encodeHTML ? encodeHTML(desc) : desc;
        this.set("detail", desc);
    },
    _getDescriptionAttr: function () {
        return this.get("detail");
    },
    _setShowZoomAttr: function (show) {
        this.showZoom = !!show;
        css.switchHidden(this.zoomToNode, !show);
    },
    _setShowDetailAttr: function (show) {
        this.showDetail = show = !!show;
        css.switchHidden(this.detailNode, !show);
        css.switchHidden(this.trackList.domNode, show);
        css.toggleClass(this.showDetailNode, "ctMapCoverButton--checked", show)
    },
    _setInitialTransparencyAttr: function (t) {
        this.initialTransparency = t;
    },
    _setShowTransparencySliderAttr: function (show) {
        this.showTransparencySlider = !!show;
        css.switchHidden(this.sliderNode, !show);
    },
    _onShowDetailClick: function () {
        this.set("showDetail", !this.get("showDetail"));
    },
    _onNodeClick: function (modelNode) {
        modelNode.set("enabled", !modelNode.get("enabled"));
    },
    _onShowFrontClick: function () {
        this.emit("show-front");
    },
    _onTitleClick: function () {
        this.emit("title-click");
    },
    _onZoomToClick: function () {
        this.emit("zoom-to");
    },
    _onTransparencySliderClick: function () {
        if (this.sliderDialogOpen) {
            this._hideTransparencySlider();
        } else {
            this._showTransparencySlider();
        }
    },
    _createSlider: function () {
        const slider = new TransparencySlider({
            i18n: this.i18n,
            transparency: this.initialTransparency,
            showButtons: false
        });
        this.own(on(slider, "transparencyChange", (value) => {
            this.emit("transparency-change", {
                value
            })
        }));
        return new TooltipDialog({
            content: slider,
            parseOnLoad: false,
            baseClass: "ctTransparencySliderDialog",
            // Only close on focus lost
            onBlur: () => this._hideTransparencySlider(),
            onHide: () => this._hideTransparencySlider()
        });
    },
    _showTransparencySlider: function () {
        if (!this.sliderDialog) {
            this.sliderDialog = this._createSlider();
        }
        popup.open({
            popup: this.sliderDialog,
            around: this.sliderNode,
            // Dummy
            onCancel: () => this._hideTransparencySlider()
        });
        this.sliderDialogOpen = true;
        this.sliderDialog.focus();
    },
    _hideTransparencySlider: function () {
        // On sliderDialog button click, this function gets called twice, to we need a little timeout
        if (this.hideHandle) {
            this.hideHandle.cancel();
        }
        const hideTimeout = 100;
        this.hideHandle = async(function () {
            if (!this.sliderDialogOpen) {
                return;
            }
            this.sliderDialogOpen = false;
            const sliderDialog = this.sliderDialog;
            if (sliderDialog) {
                popup.close(sliderDialog);
                // Set new focus
                this.domNode.focus();
            }
        }, this, hideTimeout);
    },
    _destroyTransparencySlider() {
        this._hideTransparencySlider();
        const sliderDialog = this.sliderDialog;
        if (sliderDialog) {
            sliderDialog.destroyRecursive();
        }
    },
    destroy() {
        this._destroyTransparencySlider();
        const treeModel = this.treeModel;
        treeModel.destroy();
        this.treeModel = null;
        this.inherited(arguments);
    },
    /**
     * This is registered on the dijit.Tree in the template and responsible for converting model items to tree nodes.
     * Works exactly like a "normal" table of contents.
     */
    _createTreeNode: function (/*Object*/ args) {
        const layerNode = args.item;
        const enabled = layerNode.get("enabled");
        const treenode = new Tree._TreeNode(args);
        const domNode = treenode.rowNode;
        d_domclass.add(domNode, "ctTrack");
        css.replaceClass(domNode, "ctSelected", "ctUnselected", enabled);

        const checkAllChildren = function (node, property) {
            const ownState = ct_lang.chk(node.get(property), true);
            const children = node.children;
            if (!ownState || !children || !children.length) { //
                return ownState;
            }
            return children.some((n) => checkAllChildren(n, property));
        };

        const visibleInScale = true; // checkAllChildren(modelNode, "visibleInScale");
        const visibleInExtent = true; // checkAllChildren(modelNode, "visibleInExtent");
        const visibleInSpatialReference = true; // checkAllChildren(modelNode, "visibleInSpatialReference");

        let childrenEnabled = true;
        if (enabled) {
            childrenEnabled = checkAllChildren(layerNode, "enabled");
        }
        css.replaceClass(domNode, "ctVisibleInScale", "ctNotVisibleInScale", visibleInScale);
        css.replaceClass(domNode, "ctVisibleInExtent", "ctNotVisibleInExtent", visibleInExtent);
        css.replaceClass(domNode, "ctVisibleInSpatialReference", "ctNotVisibleInSpatialReference",
            visibleInSpatialReference);
        css.replaceClass(domNode, "ctChildrenEnabled", "ctChildrenDisabled", childrenEnabled);

        // This is called if the model.onChange event is fired
        treenode.connect(treenode, "_updateItemClasses", function (item) {
            css.replaceClass(domNode, "ctSelected", "ctUnselected", item.get("enabled"));
            const visibleInScale = true; //checkAllChildren(item, "visibleInScale");
            const visibleInExtent = true; //checkAllChildren(item, "visibleInExtent");
            css.replaceClass(domNode, "ctVisibleInScale", "ctNotVisibleInScale", visibleInScale);
            css.replaceClass(domNode, "ctVisibleInExtent", "ctNotVisibleInExtent", visibleInExtent);
            css.replaceClass(domNode, "ctVisibleInSpatialReference", "ctNotVisibleInSpatialReference",
                visibleInSpatialReference);
        });
        return treenode;
    }
});
export default TrackListUI;
