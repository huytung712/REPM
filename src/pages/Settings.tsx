import React, { useState } from 'react';
import { Save, Link as LinkIcon } from 'lucide-react';

export default function Settings() {
  const [webhookUrl, setWebhookUrl] = useState('https://ais-dev-xxx.run.app/api/webhooks/sharepoint');

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">SharePoint Integration</h2>
          <p className="text-sm text-gray-500 mb-4">
            Connect your SharePoint tracking Excel file to Stellar PM. Because Microsoft Graph API requires specific tenant configurations, the easiest way to sync is to use PowerAutomate. Set up a PowerAutomate flow that triggers when your Excel file is modified, and sends a POST request to this webhook URL.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
            <div className="flex">
              <input 
                type="text" 
                readOnly
                value={webhookUrl}
                className="flex-1 bg-white border border-gray-300 rounded-l-lg px-3 py-2 text-sm text-gray-600 focus:outline-none"
              />
              <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-r-lg hover:bg-slate-800">
                Copy
              </button>
            </div>
            
            <div className="mt-4 flex items-center space-x-2 text-sm text-blue-600">
              <LinkIcon size={16} />
              <a href="https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/IQA4GaKibvU-TrLPXR2svPGHAd-LobqrbWKx_e-_aUULN08?e=p1a4dW&wdExp=TEAMS-TREATMENT&web=1" target="_blank" rel="noreferrer" className="hover:underline">
                View Source Excel File
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Email Notifications (Cron)</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
              <span className="text-sm text-gray-700">Weekly PDF Summary to Management (Mondays 8:00 AM)</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
              <span className="text-sm text-gray-700">Alert me when a project phase is delayed</span>
            </label>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
            <Save size={18} className="mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
