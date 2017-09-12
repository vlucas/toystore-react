'use strict';

const React = require('react');
const zipObject = require('lodash.zipobject');

/**
 * Subscribes a component to the store to re-render when specified store keys update
 *
 * @param {Object} Toystore instance
 * @param {React.Component} Component - React component to subscribe/re-render
 * @param {String|Array|Object} mapping
 */
function subscribe(store, Component, mapping = null) {
  let defaultMapping;

  if (mapping === null) {
    defaultMapping = store.getAll();
  }

  if (typeof mapping === 'string') {
    mapping = [mapping];
  }

  let isNull = mapping === null;
  let isArray = mapping instanceof Array;

  function getPropKeys() {
    let propKeys = isArray ? mapping : (isNull ? Object.keys(defaultMapping) : Object.keys(mapping));

    return propKeys;
  }

  function getStoreKeys() {
    let propKeys = getPropKeys();
    let storeKeys = isArray ? mapping : (isNull ? propKeys : propKeys.map(k => mapping[k]));

    return storeKeys;
  }

  function getRootKeyIfNested(key) {
    let dotPosition = key.indexOf('.');

    if (dotPosition !== -1) {
      return key.substring(0, dotPosition);
    }

    return key;
  }

  function getMappingForLocalPropNames() {
    let propKeys = getPropKeys();
    let storeKeys = getStoreKeys();

    let mappedPropKeys = isArray ? propKeys.map(getRootKeyIfNested) : propKeys;
    let mappedStoreKeys = isArray ? storeKeys.map(getRootKeyIfNested) : storeKeys;
    let storeValues = store.getAll(mappedStoreKeys);
    let storeValuesMapped = Object.keys(storeValues).map(k => storeValues[k]);
    let toystoreMapping = zipObject(mappedPropKeys, storeValuesMapped);

    return toystoreMapping;
  }

  class ToystoreConnect extends React.Component {
    constructor() {
      super();

      this.state = {
        toystoreMapping: getMappingForLocalPropNames()
      };

      this.updateToystoreMapping = this.updateToystoreMapping.bind(this);
    }

    componentDidMount() {
      store.watch(getStoreKeys(), this.updateToystoreMapping);
    }

    componentWillUnmount() {
      store.unwatch(this.updateToystoreMapping);
    }

    getOriginalComponent() {
      return Component;
    }

    updateToystoreMapping(toystoreMapping) {
      let updatedMapping = getMappingForLocalPropNames();

      this.setState({
        toystoreMapping: updatedMapping
      });
    }

    render() {
      let props = Object.assign({}, this.props, this.state.toystoreMapping);

      return React.createElement(Component, props, this.props.children);
    }
  }

  return ToystoreConnect;
}

module.exports = {
  subscribe,
}
