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
import assert from "intern/chai!assert";
import md from "module";
import MapCoverFactory from "../MapCoverFactory";
import Layer from "esri/layers/Layer";
import Collection from "esri/core/Collection";
import later from "test-utils/later";

function createFactory() {
    return MapCoverFactory();
}

registerSuite({
    name: md.id,
    "expect layer list is converted to CoverList"() {
        const layers = new Collection();
        layers.add(new Layer({
            visible: true,
            title: "a"
        }));
        layers.add(new Layer({
            visible: false,
            coverImage: "http://example.com/coverimage.png",
            title: "b"
        }));
        const fac = createFactory();
        const {covers} = fac.fromLayerCollection(layers);
        // NOTE: the ordering is reverse!
        assert.equal(covers.items[0].title, "b");
        assert.equal(covers.items[0].selected, false);
        assert.equal(covers.items[0].image, "http://example.com/coverimage.png");
        const expectedLength = 2;
        assert.equal(covers.items.length, expectedLength);
        assert.equal(covers.items[1].title, "a");
        assert.equal(covers.items[1].selected, true);
        assert.equal(covers.items[1].image, undefined);

    },
    "expect a single layers cover relevant attributes are synchronized to cover list"() {
        const layerToTest = new Layer({
            visible: false,
            title: "test",
            coverImage: "http://example.com/coverimage.png"
        });
        const layers = new Collection();
        layers.add(layerToTest);
        const fac = createFactory();
        const {covers} = fac.fromLayerCollection(layers);

        layerToTest.visible = true;
        layerToTest.title = "hello";
        layerToTest.coverImage = "will not work?";

        return later(() => {
            const targetCover = covers.items[0];
            assert.equal(targetCover.title, "hello");
            assert.equal(targetCover.selected, true);
            // Image not synced, because it is not know by Accessor!
            assert.equal(targetCover.image, "http://example.com/coverimage.png");
        });
    },
    "expect first visible cover will be set as activeIndex"() {
        const layers = new Collection();
        layers.add(new Layer({
            visible: false,
            title: "a"
        }));
        layers.add(new Layer({
            visible: false,
            title: "b"
        }));
        layers.add(new Layer({
            visible: true,
            title: "c"
        }));
        const fac = createFactory();
        const {covers} = fac.fromLayerCollection(layers);
        assert.equal(covers.activeIndex, 0);

    },
    "expect another Layer can be added after creation"() {
        const layers = new Collection();
        layers.add(new Layer({
            visible: true,
            title: "a"
        }));
        const fac = createFactory();
        const {covers} = fac.fromLayerCollection(layers);

        assert.equal(covers.items.length, 1);

        layers.add(new Layer({
            visible: false,
            title: "b"
        }));
        // Appended as first layer in mapflow terminology
        const timeout = 1000;
        return later(() => {
            const expectedLength = 2;
            assert.equal(covers.items.length, expectedLength);
            assert.equal(covers.items[0].title, "b");
            assert.equal(covers.items[0].selected, false);
        }, timeout);
    },
    "expect a layer can be removed after creation"() {
        const layers = new Collection();
        layers.add(new Layer({
            visible: true,
            title: "a"
        }));
        layers.add(new Layer({
            visible: false,
            title: "b"
        }));
        layers.add(new Layer({
            visible: false,
            title: "c"
        }));

        const fac = createFactory();
        const {covers} = fac.fromLayerCollection(layers);

        const expectedLength = 3;
        assert.equal(covers.items.length, expectedLength);
        layers.removeAt(1);

        const timeout = 1000;
        return later(() => {
            const expectedReducedLength = 2;
            assert.equal(covers.items.length, expectedReducedLength);
            assert.equal(covers.items[1].title, "a");
            assert.equal(covers.items[0].title, "c");
        }, timeout);
    },
    "expect layer order can be changed after creation"() {
        const layers = new Collection();
        layers.add(new Layer({
            visible: true,
            title: "a"
        }));
        layers.add(new Layer({
            visible: false,
            title: "b"
        }));
        layers.add(new Layer({
            visible: false,
            title: "c"
        }));

        const fac = createFactory();
        const {covers} = fac.fromLayerCollection(layers);

        const expectedLength = 3;
        assert.equal(covers.items.length, expectedLength);
        assert.equal(covers.items[0].title, "c");
        assert.equal(covers.items[1].title, "b");
        assert.equal(covers.items[2].title, "a"); // eslint-disable-line no-magic-numbers
        layers.reorder(layers.getItemAt(0), 2);   // eslint-disable-line no-magic-numbers

        const timeout = 1000;
        return later(() => {
            assert.equal(covers.items.length, expectedLength);
            assert.equal(covers.items[0].title, "a");
            assert.equal(covers.items[1].title, "c");
            assert.equal(covers.items[2].title, "b"); // eslint-disable-line no-magic-numbers
        }, timeout);
    },
    "expect layers marked as hidden are not converted to covers"() {
        const layers = new Collection();
        layers.add(new Layer({
            visible: true,
            title: "a",
            listMode: "hide"
        }));
        layers.add(new Layer({
            visible: false,
            title: "b"
        }));

        const fac = createFactory();
        const {covers} = fac.fromLayerCollection(layers);

        assert.equal(covers.items.length, 1);
        assert.equal(covers.items[0].title, "b");
    }
});
