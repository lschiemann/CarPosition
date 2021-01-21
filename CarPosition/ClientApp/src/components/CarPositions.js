import React, { Component, useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, MapConsumer } from 'react-leaflet';
import { Row, Col } from 'reactstrap';
import leaflet from 'leaflet';
import * as esri from 'esri-leaflet-geocoder';
import selectedIcon from './marker-icon-gold.png';
import defaultIcon from './marker-icon-grey.png';
import shadowIcon from './marker-shadow.png';

function PositionMarker(props) {
  const { isSelected, position, onClick } = props;
  const ref = useRef(null);

  useEffect(() => {
    //opens popup if selected via table
    if (isSelected && !ref.current.isPopupOpen()) {
      ref.current.openPopup();
    }
  });

  //set selected marker if needed
  const iconUrl = isSelected
    ? selectedIcon
    : defaultIcon;

  const { iconSize, iconAnchor, popupAnchor, shadowSize, shadowAnchor } = leaflet.Icon.Default.prototype.options;
  const icon = leaflet.icon({
    iconUrl: iconUrl,
    iconAnchor: iconAnchor,
    iconSize: iconSize,
    shadowUrl: shadowIcon,
    shadowAnchor: shadowAnchor,
    shadowSize: shadowSize,
    popupAnchor: popupAnchor
  });

  //bringing selected marker to front if needed
  const zIndex = isSelected
    ? 1000
    : 0;

  return (
    <Marker
      ref={ref}
      position={position}
      icon={icon}
      zIndexOffset={zIndex}
      eventHandlers={{
        click: onClick
      }}>
      <Popup>
        <h4>{position.unit}</h4>
        <p>{position.milage}</p>
        <p>{position.date}</p>
        <p>{position.address}</p>
      </Popup>
    </Marker>
  );
}

function PositionEntry(props) {
  const { isSelected, position, onClick } = props;
  return (
    <tr
      id={position.id}
      className={isSelected ? 'table-active' : ''}
      onClick={onClick}>
      <td>{position.unit}</td>
      <td>{position.milage}</td>
      <td>{position.date}</td>
      <td>{position.address}</td>
    </tr>
  );
}

export class CarPositions extends Component {
  static displayName = CarPositions.name;

  constructor(props) {
    super(props);
    this.state = {
      positions: [],
      loading: true,
      selectedPosition: null
    };
  }

  componentDidMount() {
    this.populatePositionData();
  }

  renderPositionsTable(positions) {
    return (
      <div>
        <table className='table table-hover header-fixed'>
          <thead>
            <tr>
              <th>Unit</th>
              <th>Milage</th>
              <th>GPS Timestamp</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(p =>
              <PositionEntry
                key={p.id}
                onClick={() => this.selectPosition(p)}
                position={p}
                isSelected={this.getIsSelected(p)}
              />
            )}
          </tbody>
        </table>
      </div>
    );
  }

  selectPosition(position) {
    this.setState({ selectedPosition: position });
  }

  getIsSelected(position) {
    return this.state.selectedPosition === position;
  }

  renderPositionsMap(positions) {
    return (
      <MapContainer scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {positions.map(p =>
          <PositionMarker
            key={p.id}
            onClick={() => this.selectPosition(p)}
            position={p}
            isSelected={this.getIsSelected(p)}
          />
        )}

        <MapConsumer>
          {(map) => {
            !this.state.selectedPosition
              ? setMapViewToAllPositions()
              : setMapViewToOnePosition(this.state.selectedPosition);
            return null;

            function setMapViewToAllPositions() {
              const markers = positions.map(p => leaflet.marker(p));
              const bounds = leaflet.featureGroup(markers).getBounds();
              map.fitBounds(bounds);
            }

            function setMapViewToOnePosition(selectedPosition) {
              map.setView(selectedPosition);
              scrollTableToSelectedElementIfNeeded();

              function scrollTableToSelectedElementIfNeeded() {
                var el = document.getElementById(selectedPosition.id)
                var rect = el.getBoundingClientRect();
                var elemTop = rect.top;
                var elemBottom = rect.bottom;

                var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);

                if (!isVisible) {
                  el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                }
              }
            }
          }}
        </MapConsumer>
      </MapContainer>
    );
  }

  render() {
    const { loading, positions } = this.state;
    let table, map;

    if (loading) {
      table = <p><em>Loading...</em></p>
    }
    else {
      table = this.renderPositionsTable(positions);
      map = this.renderPositionsMap(positions);
    }

    return (
      <Row>
        <Col>{table}</Col>
        <Col>{map}</Col>
      </Row>
    );
  }

  async populatePositionData() {
    const response = await fetch('position');
    const data = await response.json();

    data.forEach(p => {
      p.date = new Date(Date.parse(p.gpsTimestamp)).toDateString();
    });

    this.setState({
      positions: data,
      loading: false,
      selectedPosition: null
    });

    await Promise.all(data.map(reverseGeocode))

    this.setState({
      positions: data.slice()
    });

    function reverseGeocode(position) {
      return new Promise((resolve) => {
        esri.geocodeService().reverse({ useCors: false }).latlng(leaflet.latLng(position)).run((err, response) => {
          let ads;
          if (err) {
            data.forEach(af => {
              const { lat, lng, address } = af;
              if (lat === position.lat && lng === position.lng && ads) {
                ads = address;
                return;
              }
            });
          }
          else {
            ads = response.address;
          }

          if (ads) {
            position.address = ads.LongLabel;
          }
          resolve();
        });      
      });
    }
  }
}