import { Component } from "solid-js";
import { useI18n } from "reynard-themes";
import { getDemoTranslation } from "../translations";

interface DemoCardProps {
  title: string;
  children: any;
}

const DemoCard: Component<DemoCardProps> = props => {
  const { locale } = useI18n();

  return (
    <div class="demo-card">
      <h3>{getDemoTranslation(locale, props.title as any)}</h3>
      {props.children}
    </div>
  );
};

export default DemoCard;
