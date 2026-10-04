import { useState, useMemo, useEffect } from 'react';
import { Search, ScrollText, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import { t, type Language } from '../../lib/i18n';
import type { ActivityLogEntry, ActivityLogType } from '../../types/activityLog';
import { getActivityLogs, clearActivityLogs } from '../../services/logs';
import {
  ACTIVITY_LOG_TYPES,
  getActivityLogTypeLabel,
  getActivityLogTypeColor,
  getActivityLogDescription,
  formatLogTime,
} from '../../lib/activityLog';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminLogs() {
  const lang = useLanguageStore((state) => state.language);
  const language = lang as Language;
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityLogType | ''>('');
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    setLogs(getActivityLogs());
  }, []);

  const filteredLogs = useMemo(() => {
    let result = logs;

    if (typeFilter) {
      result = result.filter((entry) => entry.type === typeFilter);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (entry) =>
          (entry.entityId ?? '').toLowerCase().includes(query) ||
          (entry.detail?.name ?? '').toLowerCase().includes(query) ||
          (entry.detail?.actor ?? '').toLowerCase().includes(query)
      );
    }

    return result;
  }, [logs, search, typeFilter]);

  const handleClear = () => {
    clearActivityLogs();
    setLogs([]);
    setClearConfirm(false);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{t('adminNav.logs', language)}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {logs.length} {t('adminLogs.count', language)}
          </p>
          <p className="mt-2 max-w-2xl rounded-xl bg-background px-3 py-2 text-xs text-text-secondary">
            {t('adminLogs.notice', language)}
          </p>
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => setClearConfirm(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <Trash2 className="h-4 w-4" />
            {t('adminLogs.clearLogs', language)}
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder={t('adminLogs.searchPlaceholder', language)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-3 pe-4 ps-10 text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none"
            aria-label={t('adminLogs.searchLabel', language)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ActivityLogType | '')}
          className="cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-primary focus:border-primary focus:outline-none"
          aria-label={t('adminLogs.filterLabel', language)}
        >
          <option value="">{t('adminLogs.filterAll', language)}</option>
          {ACTIVITY_LOG_TYPES.map((type) => (
            <option key={type} value={type}>
              {getActivityLogTypeLabel(type, language)}
            </option>
          ))}
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="rounded-2xl bg-surface py-16 text-center">
          <ScrollText className="mx-auto mb-4 h-12 w-12 text-text-secondary/50" />
          <h3 className="mb-1 text-lg font-medium text-primary">
            {search || typeFilter ? t('adminLogs.emptyFiltered', language) : t('adminLogs.empty', language)}
          </h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {t('adminLogs.time', language)}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {t('adminLogs.type', language)}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {t('adminLogs.description', language)}
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-text-secondary">
                    {t('adminLogs.entityId', language)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-background/50">
                    <td className="px-6 py-4">
                      <p className="whitespace-nowrap text-sm text-text-secondary">
                        {formatLogTime(entry.createdAt, language)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${getActivityLogTypeColor(entry.type)}`}
                      >
                        {getActivityLogTypeLabel(entry.type, language)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-primary">
                        {getActivityLogDescription(entry, language) || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {entry.entityId ? (
                        <p className="text-sm text-text-secondary" dir="ltr">{entry.entityId}</p>
                      ) : (
                        <p className="text-sm text-text-secondary">—</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {clearConfirm && (
        <ConfirmDialog
          isOpen={clearConfirm}
          onClose={() => setClearConfirm(false)}
          onConfirm={handleClear}
          title={t('adminLogs.clearConfirmTitle', language)}
          message={t('adminLogs.clearConfirmMessage', language)}
          confirmText={t('adminLogs.clear', language)}
          cancelText={t('common.cancel', language)}
          variant="danger"
        />
      )}
    </div>
  );
}
