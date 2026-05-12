import { User, Building2, Bell, Lock, CreditCard, Palette } from 'lucide-react';

const settingsSections = [
  {
    title: 'Account Settings',
    icon: User,
    items: [
      { label: 'Profile Information', description: 'Update your name, email, and avatar' },
      { label: 'Password & Security', description: 'Manage your password and 2FA settings' },
      { label: 'Preferences', description: 'Set your language and timezone' },
    ],
  },
  {
    title: 'Store Configuration',
    icon: Building2,
    items: [
      { label: 'Store Details', description: 'Manage store name, address, and contact info' },
      { label: 'Tax Settings', description: 'Configure tax rates and GST settings' },
      { label: 'Operating Hours', description: 'Set your business hours' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Email Notifications', description: 'Control which emails you receive' },
      { label: 'Push Notifications', description: 'Manage in-app notifications' },
      { label: 'Alert Preferences', description: 'Set thresholds for inventory alerts' },
    ],
  },
  {
    title: 'Billing & Subscription',
    icon: CreditCard,
    items: [
      { label: 'Current Plan', description: 'View and manage your subscription' },
      { label: 'Payment Method', description: 'Update billing information' },
      { label: 'Invoice History', description: 'Download past invoices' },
    ],
  },
  {
    title: 'Appearance',
    icon: Palette,
    items: [
      { label: 'Theme', description: 'Switch between light and dark mode' },
      { label: 'Display Density', description: 'Adjust UI spacing and size' },
    ],
  },
  {
    title: 'Integrations',
    icon: Lock,
    items: [
      { label: 'API Keys', description: 'Manage API access tokens' },
      { label: 'Webhooks', description: 'Configure webhook endpoints' },
      { label: 'Connected Apps', description: 'Manage third-party integrations' },
    ],
  },
];

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section, index) => (
          <div key={index} className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <div className="space-y-3">
              {section.items.map((item, idx) => (
                <button
                  key={idx}
                  className="w-full p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg text-left transition-colors"
                >
                  <h3 className="font-medium mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
