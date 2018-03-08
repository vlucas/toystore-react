'use strict';

/**
 * Create object with provided arrays of keys and values
 *
 * @param {String[]} keys
 * @param {Array} values
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function zipObject(keys, values) {
  return keys.reduce(function (object, currentValue, currentIndex) {
    object[currentValue] = values[currentIndex];

    return object;
  }, {});
}

/**
 * Create binding
 */
function createBinding(React) {
  var createElement = React.createElement || React.h;
  var Component = React.Component;

  /**
   * Subscribes a component to the store to re-render when specified store keys update
   *
   * @param {Object} Toystore instance
   * @param {React.Component} Component - React component to subscribe/re-render
   * @param {String|Array|Object} mapping
   * @param {Object} options Toystore watch options
   * @param {Number} options.priority value used to determine the order watchers are called
   */
  function subscribe(store, Component) {
    var mapping = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var options = arguments[3];

    var defaultMapping = void 0;

    if (mapping === null) {
      defaultMapping = store.getAll();
    }

    if (typeof mapping === 'string') {
      mapping = [mapping];
    }

    var isNull = mapping === null;
    var isArray = mapping instanceof Array;

    function getPropKeys() {
      var propKeys = isArray ? mapping : isNull ? Object.keys(defaultMapping) : Object.keys(mapping);

      return propKeys;
    }

    function getStoreKeys() {
      var propKeys = getPropKeys();
      var storeKeys = isArray ? mapping : isNull ? propKeys : propKeys.map(function (k) {
        return mapping[k];
      });

      return storeKeys;
    }

    function getRootKeyIfNested(key) {
      var dotPosition = key.indexOf('.');

      if (dotPosition !== -1) {
        return key.substring(0, dotPosition);
      }

      return key;
    }

    function getMappingForLocalPropNames() {
      var propKeys = getPropKeys();
      var storeKeys = getStoreKeys();

      var mappedPropKeys = isArray ? propKeys.map(getRootKeyIfNested) : propKeys;
      var mappedStoreKeys = isArray ? storeKeys.map(getRootKeyIfNested) : storeKeys;
      var storeValues = store.getAll(mappedStoreKeys);
      var storeValuesMapped = Object.keys(storeValues).map(function (k) {
        return storeValues[k];
      });
      var toystoreMapping = zipObject(mappedPropKeys, storeValuesMapped);

      return toystoreMapping;
    }

    var ToystoreConnect = function (_Component) {
      _inherits(ToystoreConnect, _Component);

      function ToystoreConnect() {
        _classCallCheck(this, ToystoreConnect);

        var _this = _possibleConstructorReturn(this, (ToystoreConnect.__proto__ || Object.getPrototypeOf(ToystoreConnect)).call(this));

        _this.state = {
          toystoreMapping: getMappingForLocalPropNames()
        };

        _this._isMounted = false;
        _this.updateToystoreMapping = _this.updateToystoreMapping.bind(_this);
        return _this;
      }

      _createClass(ToystoreConnect, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          this._isMounted = true;
          store.watch(getStoreKeys(), this.updateToystoreMapping, options);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this._isMounted = false;
          store.unwatch(this.updateToystoreMapping);
        }
      }, {
        key: 'getOriginalComponent',
        value: function getOriginalComponent() {
          return Component;
        }
      }, {
        key: 'getOriginalComponentRef',
        value: function getOriginalComponentRef() {
          return this.originalComponent;
        }
      }, {
        key: 'updateToystoreMapping',
        value: function updateToystoreMapping(toystoreMapping) {
          if (!this._isMounted) {
            return;
          }

          var updatedMapping = getMappingForLocalPropNames();

          this.setState({
            toystoreMapping: updatedMapping
          });
        }
      }, {
        key: 'render',
        value: function render() {
          var _this2 = this;

          var props = Object.assign({}, this.props, this.state.toystoreMapping, { ref: function ref(node) {
              return _this2.originalComponent = node;
            } });

          return createElement(Component, props, this.props.children);
        }
      }]);

      return ToystoreConnect;
    }(Component);

    return ToystoreConnect;
  }

  // Public API
  return {
    subscribe: subscribe
  };
}

module.exports = createBinding;
