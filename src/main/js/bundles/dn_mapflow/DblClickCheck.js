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
function DblClickCheck(clickCb, dblClickCb) {
    let clickCounter = 0;
    let lastClickedItem;
    let timeout;

    const reset = function () {
        lastClickedItem = undefined;
        clearTimeout(timeout);
        timeout = 0;
        clickCounter = 0;
    };

    return function (coverItem) {
        if (!lastClickedItem || lastClickedItem.index !== coverItem.index) {
            reset();
            lastClickedItem = coverItem;
        }
        ++clickCounter;
        if (!timeout) {
            const clickTimeout = 250;
            timeout = setTimeout(() => {
                try {
                    if (clickCounter > 1) {
                        dblClickCb(lastClickedItem);
                    } else {
                        clickCb(lastClickedItem);
                    }
                } finally {
                    reset();
                }
            }, clickTimeout);
        }
    };
}

export default DblClickCheck;
