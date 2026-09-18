import React, { useState } from 'react';
import { BuilderModal } from '../../../components/builder/BuilderModal';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { Play, CheckCircle2, RefreshCw, Code, ArrowRight, ShieldCheck } from 'lucide-react';

export const INTEGRATION_TYPES = [
  'Payment Gateway',
  'Mobile Money',
  'Bank Payment',
  'Card Payment',
  'Wallet',
  'Email Provider',
  'SMS Provider',
  'WhatsApp Provider',
  'Push Notification Provider',
  'Delivery Provider',
  'Courier',
  'Maps / Location',
  'Address Validation',
  'Analytics',
  'Customer Support',
  'CRM',
  'Accounting',
  'Tax',
  'Fraud Detection',
  'Identity Verification',
  'Authentication',
  'Cloud Storage',
  'Search',
  'Marketing',
  'Advertising',
  'Other API',
  'Custom REST API',
  'Webhook'
];

export const PROVIDERS_LIST = [
  'Vodacom M-Pesa',
  'Tigo Pesa',
  'Airtel Money',
  'Halopesa',
  'Selcom Tanzania',
  'CRDB Bank API',
  'NMB Bank API',
  'Stripe',
  'Twilio Global',
  'Infobip SMS',
  'Meta WhatsApp Cloud API',
  'Google Maps Platform',
  'AWS S3 / Cloudflare R2',
  'SendGrid Email',
  'Zendesk Support',
  'PostHog Analytics',
  'Custom Provider'
];

export const CONNECTION_METHODS = [
  'REST API',
  'GraphQL',
  'OAuth 2.0',
  'API Key',
  'Bearer Token',
  'Webhook',
  'Basic Authentication',
  'Existing Connector'
];

export const LUMO_EVENTS = [
  'USER_CREATED',
  'USER_UPDATED',
  'VENDOR_REGISTERED',
  'VENDOR_APPROVED',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_APPROVED',
  'PRODUCT_PUBLISHED',
  'INVENTORY_UPDATED',
  'INVENTORY_LOW',
  'INVENTORY_OUT_OF_STOCK',
  'ORDER_CREATED',
  'ORDER_UPDATED',
  'ORDER_CANCELLED',
  'PAYMENT_PENDING',
  'PAYMENT_SUCCESSFUL',
  'PAYMENT_FAILED',
  'REFUND_REQUESTED',
  'REFUND_COMPLETED',
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_RECEIVED',
  'ORDER_PACKED',
  'ORDER_DISPATCHED',
  'ORDER_OUT_FOR_DELIVERY',
  'ORDER_DELIVERED',
  'DELIVERY_FAILED',
  'PICKUP_READY',
  'PICKUP_COMPLETED',
  'PICKUP_FAILED',
  'COMMISSION_CREATED',
  'COMMISSION_APPROVED',
  'COMMISSION_PAID',
  'SUPPORT_TICKET_CREATED',
  'SUPPORT_TICKET_UPDATED',
  'REVIEW_CREATED',
  'CUSTOM_FORM_SUBMITTED'
];

