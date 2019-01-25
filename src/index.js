'use strict';

/**
 * Create object with provided arrays of keys and values
 *
 * @param {String[]} keys
 * @param {Array} values
 */
function zipObject(keys, values) {
  return keys.reduce(function(object, currentValue, currentIndex) {
    object[currentValue] = values[currentIndex];

    return object;
  }, {});
}

/**
 * Create binding
 */
function createBinding(React) {
  const createElement = React.createElement || React.h;
  const Component = React.Component;

  /**
   * Subscribes a component to the store to re-render when specified store keys update
   *
   * @param {Object} Toystore instance
   * @param {React.Component} OriginalComponent - React component to subscribe/re-render
   * @param {String|Array|Object} mapping
   * @param {Object} options Toystore watch options
   * @param {Number} options.priority value used to determine the order watchers are called
   */
  function subscribe(store, OriginalComponent, mapping = null, options) {
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

    class ToystoreConnect extends Component {
      constructor() {
        super();

        this.state = {
          toystoreMapping: getMappingForLocalPropNames(),
        };

        this._isMounted = false;
        this.updateToystoreMapping = this.updateToystoreMapping.bind(this);
      }

      componentDidMount() {
        this._isMounted = true;
        store.watch(getStoreKeys(), this.updateToystoreMapping, options);
      }

      componentWillUnmount() {
        this._isMounted = false;
        store.unwatch(this.updateToystoreMapping);
      }

      getOriginalComponent() {
        return OriginalComponent;
      }

      getOriginalComponentRef() {
        return this.originalComponent;
      }

      updateToystoreMapping(toystoreMapping) {
        if (!this._isMounted) {
          return;
        }

        let updatedMapping = getMappingForLocalPropNames();

        this.setState({
          toystoreMapping: updatedMapping
        });
      }

      render() {
        let props = Object.assign({}, this.props, this.state.toystoreMapping, {ref: node => this.originalComponent = node});

        return createElement(OriginalComponent, props, this.props.children);
      }
    }

    return ToystoreConnect;
  }

  // Public API
  return {
    subscribe,
  };
}

module.exports = createBinding;
