import { Component, createSignal } from 'solid-js';
import { useI18n } from 'reynard-themes';

const TranslationDemo: Component = () => {
  // Use real i18n system
  const { t } = useI18n();
  const [count, setCount] = createSignal(0);

  return (
    <div class="translation-demo">
      <h2>Translation Examples</h2>
      
      <div class="demo-grid">
        <div class="demo-card">
          <h3>Basic Actions</h3>
          <div class="button-group">
            <button class="btn btn-primary">{t('common.save')}</button>
            <button class="btn btn-secondary">{t('common.cancel')}</button>
            <button class="btn btn-danger">{t('common.delete')}</button>
          </div>
        </div>

        <div class="demo-card">
          <h3>Navigation</h3>
          <div class="nav-demo">
            <span>{t('common.home')}</span>
            <span>→</span>
            <span>{t('common.settings')}</span>
            <span>→</span>
            <span>{t('common.about')}</span>
          </div>
        </div>

        <div class="demo-card">
          <h3>Form Elements</h3>
          <div class="form-demo">
            <label>{t('common.name')}:</label>
            <input type="text" placeholder={t('common.search')} />
            <label>{t('common.description')}:</label>
            <textarea placeholder={t('common.description')}></textarea>
          </div>
        </div>

        <div class="demo-card">
          <h3>Counter Demo</h3>
          <div class="counter-demo">
            <button onClick={() => setCount(c => c - 1)}>-</button>
            <span class="count">{count()}</span>
            <button onClick={() => setCount(c => c + 1)}>+</button>
            <p class="count-text">
              {count() === 0 && t('common.none')}
              {count() === 1 && '1 item'}
              {count() !== 0 && count() !== 1 && `${count()} items`}
            </p>
          </div>
        </div>

        <div class="demo-card">
          <h3>Package Translations</h3>
          <div class="package-demo">
            <h4>Core</h4>
            <p>{t('core.notifications.title')}: {t('core.notifications.noNotifications')}</p>
            
            <h4>Components</h4>
            <p>{t('components.modal.title')}: {t('components.modal.close')}</p>
            
            <h4>Gallery</h4>
            <p>{t('gallery.upload.title')}: {t('gallery.upload.dragDrop')}</p>
            
            <h4>Charts</h4>
            <p>{t('charts.types.line')}: {t('charts.data.noData')}</p>
          </div>
        </div>

        <div class="demo-card">
          <h3>Status Messages</h3>
          <div class="status-demo">
            <div class="status success">{t('common.success')}</div>
            <div class="status warning">{t('common.warning')}</div>
            <div class="status error">{t('common.error')}</div>
            <div class="status info">{t('common.info')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDemo;
