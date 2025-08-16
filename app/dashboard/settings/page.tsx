import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserProfile } from '@/components/settings/user-profile'
import { UserPreferences } from '@/components/settings/user-preferences'
import { DataExport } from '@/components/settings/data-export'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account, preferences, and data</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <UserProfile />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <UserPreferences />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataExport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
