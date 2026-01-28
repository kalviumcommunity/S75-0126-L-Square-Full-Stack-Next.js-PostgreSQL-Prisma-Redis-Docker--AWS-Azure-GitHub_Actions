import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Navigation</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-100 rounded">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/users" className="block py-2 px-4 hover:bg-gray-100 rounded">
                Users
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
