// "use client";

// import { useState } from "react";
// import {
//   LogOut,
//   Menu,
//   X,
//   ChevronDown,
//   ChevronRight,
//   Shield,
// } from "lucide-react";
// import { menuItems, MenuItem } from "@/app/admin/constants/menuItems";

// interface AdminSidebarProps {
//   activeTab: string;
//   onTabChange: (tabId: string) => void;
//   onLogout?: () => void;
//   user?: {
//     name?: string;
//     email?: string;
//     avatar?: string;
//   };
// }

// export default function AdminSidebar({
//   activeTab,
//   onTabChange,
//   onLogout,
//   user,
// }: AdminSidebarProps) {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

//   const toggleMenu = (menuId: string) => {
//     setExpandedMenus((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(menuId)) {
//         newSet.delete(menuId);
//       } else {
//         newSet.add(menuId);
//       }
//       return newSet;
//     });
//   };

//   const isItemActive = (item: MenuItem): boolean => {
//     if (item.id === activeTab) return true;
//     if (item.children) {
//       return item.children.some((child) => child.id === activeTab);
//     }
//     return false;
//   };

//   const renderMenuItem = (item: MenuItem) => {
//     const hasChildren = item.children && item.children.length > 0;
//     const isExpanded = expandedMenus.has(item.id);
//     const isActive = isItemActive(item);

//     return (
//       <div key={item.id}>
//         <button
//           onClick={() => {
//             if (hasChildren) {
//               toggleMenu(item.id);
//             } else {
//               onTabChange(item.id);
//               setIsMobileOpen(false);
//             }
//           }}
//           className={`
//             flex items-center w-full rounded-xl transition-all duration-200
//             gap-3 px-4 py-2.5 text-sm font-medium
//             ${
//               isActive && !hasChildren
//                 ? "bg-indigo-50 text-indigo-600 shadow-sm"
//                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//             }
//             ${hasChildren && isExpanded ? "bg-gray-50" : ""}
//           `}
//         >
//           <item.icon
//             size={18}
//             className={isActive ? "text-indigo-600" : "text-gray-400"}
//           />
//           <span className="flex-1 text-left">{item.label}</span>

//           {item.badge && (
//             <span
//               className={`
//                 px-2 py-0.5 text-xs rounded-full
//                 ${item.badgeColor || "bg-indigo-100 text-indigo-600"}
//               `}
//             >
//               {item.badge}
//             </span>
//           )}

//           {hasChildren && (
//             <span className="text-gray-400 transition-transform duration-200">
//               {isExpanded ? (
//                 <ChevronDown size={16} />
//               ) : (
//                 <ChevronRight size={16} />
//               )}
//             </span>
//           )}

//           {isActive && !hasChildren && (
//             <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
//           )}
//         </button>

//         {hasChildren && isExpanded && (
//           <div className="mt-1 ml-6 space-y-1 border-l-2 border-gray-200 pl-2">
//             {item.children!.map((child) => {
//               const isChildActive = activeTab === child.id;
//               return (
//                 <button
//                   key={child.id}
//                   onClick={() => {
//                     onTabChange(child.id);
//                     setIsMobileOpen(false);
//                   }}
//                   className={`
//                     flex items-center w-full rounded-xl transition-all duration-200
//                     gap-3 px-4 py-2 text-sm font-medium
//                     ${
//                       isChildActive
//                         ? "bg-indigo-50 text-indigo-600 shadow-sm"
//                         : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
//                     }
//                   `}
//                 >
//                   <child.icon
//                     size={16}
//                     className={
//                       isChildActive ? "text-indigo-600" : "text-gray-400"
//                     }
//                   />
//                   <span className="flex-1 text-left">{child.label}</span>
//                   {isChildActive && (
//                     <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <>
//       {/* Mobile Toggle */}
//       <button
//         onClick={() => setIsMobileOpen(true)}
//         className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
//       >
//         <Menu size={24} className="text-gray-600" />
//       </button>

//       {/* Mobile Overlay */}
//       {isMobileOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black/50 z-40"
//           onClick={() => setIsMobileOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed top-0 left-0 h-full w-[280px] bg-white border-r border-gray-200 z-50
//           transition-transform duration-300 ease-in-out
//           ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//           flex flex-col
//         `}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
//           <div className="flex items-center gap-2">
//             <Shield size={28} className="text-indigo-600" />
//             <span className="font-bold text-lg text-gray-900">Admin Panel</span>
//           </div>
//           <button
//             onClick={() => setIsMobileOpen(false)}
//             className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             <X size={20} className="text-gray-600" />
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
//           {menuItems.map((item) => renderMenuItem(item))}
//         </nav>

//         {/* Footer - User Info + Logout */}
//         <div className="border-t border-gray-200 p-3 space-y-3 shrink-0">
//           {user && (
//             <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl">
//               {user.avatar ? (
//                 <img
//                   src={user.avatar}
//                   alt={user.name}
//                   className="w-8 h-8 rounded-full border border-gray-200 shrink-0"
//                 />
//               ) : (
//                 <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
//                   {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
//                 </div>
//               )}
//               <div className="min-w-0 flex-1">
//                 <p className="text-xs font-semibold text-gray-900 truncate">
//                   {user.name || "Admin"}
//                 </p>
//                 <p className="text-[10px] text-gray-400 truncate font-mono">
//                   {user.email || "admin@example.com"}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* <button
//             onClick={onLogout}
//             className="flex items-center justify-center gap-2 w-full border border-gray-200 bg-white text-gray-600 py-2 rounded-xl text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-150 shadow-sm"
//           >
//             <LogOut size={14} />
//             <span>Đăng xuất</span>
//           </button> */}
//         </div>
//       </aside>
//     </>
//   );
// }
