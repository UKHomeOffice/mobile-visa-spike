'use strict';

const allAirports = require('../data/airports.json');
const allStations = require('../data/stations.json');
const allPorts = require('../data/ports.json');
const allCountries = require('../data/nationalities.json');

function mapListEntries(list) {
  return list.map(entry => {
    return {
      label: `notranslate.${entry.name}`,
      value: entry.code ? entry.code + '_' + entry.name : entry.name
    };
  });
}

function addPrependedEmptyOption(list) {
  list.unshift({
    label: 'notranslate.',
    value: ''
  });
  return list;
}

function nationalities(options) {
  const opts = options || {prependEmpty: true};
  let allNationalities = mapListEntries(require('../data/nationalities.json'));
  return opts.prependEmpty ? addPrependedEmptyOption(allNationalities) : allNationalities;
}

function britishAirports(options) {
  const opts = options || {prependEmpty: true};
  let airports = mapListEntries(allAirports.filter(airport => airport.countryCode === 'GBR'));
  return opts.prependEmpty ? addPrependedEmptyOption(airports) : airports;
}

function nonBritishAirports(options) {
  const opts = options || {prependEmpty: true};
  let airports = mapListEntries(allAirports.filter(airport => airport.countryCode !== 'GBR'));
  return opts.prependEmpty ? addPrependedEmptyOption(airports) : airports;
}

function britishPorts(options) {
  const opts = options || {prependEmpty: true};
  let ports = mapListEntries(allPorts.filter(port => port.countryCode === 'GBR'));
  return opts.prependEmpty ? addPrependedEmptyOption(ports) : ports;
}

function nonBritishPorts(options) {
  const opts = options || {prependEmpty: true};
  let ports = mapListEntries(allPorts.filter(port => port.countryCode !== 'GBR'));
  return opts.prependEmpty ? addPrependedEmptyOption(ports) : ports;
}

function britishStations(options) {
  const opts = options || {prependEmpty: true};
  let stations = mapListEntries(allStations.filter(station => station.countryCode === 'GBR'));
  return opts.prependEmpty ? addPrependedEmptyOption(stations) : stations;
}

function nonBritishStations(options) {
  const opts = options || {prependEmpty: true};
  let stations = mapListEntries(allStations.filter(station => station.countryCode !== 'GBR'));
  return opts.prependEmpty ? addPrependedEmptyOption(stations) : stations;
}

module.exports = {
  nationalities: nationalities,
  britishAirports: britishAirports,
  nonBritishAirports: nonBritishAirports,
  britishPorts: britishPorts,
  nonBritishPorts: nonBritishPorts,
  britishStations: britishStations,
  nonBritishStations: nonBritishStations,
  allAirports: allAirports,
  allStations: allStations,
  allPorts: allPorts,
  allCountries: allCountries,
  all: allAirports.concat(allStations).concat(allPorts)
};
