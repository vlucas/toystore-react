# Toystore React Bindings

Bindings to subscribe a React component to specific keys in Toystore.js so the
React component will auto-update when the specified keys change.

**NEW** v2.x works with React or any API-compatible project (Preact, Inferno, etc.)

## Installation

```
npm install toystore-react --save
```

## Usage
Create a new store instance with your initial store values:
```javascript
// File: ./mystore.js
const React = require('react');
const toystore = require('toystore');
const toystoreReact = require('toystore-react')(React); // Provide 'React', 'Preact', 'Inferno', etc. here

let store = toystore.create({
  foo: 'bar',
  user: {
    email: 'user@example.com',
    id: 1,
  }
});

// Use partial application to add the 'subscribe' method from toystore-react, bound to this store
store.subscribe = (Component, mapping) => toystoreReact.subscribe(store, Component, mapping);

module.exports = store;
```

### Subscribe a React Component to the Entire Store

Update your component anytime any key in the store changes:

```javascript
const store = require('./mystore');

class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.user.email}</div>
  }
}

// Where the magic happens
export default store.subscribe(MyComponent);
```

### Subscrbe a React Component to Specific Keys in the Store

```javascript
const store = require('./mystore');

class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.user.email}</div>
  }
}

// Where the magic happens
export default store.subscribe(MyComponent, { user_email: 'user.email' });
```

### Update Priority

Give a component a higher or lower priority to update by passing in an options object.

```javascript
const store = require('./mystore');

class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.user.email}</div>
  }
}

// Where the magic happens
export default store.subscribe(MyComponent, { user_email: 'user.email' }, { priority: 99999});
```



## API

The React binding has only a single function - `subscribe`, but it can accept
many different ways of mapping store keys that you want to listen for.

### subscribe(store, Component, mapping = null, options = { priority: 0 })

Subscribe works by wrapping your React component in a higher order component
that watches the store for changes on the specified keys, then triggers a
re-render when those values change. Those specified keys are then injected into
your component as props that you can use to display the information you need
to.

Note: Since only props are used for your component and are injected by
`toystore-react`, you can use `React.PureComponent` where possible to get the
performance benefits of stateless React components.

Key names that you specify will be mapped to local props for the component and
injected on render.

Example: Mapping `user` will inject `this.props.user` with its store value.

For nested keys, the root property object will be mapped as the local prop
name.

Example: Mapping `user.email` will inject the `user` object from the store as
the main prop name: `this.props.user.email`

#### Empty Mapping

When you don't specify a mapping for a component, the component is bound to the
whole store, and will re-render on any and every change to any key in the whole
store. This is generally not recommended for performance reasons, but can be
useful in certain circumstances.

```javascript
export default store.subscribe(App);
```

#### String Mapping

String mapping is a convenient shortcut when you only need to listen for changes
on a single store key.

```javascript
export default store.subscribe(UserProfile, 'user'); // available as 'this.props.user'
```

#### Array Mapping

Arrays can be used for simple mappings that will map the store key name to a
local property 1:1.

```javascript
export default store.subscribe(UserProfile, ['user.email', 'foo']);
```

#### Object Mapping

If you want the local React component prop names to be different than your
store keys, you can use object mapping to specify a custom prop name.

```javascript
export default store.subscribe(UserProfile, {
  userEmail: 'user.email', // this.props.userEmail === store.get('user.email')
  fooCustom: 'foo',        // this.props.fooCustom === store.get('foo')
});
```























