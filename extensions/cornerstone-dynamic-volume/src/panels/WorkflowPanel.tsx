import React, { useState, useEffect, useCallback } from 'react';
import type { ServicesManager } from '@ohif/core';
import { useTranslation } from 'react-i18next';
import i18n from '@ohif/i18n';

function WorkflowPanel({ servicesManager }: { servicesManager: ServicesManager }) {
  const ProgressDropdownWithService =
    servicesManager.services.customizationService.getCustomization(
      'progressDropdownWithServiceComponent'
    );
  const { t, i18n: i18nextInstance } = useTranslation();
  const [lang, setLang] = useState(i18nextInstance?.language || i18n.language);

  useEffect(() => {
    const handle = () => setLang(i18n.language);
    i18n.on('languageChanged', handle);
    return () => i18n.off('languageChanged', handle);
  }, []);

  const translateText = useCallback(
    text => {
      if (text === null || text === undefined) {
        return text;
      }
      if (typeof text !== 'string') {
        return text;
      }
      if (text.includes(':')) {
        const [ns, key] = text.split(':');
        const fullKey = `${ns}:${key}`;
        const fromHook = t(fullKey);
        if (fromHook && fromHook !== fullKey) {
          return fromHook;
        }
        const fromNs = i18nextInstance?.t?.(key, { ns, defaultValue: key });
        if (fromNs && fromNs !== key) {
          return fromNs;
        }
        return i18n.t(key, { ns, defaultValue: key });
      }
      const fromHook = t(text);
      if (fromHook && fromHook !== text) {
        return fromHook;
      }
      return text;
    },
    [lang, t, i18nextInstance]
  );

  return (
    <div
      data-cy={'workflow-panel'}
      className="bg-popover mb-1 px-3 py-4"
    >
      <div className="mb-1">{translateText('Workflow:Workflow')}</div>
      <div>
        <ProgressDropdownWithService servicesManager={servicesManager} />
      </div>
    </div>
  );
}

export default WorkflowPanel;
