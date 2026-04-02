import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const session = await requireSession();

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" />
      <ProfileForm organizer={session} />
    </div>
  );
}
