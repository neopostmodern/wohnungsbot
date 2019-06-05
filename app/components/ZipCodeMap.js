// @flow
import React from 'react';
import { Map, GeoJSON, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { feature } from 'topojson';
import topoData from '../map/berlin-zipcodes-data.topo';
import labels from '../map/labels';

const geoData = feature(topoData, topoData.objects.collection);

const tileUrl =
  'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png';
const tileAttribution = `
  Map tiles by <a href="http://stamen.com">Stamen Design</a>,
  <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> 
  &mdash; Map data &copy; 
  <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`;

const baseStyle = {
  color: 'white',
  weight: 1,
  fillColor: 'navy',
  fillOpacity: 0.2
};

type ZipCodeDescription = {
  id: string
};
type Layer = {
  // eslint-disable-next-line flowtype/no-weak-types
  setStyle: (style: Object) => void,
  // eslint-disable-next-line flowtype/no-weak-types
  on: (eventName: string, callback: (event: any) => void) => void
};

type Props = {
  selectedZipCodes: Array<string>,
  toggleZipCodeSelected: (zipCode: string) => void
};

class ZipCodeMap extends React.Component<Props> {
  props: Props;

  constructor() {
    super();

    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).handle = this.handle.bind(this);
    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).style = this.style.bind(this);
  }

  handle(zipCodeDescription: ZipCodeDescription, layer: Layer) {
    layer.on('mouseover', () => {
      const { selectedZipCodes } = this.props;
      const currentlySelected = selectedZipCodes.includes(
        zipCodeDescription.id
      );
      layer.setStyle({
        fillColor: currentlySelected ? 'darkred' : 'darkgreen',
        fillOpacity: currentlySelected ? 0.3 : 0.4
      });
    });
    layer.on('mouseout', () => {
      layer.setStyle(this.style(zipCodeDescription));
    });
    layer.on('click', () => {
      const { toggleZipCodeSelected } = this.props;
      toggleZipCodeSelected(zipCodeDescription.id);
    });
  }

  style(zipCodeDescription: ZipCodeDescription) {
    const { selectedZipCodes } = this.props;
    const style = Object.assign({}, baseStyle);
    if (selectedZipCodes.includes(zipCodeDescription.id)) {
      Object.assign(style, {
        fillOpacity: 0.8,
        fillColor: 'darkgreen'
      });
    }

    return style;
  }

  render() {
    return (
      <Map
        center={[52.5234051, 13.4113999]}
        zoom={11}
        minZoom={10}
        maxBounds={[[52.3202, 12.924], [52.6805, 13.8249]]}
        style={{ height: 700 }}
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        <GeoJSON
          data={geoData}
          onEachFeature={this.handle}
          style={this.style}
        />

        {labels.map(([name, latitude, longitude]) => (
          <Marker
            position={[latitude, longitude]}
            key={name}
            icon={divIcon({ html: name, className: 'district-label' })}
          />
        ))}
      </Map>
    );
  }
}

export default ZipCodeMap;
