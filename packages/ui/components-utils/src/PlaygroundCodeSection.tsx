/**
 * Playground Code Section Component
 * Code example display section for the component playground
 */

import { Component, createMemo } from "solid-js";
import { useNotifications } from "reynard-core";
import { useI18n } from "reynard-i18n";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { getCodeExample } from "./playgroundCodeExamples";

export interface PlaygroundCodeSectionProps {
  activeTab: string;
  showCode: boolean;
  onToggleCode: () => void;
}

export const PlaygroundCodeSection: Component<PlaygroundCodeSectionProps> = props => {
  const { t } = useI18n();

  // Use createMemo to defer context access and handle errors gracefully
  const notifications = createMemo(() => {
    try {
      return useNotifications();
    } catch (error) {
      console.error(t("components.console.notificationsContextNotAvailable"), error);
      return {
        notify: (message: string, type?: string) => {
          console.warn(t("components.console.notificationsContextNotAvailableWarning"), message, type);
        },
      };
    }
  });

  const notify = createMemo(() => notifications().notify);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeExample(props.activeTab));
    notify()(t("components.playground.codeCopied"), "success");
  };

  return (
    <div class="playground-code">
      <div class="code-header">
        <h4>Code Example</h4>
        <button class="button button--small" onClick={props.onToggleCode}>
          {fluentIconsPackage.getIcon(props.showCode ? "eye-off" : "eye") && (
            <span
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(props.showCode ? "eye-off" : "eye")?.outerHTML}
            />
          )}
          {props.showCode ? t("components.playground.hideCode") : t("components.playground.showCode")} Code
        </button>
      </div>

      {props.showCode && (
        <div class="code-block">
          <pre>
            <code>{getCodeExample(props.activeTab)}</code>
          </pre>
          <button class="button button--small button--secondary" onClick={handleCopyCode}>
            {fluentIconsPackage.getIcon("copy") && (
              <span
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon("copy")?.outerHTML}
              />
            )}
            Copy Code
          </button>
        </div>
      )}
    </div>
  );
};
