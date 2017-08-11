import React from 'react';
import {
  reduceValues,
  reduceErrors,
  reduceChanged,
  isEqualObjects,
  getComponentName,
  getKeyFromEventTarget,
} from './helpers';

export default function Refova(
  {
    mapPropsToValues = () => ({}),
    validations = {},
    resetWhenPropsChange = true,
    validateWhenPropsChange = false,
  } = {}
) {
  /**
   * Validate single value.
   * @param {String} key - Key for rules.
   * @param {*} value - Value to validate.
   * @param {Object} payload - Payload for validation rule.
   * @returns {(Boolean|String)} - 'true' if a value passed validation, otherwise error message.
   */
  const _validateValue = (key, value, payload) => {
    const rules = validations[key];
    if (rules && rules.length) {
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

  /**
   * Validate multiple values.
   * @param {Object} values - Values to validate.
   * @param {Object} payload - Payload for validation rule.
   * @returns {Object} - Validations result.
   */
  const _validateValues = (values, payload) => {
    return Object.keys(values).reduce((acc, key) => {
      acc[key] = _validateValue(key, values[key], payload);
      return acc;
    }, {});
  };

  /**
   * Get Refova state from component props.
   * @param {Object} props - Component props.
   * @returns {{values: Object, errors: Object, changed: []}}
   */
  const _getStateFromProps = props => {
    const values = mapPropsToValues(props);
    const changed = [];
    const errors = validateWhenPropsChange
      ? reduceErrors({}, _validateValues(values, { values, changed, props }))
      : {};
    return { values, errors, changed };
  };

  return Wrapped => {
    class Refova extends React.Component {
      constructor(props) {
        super(props);
        this.state = _getStateFromProps(props);
      }

      /**
       * Set and (optional) validate value.
       * @param {string} key - Key for value.
       * @param {*} value - Value to set.
       * @param {Boolean} [validate=true] - Optional validation.
       */
      setValue = (key, value, validate = true) => {
        this.setValues({ [key]: value }, validate);
      };

      /**
       * Set and (optional) validate multiple value.
       * @param {Object} values - Values.
       * @param {Boolean} [validate=true] - Optional validation.
       */
      setValues = (values, validate = true) => {
        const nextState = {
          values: reduceValues(this.state.values, values),
          changed: reduceChanged(this.state.changed, Object.keys(values)),
        };
        if (validate) {
          const payload = this._getPayload(nextState);
          nextState.errors = reduceErrors(
            this.state.errors,
            _validateValues(values, payload)
          );
        }
        this.setState(nextState);
      };

      /**
       * Reset error/errors by given key/keys.
       * @param {(String|String[])} key - Key/keys for which need to reset errors.
       */
      resetError = key => {
        let errors = [].concat(key).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        errors = reduceErrors(this.state.errors, errors);
        this.setState({ errors });
      };

      /**
       * Validate value/values by given key/keys.
       * @param {(String|String[])} key - Key/keys for which need to reset errors.
       */
      validateValue = key => {
        const values = [].concat(key).reduce((acc, k) => {
          acc[k] = this.state.values[k];
          return acc;
        }, {});
        let errors = _validateValues(values, this._getPayload());
        errors = reduceErrors(this.state.errors, errors);
        this.setState({ errors });
      };

      /**
       * Reset Refova state.
       * @param {Object} [nextProps=this.props] - Component props.
       */
      reset = (nextProps = this.props) => {
        this.setState(_getStateFromProps(nextProps));
      };

      /**
       * Helper to handle field change event.
       * Will update and validate value.
       * @param {(SyntheticEvent|Event)} e - Event object.
       */
      handleChange = e => {
        const key = getKeyFromEventTarget(e);
        this.setValue(key, e.target.value);
      };

      /**
       * Helper to handle field change event.
       * Will only update value.
       * @param {(SyntheticEvent|Event)} e - Event object.
       */
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

      _getPayload(payload) {
        return {
          values: this.state.values,
          changed: this.state.changed,
          props: this.props,
          ...payload,
        };
      }
    }

    if (resetWhenPropsChange) {
      Refova.prototype.componentWillReceiveProps = function(nextProps) {
        const hasChanged = !isEqualObjects(
          mapPropsToValues(nextProps),
          mapPropsToValues(this.props)
        );
        hasChanged && this.reset(nextProps);
      };
    }

    Refova.displayName = `Refova(${getComponentName(Wrapped)})`;
    return Refova;
  };
}