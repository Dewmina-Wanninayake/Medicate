import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Settings, Bell, Lock, Eye, Globe, Moon, Shield, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  return (
    <div className="space-y-8 p-1">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your account preferences and platform configuration.</p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-[32px] border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-lg font-bold">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates about your appointments via email.</p>
              </div>
              <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({...notifications, email: v})} />
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-border/50">
              <div className="space-y-0.5">
                <Label className="text-lg font-bold">SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Get instant text messages for urgent reminders.</p>
              </div>
              <Switch checked={notifications.sms} onCheckedChange={(v) => setNotifications({...notifications, sms: v})} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Shield className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-lg font-bold">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
              </div>
              <Button variant="outline" className="rounded-full">Enable 2FA</Button>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-border/50">
              <div className="space-y-0.5">
                <Label className="text-lg font-bold">Change Password</Label>
                <p className="text-sm text-muted-foreground">Update your password to stay secure.</p>
              </div>
              <Button variant="outline" className="rounded-full">Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
