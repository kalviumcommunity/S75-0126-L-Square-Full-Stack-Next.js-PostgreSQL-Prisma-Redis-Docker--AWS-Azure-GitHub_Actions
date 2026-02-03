// app/users/page.tsx
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  // Simulate server delay (for loading.tsx)
  await new Promise((res) => setTimeout(res, 2000));

  return <UsersClient />;
}
