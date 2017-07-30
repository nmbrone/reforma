import React from 'react';
import PropTypes from 'prop-types';
import {
  reduceValues,
  reduceErrors,
  reduceChanged,
  isEqual,
  getComponentName,
  getKeyFromEventTarget,
} from './helpers';

export default function Reforma(
  {
    mapPropsToValues = () => ({}),
    validations = {},
    resetWhenPropsChange = true,
    validateWhenPropsChange = false,
  } = {}
) {
  const _validateValue = (key, value, payload) => {
    if (validations.hasOwnProperty(key)) {
      const rules = validations[key];
      for (let i = 0, len = rules.length; i < len; i++) {
        const { test, message } = rules[i];
        if (test(value, payload) === true) continue;
        return typeof message === 'function'
          ? message(value, payload)
          : message;
      }
    }
    return true;
  };

  const _validateValues = (values, payload) => {
    return Object.keys(values).reduce((errors, key) => {
      const message = _validateValue(key, values[key], payload);
      if (message !== true) errors[key] = message;
      return errors;
    }, {});
  };

  const _getStateFromProps = props => {
    const values = mapPropsToValues(props);
    const changed = [];
    const errors = validateWhenPropsChange
      ? _validateValues(values, { values, errors: {}, changed, props })
      : {};
    return { values, errors, changed };
  };

  return Wrapped => {
    class Reforma extends React.Component {
      constructor(props) {
        super(props);
        this.state = _getStateFromProps(props);
      }

      _getPayload(nextState) {
        return {
          ...this.state,
          ...nextState,
          props: this.props,
        };
      }

      setValue = (key, value, validate = true) => {
        const nextState = {
          values: reduceValues(this.state.values, key, value),
          changed: reduceChanged(this.state.changed, key),
        };
        if (validate) {
          const payload = this._getPayload(nextState);
          const message = _validateValue(key, value, payload);
          nextState.errors = reduceErrors(this.state.errors, key, message);
        }
        this.setState(nextState);
      };

      setValues = (values, validate = true) => {
        const nextState = {
          values: { ...this.state.values, ...values },
          changed: Object.keys(values),
        };
        if (validate) {
          const payload = this._getPayload(nextState);
          nextState.errors = _validateValues(values, payload);
        }
        this.setState(nextState);
      };

      resetError = (...keys) => {
        const errors = keys.reduce(
          (acc, key) => reduceErrors(acc, key, true),
          this.state.errors
        );
        this.setState({ errors });
      };

      validateValue = (...keys) => {
        const errors = keys.reduce((acc, key) => {
          const value = this.state.values[key];
          const payload = this._getPayload({ errors: acc });
          const message = _validateValue(key, value, payload);
          return reduceErrors(acc, key, message);
        }, this.state.errors);
        this.setState({ errors });
      };

      reset = (nextProps = this.props) => {
        this.setState(_getStateFromProps(nextProps));
      };

      handleChange = e => {
        const key = getKeyFromEventTarget(e);
        this.setValue(key, e.target.value);
      };

      handleOnlyChange = e => {
        const key = getKeyFromEventTarget(e);
        this.setValue(key, e.target.value, false);
      };

      render() {
        return (
          <Wrapped
            {...this.props}
            {...this.state}
            handleChange={this.handleChange}
            handleOnlyChange={this.handleOnlyChange}
            setValue={this.setValue}
            setValues={this.setValues}
            resetError={this.resetError}
            validateValue={this.validateValue}
            reset={this.reset}
          />
        );
      }
    }

    if (resetWhenPropsChange) {
      Reforma.prototype.componentWillReceiveProps = function(nextProps) {
        const hasChanged = !isEqual(
          mapPropsToValues(nextProps),
          mapPropsToValues(this.props)
        );
        hasChanged && this.reset(nextProps);
      };
    }

    Reforma.displayName = `Reforma(${getComponentName(Wrapped)})`;
    return Reforma;
  };
}

export const reformaShape = {
  values: PropTypes.objectOf(PropTypes.string),
  errors: PropTypes.objectOf(PropTypes.string),
  changed: PropTypes.arrayOf(PropTypes.string),
  handleChange: PropTypes.func,
  handleOnlyChange: PropTypes.func,
  setValue: PropTypes.func,
  setValues: PropTypes.func,
  resetError: PropTypes.func,
  validateValue: PropTypes.func,
  reset: PropTypes.func,
};
