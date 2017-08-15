/**
 * @param {Object} values
 * @param {Object} nextValues
 * @returns {Object}
 */
export function reduceValues(values, nextValues) {
  return { ...values, ...nextValues };
}

/**
 *
 * @param {Object} errors
 * @param {Object} messages
 * @returns {Object}
 */
export function reduceErrors(errors, messages) {
  const nextErrors = { ...errors };
  Object.keys(messages).forEach(key => {
    const message = messages[key];
    if (message === true) {
      delete nextErrors[key];
    } else {
      nextErrors[key] = message;
    }
  });
  return nextErrors;
}

/**
 * @param {String[]} changed
 * @param {(String|String[])} key
 * @returns {String[]}
 */
export function reduceChanged(changed, key) {
  return uniqArray(changed.concat(key));
}

/**
 * @param {[]} arr
 * @returns {[]}
 */
export function uniqArray(arr) {
  return arr.reduce((acc, el) => {
    if (acc.indexOf(el) === -1) acc.push(el);
    return acc;
  }, []);
}

/**
 * @param {Object} o1
 * @param {Object} o2
 * @returns {Boolean}
 */
export function isEqualObjects(o1, o2) {
  if (o1 === o2) return true;
  return JSON.stringify(o1) === JSON.stringify(o2);
}

/**
 * @param {HTMLInputElement} el
 */
export function getKeyValueFromElement(el) {
  return {
    key: el.name || el.id,
    value: el.type === 'checkbox' ? el.checked : el.value,
  };
}

/**
 * @param {Function} component
 * @returns {String}
 */
export function getComponentName(component) {
  return component.displayName || component.name || 'Component';
}
