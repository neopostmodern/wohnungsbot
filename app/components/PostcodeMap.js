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
  color: 'black',
  weight: 1,
  fillColor: 'transparent'
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
type State = {
  height?: number,
  zoom: number
};

class PostcodeMap extends React.Component<Props, State> {
  props: Props;

  state: State;

  heightRef: HTMLElement;

  static initialZoom = 12;

  constructor() {
    super();

    this.state = {
      zoom: PostcodeMap.initialZoom
    };

    /* eslint-disable flowtype/no-weak-types */
    (this: any).eachFeature = this.eachFeature.bind(this);
    (this: any).stylePostcodeOverlay = this.stylePostcodeOverlay.bind(this);
    (this: any).setHeightRef = this.setHeightRef.bind(this);
    (this: any).handleZoom = this.handleZoom.bind(this);
    /* eslint-enable flowtype/no-weak-types */
  }

  componentDidMount() {
    setTimeout(() => this.calculateHeight(), 0);
  }

  eachFeature(postcodeDescription: PostcodeDescription, layer: Layer) {
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
      layer.setStyle(this.stylePostcodeOverlay(postcodeDescription));
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

  stylePostcodeOverlay(postcodeDescription: PostcodeDescription) {
    const { selectedPostcodes } = this.props;

    // SVG CSS is too hard to type
    // eslint-disable-next-line flowtype/no-weak-types
    const style: any = { ...baseStyle };
    if (selectedPostcodes.includes(postcodeDescription.id)) {
      Object.assign(style, {
        fillOpacity: 0.8,
        fillColor: 'darkgreen'
      });
    }

    return style;
  }

  setHeightRef(ref: ?HTMLElement) {
    if (!ref) {
      return;
    }

    this.heightRef = ref;
  }

  calculateHeight() {
    const height = this.heightRef.clientHeight;

    // eslint-disable-next-line react/destructuring-assignment
    if (height !== this.state.height) {
      this.setState({ height });
    }
  }

  handleZoom(zoomEvent: { type: 'zoom', target: { _zoom: number } }) {
    // eslint-disable-next-line no-underscore-dangle
    this.setState({ zoom: zoomEvent.target._zoom });
  }

  render() {
    const { height, zoom } = this.state;

    return (
      <div
        style={{ height: '100%' }}
        ref={this.setHeightRef}
        className={`zoom-${zoom}`}
        data-type="map"
      >
        {height ? (
          <Map
            center={[52.5234051, 13.4113999]}
            zoom={PostcodeMap.initialZoom}
            minZoom={10}
            maxZoom={16}
            maxBounds={[[52.3202, 12.924], [52.6805, 13.8249]]}
            style={{ height }}
            onZoom={this.handleZoom}
          >
            <TileLayer url={tileUrl} attribution={tileAttribution} />
            <GeoJSON
              data={geoData}
              onEachFeature={this.eachFeature}
              style={this.stylePostcodeOverlay}
            />

            {labels.map(([name, latitude, longitude]) => (
              <Marker
                position={[latitude, longitude]}
                key={name}
                icon={divIcon({ html: name, className: 'district-label' })}
              />
            ))}
          </Map>
        ) : null}
      </div>
    );
  }
}

export default PostcodeMap;
