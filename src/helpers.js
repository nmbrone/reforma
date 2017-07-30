export function reduceValues(values, key, value) {
  return { ...values, [key]: value };
}

export function reduceErrors(errors, key, message) {
  const nextErrors = { ...errors };
  if (message === true) {
    delete nextErrors[key];
  } else {
    nextErrors[key] = message;
  }
  return nextErrors;
}

export function reduceChanged(changed, key) {
  return changed.indexOf(key) > -1 ? changed : changed.concat(key);
}

export function isEqual(o1, o2) {
  if (o1 === o2) return true;
  return JSON.stringify(o1) === JSON.stringify(o2);
}

export function getKeyFromEventTarget(e) {
  return e.target.name || e.target.id;
}

export function getComponentName(component) {
  return component.displayName || component.name || 'Component';
}
