'use strict';
/**
 * Create object with provided arrays of keys and values
 *
 * @param {String[]} keys
 * @param {Array} values
 */

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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
   * @param {React.Component} OriginalComponent - React component to subscribe/re-render
   * @param {String|Array|Object} mapping
   * @param {Object} options Toystore watch options
   * @param {Number} options.priority value used to determine the order watchers are called
   */

  function subscribe(store, OriginalComponent) {
    var mapping = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var options = arguments.length > 3 ? arguments[3] : undefined;
    var defaultMapping;

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

    var ToystoreConnect =
    /*#__PURE__*/
    function (_Component) {
      _inherits(ToystoreConnect, _Component);

      function ToystoreConnect() {
        var _this;

        _classCallCheck(this, ToystoreConnect);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(ToystoreConnect).call(this));
        _this.state = {
          toystoreMapping: getMappingForLocalPropNames()
        };
        _this._isMounted = false;
        _this.updateToystoreMapping = _this.updateToystoreMapping.bind(_assertThisInitialized(_this));
        return _this;
      }

      _createClass(ToystoreConnect, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          this._isMounted = true;
          store.watch(getStoreKeys(), this.updateToystoreMapping, options);
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this._isMounted = false;
          store.unwatch(this.updateToystoreMapping);
        }
      }, {
        key: "getOriginalComponent",
        value: function getOriginalComponent() {
          return OriginalComponent;
        }
      }, {
        key: "updateToystoreMapping",
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
        key: "render",
        value: function render() {
          var props = Object.assign({}, this.props, this.state.toystoreMapping);
          return createElement(OriginalComponent, props, this.props.children);
        }
      }]);

      return ToystoreConnect;
    }(Component);

    return ToystoreConnect;
  } // Public API


  return {
    subscribe: subscribe
  };
}

module.exports = createBinding;
