"use client";

import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import { ThemeSwitch } from "./ThemeSwitch";

export default function NavBar() {
  return (
    <Navbar className="w-full max-w-[900px] mx-auto">
      <NavbarBrand className="flex items-center">
        <img src="/blive_header.png" alt="Blive Logo" className="h-12" />
        <div className="bg-gradient-to-br from-sky-300 to-indigo-500 bg-clip-text ml-4 flex items-center">
          <p className="text-xl font-semibold text-transparent">
            Asistente Enólogo
          </p>
        </div>
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem className="flex flex-row items-center gap-4">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
