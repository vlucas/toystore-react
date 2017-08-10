'use strict';

const { mount } = require('enzyme');
const toystore = require('toystore');
const toystoreReact = require('../src/index');
const React = require('react');

let renderCount = 0;
let store;
let storeDefaults = {
  foo: 'bar',
  user: {
    email: 'user@example.com',
    id: 1,
  },
};
let subscribe;
let TestComponent;

class ExampleComponent extends React.Component {
  render() {
    let propsJson = JSON.stringify(this.props);

    renderCount++;

    return React.createElement('div', {}, propsJson);
  }
}

describe('subscribe', () => {
  beforeEach(() => {
    renderCount = 0;
    store = toystore.create(storeDefaults);
    subscribe = (Component, mapping) => toystoreReact.subscribe(store, Component, mapping);
  });

  it('should map store keys to local props on initial render', () => {
    TestComponent = subscribe(ExampleComponent);
    let component = mount(React.createElement(TestComponent, {}));

    expect(component.text()).toContain('"foo":"bar"');
  });

  it('should re-render component when a watched key changes', () => {
    TestComponent = subscribe(ExampleComponent, { foo: 'foo' });
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('foo', 'baz');

    expect(component.text()).toContain('"foo":"baz"');
    expect(renderCount).toBe(2);
  });

  it('should NOT re-render component when a key changes that is not watched for', () => {
    TestComponent = subscribe(ExampleComponent, { foo: 'foo' });
    let component = mount(React.createElement(TestComponent, {}));

    // Should NOT trigger a re-render
    store.set('user.id', 2);

    expect(renderCount).toBe(1);
  });
});
