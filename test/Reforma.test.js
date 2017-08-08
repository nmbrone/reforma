import React from 'react';
import { shallow, mount } from 'enzyme';
import Reforma from '../src/Reforma';

describe('<Reforma />', () => {
  const wrapTest = fn => jest.fn().mockImplementation(fn);

  const rules = {
    email: {
      message: 'Not valid email',
      test: wrapTest(value => value.includes('@')),
    },
    domain: {
      message: 'Domain is not allowed',
      test: wrapTest(value => /gmail\.com|icloud\.com/.test(value)),
    },
    password: {
      message: 'Password should be at least 6 chars length',
      test: wrapTest(value => value.length >= 6),
    },
  };

  const clearRulesMocks = () =>
    Object.values(rules).forEach(rule => rule.test.mockClear());

  const Form = ({ values, handleChange, handleOnlyChange }) => {
    return (
      <form>
        <input
          type="text"
          name="username"
          value={values.username}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleOnlyChange}
          onBlur={handleChange}
        />
        <button>Submit</button>
      </form>
    );
  };

  const getWrappedForm = settings =>
    Reforma({
      mapPropsToValues: props => ({
        username: props.username,
        email: props.email,
        password: props.password,
      }),
      validations: {
        email: [rules.email, rules.domain],
        password: [rules.password],
      },
      resetWhenPropsChange: true,
      validateWhenPropsChange: true,
      ...settings,
    })(Form);

  let wrapper;

  beforeEach(() => {
    const WrappedForm = getWrappedForm();
    clearRulesMocks();
    wrapper = shallow(
      <WrappedForm email="example@email.com" password="qwer" username="" />
    );
  });

  test('renders given wrapped component', () => {
    expect(wrapper).toMatchSnapshot();
  });

  test('renders given wrapped component when settings omitted', () => {
    const WrappedForm = Reforma()(Form);
    const wrapper = shallow(<WrappedForm />);
    expect(wrapper).toMatchSnapshot();
  });

  test('renders given wrapped component without initial validations', () => {
    const WrappedForm = getWrappedForm({
      validateWhenPropsChange: false,
    });
    const wrapper = shallow(
      <WrappedForm email="example@email.com" password="qwer" />
    );
    expect(wrapper.prop('errors')).toEqual({});
  });

  test('sets value', () => {
    const value = 'example@gmail.com';
    wrapper.prop('setValue')('email', value);
    expect(wrapper.prop('values').email).toBe(value);
    expect(wrapper.prop('changed')).toContain('email');
    expect(wrapper.prop('errors')).not.toHaveProperty('email');
  });

  test('sets value without validation', () => {
    const value = 'example@gmail.com';
    wrapper.prop('setValue')('email', value, false);
    expect(wrapper.prop('values').email).toBe(value);
    expect(wrapper.prop('errors')).toHaveProperty('email');
  });

  test('sets multiple values', () => {
    wrapper.prop('setValues')({
      email: 'example@gmail.com',
      password: 'qwerty',
    });
    expect(wrapper.prop('values')).toEqual({
      email: 'example@gmail.com',
      password: 'qwerty',
      username: '',
    });
    expect(wrapper.prop('changed')).toEqual(['email', 'password']);
    expect(wrapper.prop('errors')).toEqual({});

    wrapper.prop('setValues')({
      email: 'example',
      username: 'User',
    });
    expect(wrapper.prop('values')).toEqual({
      email: 'example',
      password: 'qwerty',
      username: 'User',
    });
    expect(wrapper.prop('changed')).toEqual(['email', 'password', 'username']);
    expect(wrapper.prop('errors')).toEqual({ email: rules.email.message });

    wrapper.prop('setValues')({ password: 'qwe' });
    expect(wrapper.prop('values')).toEqual({
      email: 'example',
      password: 'qwe',
      username: 'User',
    });
    expect(wrapper.prop('changed')).toEqual(['email', 'password', 'username']);
    expect(wrapper.prop('errors')).toEqual({
      email: rules.email.message,
      password: rules.password.message,
    });
  });

  test('sets multiple values without validation', () => {
    const values = {
      email: 'example@gmail.com',
      password: 'qwerty',
    };
    const prevErrors = wrapper.prop('errors');
    wrapper.prop('setValues')(values, false);
    expect(wrapper.prop('values')).toEqual({ ...values, username: '' });
    expect(wrapper.prop('changed')).toEqual(Object.keys(values));
    expect(wrapper.prop('errors')).toBe(prevErrors);
  });

  test('merges new values with old ones', () => {
    const values = {
      email: 'example@gmail.com',
    };
    const initialValues = wrapper.prop('values');
    wrapper.prop('setValues')(values);
    expect(wrapper.prop('values')).toEqual({
      ...initialValues,
      ...values,
    });
  });

  test('resets error', () => {
    wrapper.prop('resetError')('email');
    expect(wrapper.prop('errors')).toEqual({
      password: rules.password.message,
    });
  });

  test('resets multiple errors', () => {
    wrapper.prop('resetError')(['email', 'password']);
    expect(wrapper.prop('errors')).toEqual({});
  });

  test('validates value', () => {
    wrapper.setState({
      values: {
        email: 'example',
      },
    });
    wrapper.prop('validateValue')('email');
    expect(wrapper.prop('errors')).toEqual({
      email: rules.email.message,
      password: rules.password.message,
    });
  });

  test('validates multiple values', () => {
    clearRulesMocks();
    wrapper.setState({
      values: {
        email: 'example@gmail.com',
        password: 'qwerty',
      },
    });
    wrapper.prop('validateValue')(['email', 'password']);
    expect(wrapper.prop('errors')).toEqual({});
    expect(rules.password.test.mock.calls[0][1]).not.toHaveProperty(
      'errors.email'
    );
  });

  test('resets state', () => {
    const initialState = wrapper.state();
    wrapper.setState({
      errors: {},
      values: {},
    });
    wrapper.prop('reset')();
    expect(wrapper.state()).toEqual(initialState);
  });

  test('resets state with next props', () => {
    const nextProps = {
      email: 'example@gmail.com',
      password: 'qwerty',
    };
    wrapper.prop('reset')(nextProps);
    expect(wrapper.state()).toEqual({
      values: {
        ...nextProps,
      },
      errors: {},
      changed: [],
    });
  });

  test('resets state with next props without validation', () => {
    const WrappedForm = getWrappedForm({
      validateWhenPropsChange: false,
    });
    const wrapper = shallow(
      <WrappedForm email="example@gmail.com" password="qwerty" />
    );
    const initialState = wrapper.state();
    const nextProps = {
      email: 'example',
      password: 'qwer',
    };
    wrapper.prop('reset')(nextProps);
    expect(wrapper.state()).toEqual({
      ...initialState,
      values: {
        ...nextProps,
      },
    });
  });

  test('resets state when props change', () => {
    const nextProps = {
      email: 'example@gmail.com',
      password: 'qwerty',
      username: 'User',
    };
    wrapper.setProps(nextProps);
    expect(wrapper.state()).toEqual({
      values: {
        ...nextProps,
      },
      errors: {},
      changed: [],
    });
  });

  test('error message for the value should be a message of first failed rule in a list of validations rules', () => {
    clearRulesMocks();
    const WrappedForm = getWrappedForm();
    const wrapper = shallow(<WrappedForm email="example" password="qwerty" />);
    expect(wrapper.prop('errors')).toEqual({
      email: rules.email.message,
    });
    expect(rules.email.test).toHaveBeenCalledTimes(1);
    expect(rules.domain.test).toHaveBeenCalledTimes(0);
    expect(rules.password.test).toHaveBeenCalledTimes(1);
  });

  test('a test should be called with right arguments', () => {
    clearRulesMocks();
    const WrappedForm = getWrappedForm();
    const props = { email: 'example', password: 'qwerty', foo: 'bar' };
    const wrapper = shallow(<WrappedForm {...props} />);
    const expectedPayload = {
      changed: [],
      values: { email: 'example', password: 'qwerty' },
      props,
    };

    expect(rules.email.test.mock.calls[0][0]).toBe('example');
    expect(rules.email.test.mock.calls[0][1]).toEqual(expectedPayload);

    expect(rules.password.test.mock.calls[0][0]).toBe('qwerty');
    expect(rules.password.test.mock.calls[0][1]).toEqual(expectedPayload);

    wrapper.prop('setValue')('email', 'example@email.com');
    const expectedPayload2 = {
      changed: ['email'],
      values: { email: 'example@email.com', password: 'qwerty' },
      props,
    };
    expect(rules.email.test.mock.calls[1][0]).toBe('example@email.com');
    expect(rules.email.test.mock.calls[1][1]).toEqual(expectedPayload2);
  });

  test('errors should contain only those fields for which defined validation rules', () => {
    expect(wrapper.prop('errors')).toHaveProperty('email');
    expect(wrapper.prop('errors')).toHaveProperty('password');
    expect(wrapper.prop('errors')).not.toHaveProperty('username');
    wrapper.prop('validateValue')('username');
    expect(wrapper.prop('errors')).not.toHaveProperty('username');
  });

  test('rule message can be a function', () => {
    const emailRule = {
      message: jest
        .fn()
        .mockImplementation(value => `<${value}> is not valid email address`),
      test: value => value.includes('@'),
    };
    const WrappedForm = getWrappedForm({
      validations: {
        email: [emailRule],
      },
    });
    const props = { email: 'example', password: 'qwerty', foo: 'bar' };
    const wrapper = shallow(<WrappedForm {...props} />);
    expect(emailRule.message).toHaveBeenCalledWith('example', {
      props,
      changed: [],
      values: { email: 'example', password: 'qwerty' },
    });
    expect(wrapper.prop('errors')).toHaveProperty(
      'email',
      '<example> is not valid email address'
    );
  });

  test('handles change event', () => {
    const WrappedForm = getWrappedForm();
    const wrapper = mount(
      <WrappedForm email="example@icloud.com" password="qwerty" />
    ).find('Form');
    const inputWrapper = wrapper.find('[name="email"]');
    const inputElement = inputWrapper.get(0);
    inputElement.value = 'example';
    inputWrapper.simulate('change');
    expect(wrapper.prop('values')).toHaveProperty('email', 'example');
    expect(wrapper.prop('changed')).toContain('email');
    expect(wrapper.prop('errors')).toHaveProperty('email', rules.email.message);
  });

  test('handles change event withouth validation', () => {
    const WrappedForm = getWrappedForm();
    const wrapper = mount(
      <WrappedForm email="example@icloud.com" password="qwerty" />
    ).find('Form');
    const inputWrapper = wrapper.find('[name="password"]');
    const inputElement = inputWrapper.get(0);
    inputElement.value = 'qw';
    inputWrapper.simulate('change');
    expect(wrapper.prop('values')).toHaveProperty('password', 'qw');
    expect(wrapper.prop('changed')).toContain('password');
    expect(wrapper.prop('errors')).not.toHaveProperty('password');
  });
});
