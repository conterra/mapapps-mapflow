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
module.exports = {
    menu: {
        title: "Map Flow"
    },
    widget: {
        description: "Konfiguration des Map Flows.",
        singleSelectionMode: {
            title: "Einzelne Aktivierung",
            tooltip: "Erlaubt nur ein aktives Karten-Cover."
        },
        autoZoomTo: {
            title: "Auto-Zoom",
            tooltip: "Zoomt automatisch auf den initialen Raumausschnitt des selektierten Covers (wenn verf\u00FCgbar)"
        },
        visibleItems: {
            title: "Sichtbare Karten-Cover",
            tooltip: "Anzahl der sichtbaren Karten-Cover (mind. 3)"
        },
        nodeDepth: {
            title: "Tiefe der Ebenen",
            tooltip: "Tiefe der Ebenen in der Baumstruktur auf der Cover-R\u00FCckseite (mind. 1)"
        },
        showScrollBar: {
            title: "Zeige Scrollbars",
            tooltip: "Zeigt Scrollbars auf der Cover-R\u00FCckseite."
        },
        autoFlipActiveCover: {
            title: "Auto-Flip",
            tooltip: "Zeigt automatisch die Cover-R\u00FCckseite an."
        },
        autoActivate: {
            title: "Automatisches Aktivieren",
            tooltip: "Aktiviert ein Cover automatisch wenn es im Vordergrund ist."
        }
    }
};
