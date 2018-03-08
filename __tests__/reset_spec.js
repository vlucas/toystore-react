'use strict';

const { mount } = require('enzyme');
const React = require('react');
const toystore = require('toystore');
const toystoreReact = require('../src/index')(React);

let renderCount = 0;
let storeDefaults = {
  foo: 'bar',
  user: {
    email: 'user@example.com',
    id: 1,
  },
};
let store = toystore.create(storeDefaults);
let subscribe = (Component, mapping) => toystoreReact.subscribe(store, Component, mapping);
let TestComponent;

// Test component
class ExampleComponent extends React.Component {
  render() {
    let propsJson = JSON.stringify(this.props);

    renderCount++;

    return React.createElement('div', {}, propsJson);
  }
}

describe('subscribe with reset', () => {
  beforeEach(() => {
    store.reset();
    TestComponent = null;
    renderCount = 0;
  });

  it('should render with correct data after store reset (stupid)', () => {
    TestComponent = subscribe(ExampleComponent, { user_email: 'user.email' });
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('user.email', 'foo@bar.com');

    // Reset back to original value
    store.reset();

    // Should render with original value
    expect(component.text()).toContain('"user_email":"user@example.com"');
    expect(renderCount).toBe(3);
  });

  it('should re-render component when a watched key changes', () => {
    TestComponent = subscribe(ExampleComponent, { userId: 'user.id' });
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('user.id', 42);

    store.reset();

    expect(component.text()).toContain('"userId":1');
    expect(renderCount).toBe(4);
  });
});
