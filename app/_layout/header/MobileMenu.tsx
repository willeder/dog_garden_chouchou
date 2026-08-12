"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import Logo from "@/app/_common/ui/Logo";
import Icon from "@/app/_common/ui/Icon";
import SocialLinks from "@/app/_common/ui/SocialLinks";
import { navItems } from "./constants";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const pathname = usePathname();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60] md:hidden" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden />
        </TransitionChild>

        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="flex h-full w-[280px] flex-col bg-pink px-6 py-6 shadow-xl">
              <div className="flex items-center justify-between">
                <Logo className="w-[150px]" />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="メニューを閉じる"
                  className="p-2 text-ink-light"
                >
                  <Icon type="close" size={20} />
                </button>
              </div>

              <ul className="mt-8 flex flex-col gap-5">
                {navItems.map((item) => {
                  const isCurrent = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`font-jp text-[16px] leading-[1.6] text-ink-light ${
                          isCurrent ? "underline underline-offset-4" : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <SocialLinks className="mt-auto" size={28} />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileMenu;
