import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingSwitch } from "@/components/admin/setting-switch";
import { getAllSettings } from "@/features/admin/settings/queries";

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();
  const valueByKey = new Map(settings.map((s) => [s.key, s.value === true]));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Settings"
        description="Site-wide toggles. Changes apply immediately for everyone."
      />

      <Card className="divide-y divide-border/60">
        <SettingSwitch
          settingKey="chat_enabled"
          isOn={valueByKey.get("chat_enabled") ?? true}
          title="Direct messaging"
          description="Turn off to temporarily disable chat sitewide. Existing conversations stay visible but read-only."
        />
        <SettingSwitch
          settingKey="maintenance_mode"
          isOn={valueByKey.get("maintenance_mode") ?? false}
          title="Maintenance mode"
          description="Redirects everyone except Super Admins to a maintenance page. Use with care."
        />
      </Card>
    </div>
  );
}
