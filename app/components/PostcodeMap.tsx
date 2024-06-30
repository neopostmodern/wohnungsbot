import React from 'react';
/* eslint-disable import/no-unresolved */
/// <reference path="../../node_modules/react-leaflet/lib/index.d.ts" />
// @ts-ignore
import { MapContainer } from 'react-leaflet/MapContainer';
// @ts-ignore
import { GeoJSON } from 'react-leaflet/GeoJSON';
// @ts-ignore
import { TileLayer } from 'react-leaflet/TileLayer';
// @ts-ignore
import { Marker } from 'react-leaflet/Marker';
// @ts-ignore
import { useMapEvent } from 'react-leaflet/hooks';
/* eslint-enable import/no-unresolved */
import { FeatureGroup } from 'leaflet';
import { divIcon } from 'leaflet';
import { feature } from 'topojson';
import topoData from '../map/berlin-postcodes-data.topo.json';
import labels from '../map/labels.json';
import keys from '../constants/keys.json';

const geoData = feature(topoData as any, topoData.objects.collection as any);
const tileUrl = `https://tiles-eu.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg?api_key=${keys.STADIAMAPS_API_KEY}`;
const tileAttribution = `+© <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>
© <a href="https://stamen.com/" target="_blank">Stamen Design</a>
© <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a>
© <a href="https://www.openstreetmap.org/about/" target="_blank">OpenStreetMap contributors</a>
`;
const baseStyle = {
  color: 'black',
  weight: 1,
  fillColor: 'transparent'
};
type PostcodeDescription = {
  id: string;
  properties: {
    name: string;
    district: string;
  };
};

function ZoomLevelListener({
  onZoomChange
}: {
  onZoomChange: (zoomLevel: number) => void;
}) {
  const map = useMapEvent('zoom', () => {
    onZoomChange(map.getZoom());
  });
  return null;
}

type Props = {
  selectedPostcodes: Array<string>;
  togglePostcodeSelected: (postcode: string) => void;
};
type State = {
  height?: number;
  zoom: number;
};

class PostcodeMap extends React.Component<Props, State> {
  static initialZoom: number = 12;

  props: Props;

  state: State;

  heightRef: HTMLElement;

  constructor(props) {
    super(props);
    this.state = {
      zoom: PostcodeMap.initialZoom
    };

    (this as any).eachFeature = this.eachFeature.bind(this);
    (this as any).stylePostcodeOverlay = this.stylePostcodeOverlay.bind(this);
    (this as any).setHeightRef = this.setHeightRef.bind(this);
    (this as any).handleZoom = this.handleZoom.bind(this);
  }

  componentDidMount() {
    setTimeout(() => this.calculateHeight(), 0);
  }

  handleZoom(zoom) {
    this.setState({
      zoom
    });
  }

  setHeightRef(ref: HTMLElement | null | undefined) {
    if (!ref) {
      return;
    }

    this.heightRef = ref;
  }

  stylePostcodeOverlay(postcodeDescription: PostcodeDescription) {
    const { selectedPostcodes } = this.props;
    // SVG CSS is too hard to type
    const style: any = { ...baseStyle };

    if (selectedPostcodes.includes(postcodeDescription.id)) {
      Object.assign(style, {
        fillOpacity: 0.8,
        fillColor: 'darkgreen'
      });
    }

    return style;
  }

  eachFeature(
    postcodeDescription: PostcodeDescription,
    featureGroup: FeatureGroup
  ) {
    featureGroup.on('mouseover', () => {
      const { selectedPostcodes } = this.props;
      const currentlySelected = selectedPostcodes.includes(
        postcodeDescription.id
      );
      featureGroup.setStyle({
        fillColor: currentlySelected ? 'darkred' : 'darkgreen',
        fillOpacity: currentlySelected ? 0.3 : 0.4
      });
    });
    featureGroup.on('mouseout', () => {
      featureGroup.setStyle(this.stylePostcodeOverlay(postcodeDescription));
    });
    featureGroup.on('click', () => {
      const { togglePostcodeSelected } = this.props;
      togglePostcodeSelected(postcodeDescription.id);
    });
    featureGroup.bindTooltip(
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

  calculateHeight() {
    const height = this.heightRef.clientHeight;

    // eslint-disable-next-line react/destructuring-assignment
    if (height !== this.state.height) {
      this.setState({
        height
      });
    }
  }

  render() {
    const { height, zoom } = this.state;
    return (
      <div
        style={{
          height: '100%'
        }}
        ref={this.setHeightRef}
        className={`zoom-${zoom}`}
        data-type="map"
      >
        {height ? (
          <MapContainer
            center={[52.5234051, 13.4113999]}
            zoom={PostcodeMap.initialZoom}
            minZoom={10}
            maxZoom={16}
            maxBounds={[
              [52.3202, 12.924],
              [52.6805, 13.8249]
            ]}
            style={{
              height
            }}
          >
            <ZoomLevelListener onZoomChange={this.handleZoom} />
            <TileLayer url={tileUrl} attribution={tileAttribution} />
            <GeoJSON
              data={geoData}
              onEachFeature={this.eachFeature}
              style={this.stylePostcodeOverlay}
            />

            {(labels as Array<[string, number, number]>).map(
              ([name, latitude, longitude]) => (
                <Marker
                  position={[latitude, longitude]}
                  key={name}
                  icon={divIcon({
                    html: name,
                    className: 'district-label'
                  })}
                />
              )
            )}
          </MapContainer>
        ) : null}
      </div>
    );
  }
}

export default PostcodeMap;
