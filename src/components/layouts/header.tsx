import useAuth from "@src/hooks/useAuth";
import appwriteService from "@src/lib/appwrite.config";
import Link from "next/link";
import { FormEvent } from "react";

export default function Header() {
  const { authStatus } = useAuth();
  const links = [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: authStatus ? "Profile" : "Register", href: authStatus ? "/profile" : "/register" }, 
      { name: authStatus ? "Logout" : "Login", href: authStatus ? "" : "/login" },
     
  ]
  type LinkType = {
      name: string;
      href: string;
  }
  const handleLogout = async (e:FormEvent) => {
    e.preventDefault();
      try {
          await appwriteService.logout();
          window.location.href = "/login"; // redirect to login page after logout
      } catch (error) {
          console.error("Logout failed", error);
      }
  }

  return <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 py-2">
        <div className="text-2xl font-bold text-gray-800">MyApp</div>
         <nav className="space-x-4">
           {links.map((link:LinkType) => (
               <Link key={link.name} href={link.href} className="text-gray-600 hover:text-gray-800" {...(link.name === "Logout" ? { onClick: (e:FormEvent) => handleLogout(e)} : {})}>
                 {link.name}
               </Link>
           ))}
         </nav>

      </div>
  </header>;
}
