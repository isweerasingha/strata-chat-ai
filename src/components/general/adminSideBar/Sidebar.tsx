"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/provider/store";
import { updateSideBar } from "@/lib/provider/features/ui/ui.slice";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ExpandedSidebar from "./expandedSidebar";
import CollapsedSidebar from "./collapsedSidebar";
import { MdGroups, MdOutlineDocumentScanner } from "react-icons/md";
import { FaLightbulb, FaParachuteBox, FaTruck } from "react-icons/fa";
import { PiFilesFill, PiNotepadFill } from "react-icons/pi";
import { TbBuildingEstate, TbSettingsUp } from "react-icons/tb";
import { Modules } from "@/lib/config/modules";

interface LinkItem {
  id: number;
  icon: JSX.Element;
  link: string;
  target: string;
}

export interface Section {
  title: string;
  items: {
    id: number;
    icon: JSX.Element; // or any other appropriate type for icon
    link: string;
    target: string;
  }[];
}

export const navLinks: Section[] = [
  {
    title: "",
    items: [
      {
        id: 1,
        icon: <TbBuildingEstate className="text-xl" />,
        link: Modules.ADMIN.STATE.name,
        target: Modules.ADMIN.STATE.route,
      },
      {
        id: 2,
        icon: <PiFilesFill className="text-xl" />,
        link: Modules.ADMIN.FILES.name,
        target: Modules.ADMIN.FILES.route,
      },
    ],
  },
];

const AdminSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const isSidebarExpanded = useSelector(
    (state: RootState) => state.ui.slideBarExpanded
  );

  return (
    <div
      className={`h-screen relative hidden md:hidden lg:block sidebar-transition border-r`}
      style={{ width: isSidebarExpanded ? "20%" : "10%" }}
    >
      {isSidebarExpanded ? (
        <ExpandedSidebar links={navLinks} />
      ) : (
        <CollapsedSidebar links={navLinks} />
      )}

      <div className=" absolute top-8 right-[-15px]">
        <div
          className="border-solid border-gray-200 border-[1px] rounded-full p-[4px] bg-white cursor-pointer hover:bg-gray-200"
          onClick={() => dispatch(updateSideBar())}
        >
          {isSidebarExpanded ? (
            <IoIosArrowBack className="text-xl" />
          ) : (
            <IoIosArrowForward className="text-xl" />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
