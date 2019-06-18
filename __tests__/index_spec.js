import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
const React = require('react');
const toystore = require('toystore');
const toystoreReact = require('../src/index')(React);

configure({ adapter: new Adapter() });

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

function StatelessComponent(props) {
  let propsJson = JSON.stringify(props);

  renderCount++;

  return React.createElement('div', {}, propsJson);
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

  it('should render with the correct values when mounted AFTER a store set/update', () => {
    TestComponent = subscribe(ExampleComponent, 'foo');

    // Update store AFTER subscribe, but BEFORE render
    store.set('foo', 'baz');

    let component = mount(React.createElement(TestComponent, {}));

    expect(component.text()).toContain('"foo":"baz"');
    expect(renderCount).toBe(1);
  });

  it('should watch for key changes with single string', () => {
    TestComponent = subscribe(ExampleComponent, 'foo');
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('foo', 'baz');

    expect(component.text()).toContain('"foo":"baz"');
    expect(renderCount).toBe(2);
  });

  it('should watch for key changes with array', () => {
    TestComponent = subscribe(ExampleComponent, ['foo']);
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('foo', 'baz');

    expect(component.text()).toContain('"foo":"baz"');
    expect(renderCount).toBe(2);
  });

  it('should re-render component when a watched key changes', () => {
    TestComponent = subscribe(ExampleComponent, { foo_custom: 'foo' });
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('foo', 'baz');

    expect(component.text()).toContain('"foo_custom":"baz"');
    expect(renderCount).toBe(2);
  });

  it('should NOT re-render component when a key changes that is not watched for', () => {
    TestComponent = subscribe(ExampleComponent, { foo: 'foo' });
    let component = mount(React.createElement(TestComponent, {}));

    // Should NOT trigger a re-render
    store.set('user.id', 2);

    expect(renderCount).toBe(1);
  });

  it('should watch for key changes on nested key, but return root object when given array', () => {
    TestComponent = subscribe(ExampleComponent, ['user.email']);
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('user.email', 'foo@bar.com');

    expect(component.text()).toContain('"email":"foo@bar.com"');
    expect(renderCount).toBe(2);
  });

  it('should watch for key changes on nested key, and only give watched value when given object', () => {
    TestComponent = subscribe(ExampleComponent, { user_email: 'user.email' });
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('user.email', 'foo@bar.com');

    expect(component.text()).toContain('"user_email":"foo@bar.com"');
    expect(renderCount).toBe(2);
  });

  it('should re-render component when a root object changes on a watched nested key', () => {
    TestComponent = subscribe(ExampleComponent, { user_email: 'user.email' });
    let component = mount(React.createElement(TestComponent, {}));

    // Should trigger a re-render
    store.set('user', {
      email: 'bar@baz.com',
      id: 2,
    });

    expect(component.text()).toContain('"user_email":"bar@baz.com"');
    expect(renderCount).toBe(2);
  });

  it('should support stateless function components', () => {
    TestComponent = subscribe(StatelessComponent);
    let component = mount(React.createElement(TestComponent, {}));

    expect(component.text()).toContain('"foo":"bar"');
  });
});
