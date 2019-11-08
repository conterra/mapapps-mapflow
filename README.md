# mapapps-mapflow
mapapps-mapflow provides a widget for switching between the operational layers of the map.
## Sample App
__t.b.d__

![Screenshot Sample App Mapflow](https://github.com/conterra/mapapps-mapflow/blob/master/screenshot.PNG)

## Installation Guide
**Requirement: map.apps 4.7.2**

1. Add the bundle "dn_mapflow" to your app.
2. Add any map-content (layers) to your app.
3. No further configuration needed.

### Configurable Components of dn_mapflow:
Refer to bundle's readme.md for detailed information.

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
