import React from "react";

// src/components/ui/radio-group.jsx

export const RadioGroup = ({ value, onValueChange, name, children, ...props }) => {
  // Clone children to inject checked, name, and onChange
  return (
    <div role="radiogroup" {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          checked: child.props.value === value,
          name,
          onChange: (e) => onValueChange(e.target.value),
        });
      })}
    </div>
  );
};

export const RadioGroupItem = ({ value, checked, onChange, name, id, children }) => (
  <label htmlFor={id}>
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={onChange}
      name={name}
    />
    {children}
  </label>
);
