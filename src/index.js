'use strict';

const React = require('react');

/**
 * Subscribes a component to the store to re-render when specified store keys update
 */
function subscribe(store, Component, mapping = null) {
  if (mapping === null) {
    mapping = store.getAll();
  }

  let storeKeys = Object.keys(mapping);
  let toystoreMapping = store.getAll(storeKeys);
  let propKeys = storeKeys.map(k => mapping[k]);

  class ToystoreConnect extends React.Component {
    constructor() {
      super();

      this.state = {
        toystoreMapping
      };

      this.updateToystoreMapping = this.updateToystoreMapping.bind(this);
    }

    componentDidMount() {
      store.watch(storeKeys, this.updateToystoreMapping);
    }

    componentWillUnmount() {
      store.unwatch(this.updateToystoreMapping);
    }

    updateToystoreMapping(toystoreMapping) {
      this.setState({ toystoreMapping });
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
