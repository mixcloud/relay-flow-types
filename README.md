# relay-flow-types

A command line tool to generate flowtypes from `Relay.QL` queries and fragments.

Note: this hasn't been rigorously tested so be careful the first time you use it.

```bash
Usage: relay-flow-types [schema.json . --ignore-dirs=__tests__,__mocks__,node_modules --subdir=__relay__ --extension={jsx,js} --remove-old]

Options:
  --ignore-dirs  Any directories to ignore
                          [string] [default: "__tests__,__mocks__,node_modules"]
  --subdir       The subdirectory in which to place the generated flow types
                                                 [string] [default: "__relay__"]
  --remove-old   Remove __relay__ directories before generating new types - BE
                 CAREFUL IF USING IN CONJUNCTION WITH --subdir
                                                      [boolean] [default: false]
  --extension    File extensions to check         [string] [default: "{jsx,js}"]
  --help         Show help                                             [boolean]
```

You pass the path to a graphql schema and the root where you want to add flow types (defaulting to `schema.json`
and `.` respectively) and the tool will find any `Relay.QL` queries and fragments in your codebase and add flowtypes
in files matching the name in a subdirectory called `__relay__` (by default).

To use the types simply import them in your code and make sure you run `relay-flow-types` before running `flow`.

Code example:

```javascript
// filename: myComponent.js
import type {UserFragmentType} from './__relay__/myComponent.js'

class MyComponent extends React.Component {
    props: {
        user: UserFragmentType
    }
    
    render() {
        // ! flow will complain because displayName has not been requested in the query
        return <div>{this.props.user.displayName} {this.props.user.username}</div>;
    }
}

MyComponent = Relay.createContainer(MyComponent, {
    fragments: {
        user: () => Relay.QL`
            fragment on User {
                username
            }
        `
    }
});
```