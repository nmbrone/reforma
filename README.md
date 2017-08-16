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
### `Refova(options)`
Create a Higher Order component.

#### `options`
##### `mapPropsToValues: (props) => values`
Default `() => ({})`. Refova will transfer its results into updatable form state and make these values available to the new component as `props.values`.

##### `validations: {[key: string]: Array.<Rule>}`
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

##### `resetWhenPropsChange: boolean`
Defaul `true`. Reset Refova state when props was changed.

##### `initialValidation: boolean`
Default `false`. Validate `values` on initial mount and after reset.


#### _(Docs are under development. Need help)_
