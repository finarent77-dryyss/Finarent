import { requireCallCenterAccess } from '@/lib/call-center-access';
import CallCenterLayoutClient from '@/components/call-center/CallCenterLayoutClient';

export const dynamic = 'force-dynamic';

export default async function CallCenterLayout({ children }) {
  const user = await requireCallCenterAccess();

  return (
    <CallCenterLayoutClient
      isManager={user.isManager}
      userName={user.name || user.email}
    >
      {children}
    </CallCenterLayoutClient>
  );
}