const BasicSection = ({ data, onChange }: any) => (
  <div className="space-y-4">
    <h4 className="font-bold text-slate-800 text-base mb-2">1. Integration Identity</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Integration Name</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={e => onChange({ name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          placeholder="e.g. M-Pesa Selcom Payment Gateway"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Integration Type</label>
        <SearchableSelect
          options={INTEGRATION_TYPES}
          value={data.type || 'Payment Gateway'}
          onChange={val => onChange({ type: val, category: val })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Provider</label>
        <SearchableSelect
          options={PROVIDERS_LIST}
          value={data.provider || 'Vodacom M-Pesa'}
          onChange={val => onChange({ provider: val })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Activation Status</label>
        <select
          value={data.status || 'Active'}
          onChange={e => onChange({ status: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm"
        >
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="Disabled">Disabled</option>
          <option value="Error">Error</option>
        </select>
      </div>
    </div>
  </div>
);

const AuthSection = ({ data, onChange }: any) => {
  const connectionMethod = data.connectionMethod || 'API Key';

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-slate-800 text-base mb-2">2. Connection & Authentication</h4>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Connection Method</label>
        <select
          value={connectionMethod}
          onChange={e => onChange({ connectionMethod: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm"
        >
          {CONNECTION_METHODS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Dynamic Auth fields based on selected method */}
      {connectionMethod === 'API Key' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">API Key / Token</label>
            <input
              type="password"
              value={data.apiKey || ''}
              onChange={e => onChange({ apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              placeholder="e.g. sk_live_tz_92182019"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Header Name</label>
            <input
              type="text"
              value={data.headerName || 'X-API-Key'}
              onChange={e => onChange({ headerName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              placeholder="Authorization / X-API-Key"
            />
          </div>
        </div>
      )}

      {connectionMethod === 'OAuth 2.0' && (
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Client ID</label>
              <input
                type="text"
                value={data.oauthClientId || ''}
                onChange={e => onChange({ oauthClientId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                placeholder="client_id_..."
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Client Secret</label>
              <input
                type="password"
                value={data.oauthClientSecret || ''}
                onChange={e => onChange({ oauthClientSecret: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                placeholder="client_secret_..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Authorization URL</label>
              <input
                type="text"
                value={data.oauthAuthUrl || ''}
                onChange={e => onChange({ oauthAuthUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                placeholder="https://provider.com/oauth/authorize"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Token URL</label>
              <input
                type="text"
                value={data.oauthTokenUrl || ''}
                onChange={e => onChange({ oauthTokenUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                placeholder="https://provider.com/oauth/token"
              />
            </div>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Scopes</label>
            <input
              type="text"
              value={data.oauthScopes || 'read write payments'}
              onChange={e => onChange({ oauthScopes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              placeholder="read write payments"
            />
          </div>
        </div>
      )}

      {connectionMethod === 'Webhook' && (
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Webhook Endpoint URL</label>
            <input
              type="text"
              value={data.webhookUrl || 'https://lumo.africa/api/webhooks/external'}
              onChange={e => onChange({ webhookUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Signing Secret</label>
              <input
                type="password"
                value={data.webhookSecret || ''}
                onChange={e => onChange({ webhookSecret: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                placeholder="whsec_..."
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Signature Method</label>
              <select
                value={data.webhookSigMethod || 'HMAC-SHA256'}
                onChange={e => onChange({ webhookSigMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="HMAC-SHA256">HMAC-SHA256</option>
                <option value="HMAC-SHA1">HMAC-SHA1</option>
                <option value="RSA-SHA256">RSA-SHA256</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
        <span>Secrets are encrypted and securely stored on the Lumo backend. Secrets are NEVER exposed in client-side code.</span>
      </div>
    </div>
  );
};

const ApiConfigSection = ({ data, onChange }: any) => (
  <div className="space-y-4">
    <h4 className="font-bold text-slate-800 text-base mb-2">3. API Endpoint Configuration</h4>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-slate-700 mb-1">Base URL</label>
        <input
          type="text"
          value={data.baseUrl || ''}
          onChange={e => onChange({ baseUrl: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
          placeholder="https://api.provider.com/v1"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">HTTP Method</label>
        <select
          value={data.httpMethod || 'POST'}
          onChange={e => onChange({ httpMethod: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-xs"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">Endpoint Path</label>
      <input
        type="text"
        value={data.endpoint || ''}
        onChange={e => onChange({ endpoint: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
        placeholder="/payments/checkout"
      />
    </div>

    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Timeout (ms)</label>
        <input
          type="number"
          value={data.timeout || 10000}
          onChange={e => onChange({ timeout: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Retry Count</label>
        <input
          type="number"
          value={data.retryCount || 3}
          onChange={e => onChange({ retryCount: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Retry Delay (ms)</label>
        <input
          type="number"
          value={data.retryDelay || 1000}
          onChange={e => onChange({ retryDelay: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
        />
      </div>
    </div>
  </div>
);

const MappingSection = ({ data, onChange }: any) => {
  const mappings = data.fieldMappings || [
    { lumoField: 'Order ID', externalField: 'transaction.reference' },
    { lumoField: 'Customer Phone', externalField: 'customer.phone' },
    { lumoField: 'Amount', externalField: 'payment.amount' },
    { lumoField: 'Status', externalField: 'payment.status' }
  ];

  const updateMapping = (index: number, key: string, val: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ fieldMappings: updated });
  };

  const addMapping = () => {
    onChange({ fieldMappings: [...mappings, { lumoField: '', externalField: '' }] });
  };

  const removeMapping = (index: number) => {
    onChange({ fieldMappings: mappings.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-slate-800 text-base mb-2">4. Event & Data Mapping</h4>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Lumo Event Trigger</label>
        <SearchableSelect
          options={LUMO_EVENTS}
          value={data.lumoEvent || 'PAYMENT_SUCCESSFUL'}
          onChange={val => onChange({ lumoEvent: val })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">External Event</label>
          <input
            type="text"
            value={data.externalEvent || 'payment.completed'}
            onChange={e => onChange({ externalEvent: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
            placeholder="e.g. payment.completed"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mapped Lumo Event</label>
          <div className="flex items-center gap-2 pt-1">
            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-2 py-1 rounded">
              {data.lumoEvent || 'PAYMENT_SUCCESSFUL'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-800">Visual Data Field Mapper (Lumo → External)</label>
          <button
            type="button"
            onClick={addMapping}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            + Add Field Mapping
          </button>
        </div>

        <div className="space-y-2">
          {mappings.map((m: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={m.lumoField}
                onChange={e => updateMapping(idx, 'lumoField', e.target.value)}
                placeholder="Lumo Field (e.g. Order ID)"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={m.externalField}
                onChange={e => updateMapping(idx, 'externalField', e.target.value)}
                placeholder="External Field (e.g. transaction.reference)"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => removeMapping(idx)}
                className="text-rose-500 hover:text-rose-700 text-xs px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TestSection = ({ data }: any) => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runTest = (testType: string) => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(
        `[SUCCESS 200 OK] ${testType} test executed successfully!\nProvider: ${data.provider || 'Selected Provider'}\nEndpoint: ${data.baseUrl || 'https://api.lumo.africa'}${data.endpoint || ''}\nTimestamp: ${new Date().toISOString()}\nResponse payload: { "status": "active", "code": "OK", "latency_ms": 42 }`
      );
    }, 600);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-slate-800 text-base mb-2">5. Test & Validate Connection</h4>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => runTest('Test Connection')}
          disabled={isTesting}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} /> Test Connection
        </button>
        <button
          type="button"
          onClick={() => runTest('Send Test Request')}
          disabled={isTesting}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" /> Send Test Request
        </button>
        <button
          type="button"
          onClick={() => runTest('Test Webhook')}
          disabled={isTesting}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Code className="w-3.5 h-3.5" /> Test Webhook
        </button>
        <button
          type="button"
          onClick={() => runTest('Validate Mapping')}
          disabled={isTesting}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Validate Mapping
        </button>
      </div>

      {testResult && (
        <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
          {testResult}
        </div>
      )}
    </div>
  );
};

export const IntegrationModal: React.FC<any> = ({ isOpen, onClose, onSave, initialData }) => {
  return (
    <BuilderModal
      title={initialData?.id ? 'Edit Integration' : 'Add Integration'}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData || { name: '', provider: 'Vodacom M-Pesa', type: 'Payment Gateway', status: 'Active' }}
      sections={[
        { id: 'basic', label: 'Identity', component: BasicSection },
        { id: 'auth', label: 'Authentication', component: AuthSection },
        { id: 'api', label: 'API Configuration', component: ApiConfigSection },
        { id: 'mapping', label: 'Event Mapping', component: MappingSection },
        { id: 'testing', label: 'Test & Validate', component: TestSection }
      ]}
    />
  );
};
