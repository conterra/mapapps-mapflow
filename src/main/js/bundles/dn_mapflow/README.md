# mapflow

This bundle provides a widget for switching between the operational layers of the map.
The widget is registered at the component system with the widget role `mapFlow`.

## Usage

No configuration needed! Default values will be applied.

The ID of the tool provided by this bundle is `mapflowToggleTool`.
Adding the tool to a toolset looks like this:

```json
"toolset": {
    "ToolsetManager": {
        "toolsets": [{
            "tools": [
                "mapflowToggleTool"
            ]
        }]
    }
}
```

The UI consists of a carousel displaying different covers (pictures) for each layer.
This carousel can be spun around by clicking or dragging covers with the mouse, dragging a slider beneath it or by scrolling.
Each cover shows a button for displaying additional information (if present) and a button to spin the cover to display the list of available child layers within that layer.
The user can enable and disable each of those child layers individually.
It is also possible to set the transparency of the layers and all its children.

## Configuring the mapflow's look and behavior

All `mapflow` configuration properties are optional.
The following sample shows the default values:

```json
"bundles": {
    "mapflow": {
        "MapFlow": {
            // how many sub-levels of the layer are displayed
            "nodeDepth": 2,
            // show a scroll bar below the covers
            "showScrollBar": true,
            // forbid selection of more than one element at once
            "singleSelectionMode": true,
            // apply fullExtent of selected layer, if available
            "autoZoomTo": false,
            // automatically flip cover if in front
            "autoFlipActiveCover": false,
            // automatically enable cover if in front
            "autoEnable": false,
            // milliseconds to wait before new action (zooming, flipping, activating,...)
            "reactOnNewFrontCoverTimeout": 500
        }
    }
}
```

## Development View

The content flow library is used to provide the basic cover flow interaction mechanisms.
It renders each layer on the first hierarchy level out of the operational layers of the map as a cover with its child layers as selectable tracks.
The selection interaction works on the map and therefore it reacts if the visibility state changes in the map and applies them accordingly.
If a layer provides a `fullExtent` property, a button on the back side of the cover can be used to center on this extent (please refer to property `autoZoomTo`, too).

`mapflow` uses the `apprt-binding/Binding` to react on changes in the map.
All child layers are switched on or off according to their parent.

It is possible to change the transparency of all layers.
An icon is shown in the track list that, when clicked, displays a transparency slider.
The slider works on the `opacity` property on the layers (the user sets transparency, internally it will be transformed to the corresponding opacity value).
When moving the slider the transparency value will be applied automatically to the layer and its children.
 
## Constraints

* The option to change the transparency is not available for feature services.
* If the `MapFlow` widget should be displayed inside a window, the window must be initialized with a fixed size.

## Terms of Use

MIT License for the Content Flow library: [http://www.jacksasylum.eu/ContentFlow/](http://www.jacksasylum.eu/ContentFlow/).