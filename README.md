# Toystore React Bindings

Bidings to subscribe a React component to specific keys in Toystore.js so the
React component will auto-update when the specified keys change.

## Installation

```
npm install toystore-react --save
```

## Usage
Create a new store instance with your initial store values:
```javascript
const toystore = require('toystore');

let store = toystore.create({
  foo: 'bar',
  user: {
    email: 'user@example.com',
    id: 1,
  }
});

module.exports = store;
```

### Subscrbe a React Component to the Store
Update your component anytime any key in the store changes:
```javascript
const store = require('./mystore');
const toystoreReact = require('./mystore');

class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.user.email}</div>
  }
}

// Where the magic happens
export default toystoreReact.subscribe(store, MyComponent);
```

### Subscrbe a React Component to Specific Keys in the Store
```javascript
const store = require('./mystore');
const toystoreReact = require('./mystore');

class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.user.email}</div>
  }
}

// Where the magic happens
export default toystoreReact.subscribe(store, MyComponent, { user_email: 'user.email' });
```
