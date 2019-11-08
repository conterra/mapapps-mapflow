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
import registerSuite from "intern!object";
import require from "require";
import md from "module";
import MapFlowUI from "../MapFlowUI";
import CoverList from "../CoverList";
import Cover from "../Cover";
import uitest from "uitest-support/uitest";
import TrackListBacksideProvider from "../TrackListBackSideProvider";
import MapImageLayer from "esri/layers/MapImageLayer";

const uit = uitest();

registerSuite({
    name: md.id,
    "expect MapFlowUI can be created from CoverList"() {

        const covers = new CoverList({
            activeIndex: 0,
            items: [
                new Cover({
                    id: 1,
                    title: "a",
                    image: require.toUrl("./plants.png")
                }),
                new Cover({
                    id: 2,
                    selected: true,
                    title: "b"
                }),
                new Cover({
                    id: 3,
                    title: "c"
                })
            ]
        });

        const timeout = 1000;
        setTimeout(() => {
            covers.activeIndex = 2;
            const innerTimeout = 1500;
            setTimeout(() => {
                covers.items = covers.items.concat([new Cover({
                    id: 4,
                    title: "d"
                })]);
            }, innerTimeout);
        }, timeout);


        const widget = new MapFlowUI({
            covers,
            backsideProvider: TrackListBacksideProvider(
                id => new MapImageLayer({
                    url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer",
                    title: "hello " + id,
                    description: "lorem ipsum " + id,
                    opacity: 1,
                    sublayers: [
                        {
                            "id": 0,
                            "definitionExpression": "pop2000 > 4000000"
                        },
                        {
                            "id": 1
                        },
                        {
                            "id": 2,
                            "legendEnabled": false
                        },
                        {
                            "id": 3,
                            "visible": false
                        }
                    ]
                })
            )
        });
        return uit.getAttachNode().then(function (node) {
            widget.placeAt(node).startup();
            //TODO: check dom node state
        });
    }
});
