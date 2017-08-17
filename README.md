# Refova

A Higher Order Component for form validations in React apps.
Highly inspired by awesome [Formik](https://github.com/jaredpalmer/formik)

### Installing
With npm:
```bash
npm install refova --save
```
or with [Yarn](https://yarnpkg.com):
```bash
yarn add refova
```

### Examples
- [Basic form validation](https://codesandbox.io/embed/40DXxo12)
- [More complex form](https://codesandbox.io/embed/k5pO1ZQPJ)


## API
#### `Refova(options?)`
Create a Higher Order component.

#### options
###### `mapPropsToValues?: (props) => values`
Default `() => ({})`. Refova will transfer its results into updatable form state and make these values available to the new component as `props.values`.

###### `validations?: {[key: string]: Array.<Rule>}`
Default `{}`. Validation rules per each value in `values`. Rule is a simple object:
```
{
  message: string | (value, payload) => string, 
  test: (value, payload) => boolean
}
```
For example for `values === { email: '', password: '' }` we can define next validations:
```js
{ 
  email: [
    { message: 'Is requered', test: value => value.length > 0 },
    { message: 'Not valid email address', test: value => value.includes(@) }
  ],
  password: [
    { message: 'Is requered', test: value => value.length > 0 }
  ]
}
```

###### `resetWhenPropsChange?: boolean`
Defaul `true`. Reset Refova state when props was changed.

###### `initialValidation?: boolean`
Default `false`. Validate `values` on initial mount and after reset.

###### `submit?: (payload: {}) => void`
Default `() => {}`. Callback for `handleSubmit`.
Payload:
- `values`
- `changed`
- `props`
- `setValue`
- `setValues`
- `resetError`
- `reset`

#### Injected props

##### `isValid: boolean`

##### `handleChange: (Event) => void`
Updates target value and validate state.

##### `handleOnlyChange: (Event) => void`
Updates target value without validations.

##### `handleSubmit: (Event) => void`
Prevents default submit behavior. Validates `values` and calls `submit` if they are valid

##### `setValue: (key: string, value: any, validate? boolean, callback: Function)`
Updates value by given key. By default will validate updated value (can be disabled by provided `validate?: false`). 
Callback will be passed to `React.Component::setState()`.

##### `setValues: (values: {[key: string], value: any}, validate?: boolean, callback?: Function)`
Updates multiple values and validates them. Callback will be passed to `React.Component::setState()`.

##### `resetError: (keys: string | Array.<string>, callback?: Function) => void`
Resets one or multiple errors. 
Callback will be passed to `React.Component::setState()`.

##### `validate: (keys?: string | Array.<string>, callback?: Function) => boolean`
Validates one or multiple values. If `keys` argument omitted, then all `values` will be validated.
Returns `true` if `values` are valid, othervise `false`
Callback will be passed to `React.Component::setState()`.

##### `reset: (nextProps?: any, callback?: Function) => void`
Resets Refova state. If `nextProps` is provided, then resets state according to new props. 
Can be usefull when option `resetWhenPropsChange` is disabled, and you need to
manually reset Refova state when component receive new props.
Callback will be passed to `React.Component::setState()`.

#### _(Docs are under development. Need help)_
