// @flow
import React from 'react';
import { Map, GeoJSON, TileLayer, Marker } from 'react-leaflet';
import { divIcon, type Layer } from 'leaflet';
import { feature } from 'topojson';
import topoData from '../map/berlin-postcodes-data.topo';
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

type PostcodeDescription = {
  id: string,
  properties: {
    name: string,
    district: string
  }
};

type Props = {
  selectedPostcodes: Array<string>,
  togglePostcodeSelected: (postcode: string) => void
};

class PostcodeMap extends React.Component<Props> {
  props: Props;

  constructor() {
    super();

    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).handle = this.handle.bind(this);
    // eslint-disable-next-line flowtype/no-weak-types
    (this: any).style = this.style.bind(this);
  }

  handle(postcodeDescription: PostcodeDescription, layer: Layer) {
    layer.on('mouseover', () => {
      const { selectedPostcodes } = this.props;
      const currentlySelected = selectedPostcodes.includes(
        postcodeDescription.id
      );
      layer.setStyle({
        fillColor: currentlySelected ? 'darkred' : 'darkgreen',
        fillOpacity: currentlySelected ? 0.3 : 0.4
      });
    });
    layer.on('mouseout', () => {
      layer.setStyle(this.style(postcodeDescription));
    });
    layer.on('click', () => {
      const { togglePostcodeSelected } = this.props;
      togglePostcodeSelected(postcodeDescription.id);
    });
    layer.bindTooltip(
      `${postcodeDescription.id}
<div class="map-tooltip-name">${postcodeDescription.properties.name}</div>
${postcodeDescription.properties.district}`,
      {
        sticky: true,
        className: 'map-tooltip',
        offset: [30, 0],
        direction: 'right'
      }
    );
  }

  style(postcodeDescription: PostcodeDescription) {
    const { selectedPostcodes } = this.props;
    const style = Object.assign({}, baseStyle);
    if (selectedPostcodes.includes(postcodeDescription.id)) {
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

export default PostcodeMap;
