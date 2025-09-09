/**
 * Icon Components for Auth App
 * Reusable icon components using reynard-fluent-icons
 */

import { getIcon } from "reynard-fluent-icons";

interface IconProps {
  size?: number;
}

export const Person = (props: IconProps) => {
  const icon = getIcon("user");
  if (!icon) return null;
  return (
    <span
      class="icon"
      data-size={props.size || 16}
      innerHTML={icon.outerHTML}
    />
  );
};

export const Shield = (props: IconProps) => {
  const icon = getIcon("lock");
  if (!icon) return null;
  return (
    <span
      class="icon"
      data-size={props.size || 16}
      innerHTML={icon.outerHTML}
    />
  );
};

export const SignOut = (props: IconProps) => {
  const icon = getIcon("logout");
  if (!icon) return null;
  return (
    <span
      class="icon"
      data-size={props.size || 16}
      innerHTML={icon.outerHTML}
    />
  );
};

export const Settings = (props: IconProps) => {
  const icon = getIcon("settings");
  if (!icon) return null;
  return (
    <span
      class="icon"
      data-size={props.size || 16}
      innerHTML={icon.outerHTML}
    />
  );
};

export const CheckmarkCircle = (props: IconProps) => {
  const icon = getIcon("checkmark-circle");
  if (!icon) return null;
  return (
    <span
      class="icon"
      data-size={props.size || 16}
      innerHTML={icon.outerHTML}
    />
  );
};

export const Warning = (props: IconProps) => {
  const icon = getIcon("warning");
  if (!icon) return null;
  return (
    <span
      class="icon"
      data-size={props.size || 16}
      innerHTML={icon.outerHTML}
    />
  );
};

export const Info = (props: IconProps) => {
  const icon = getIcon("info");
  if (!icon) return null;
  return (
    <span
      class="icon"
      data-size={props.size || 16}
      innerHTML={icon.outerHTML}
    />
  );
};
