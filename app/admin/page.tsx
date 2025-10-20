import { requireAdmin } from "@/lib/auth-server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  await requireAdmin()

  return <AdminDashboard />
}
