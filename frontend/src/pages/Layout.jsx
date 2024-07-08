import Navbar from "../components/Navbar";

const Layout = ({ children, setSearch }) => {
  return (
    <div className="min-h-screen dark:bg-slate-900">
      <Navbar setSearch={setSearch} />
      <main className="mx-auto max-w-7xl p-2 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;
