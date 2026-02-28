"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (newLocale: string) => {
        // Preserve the current path but switch the locale
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                    <Globe className="h-4 w-4 text-muted-foreground mr-1.5" />
                    <span className="text-xs font-semibold uppercase">{locale}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-content" align="end">
                <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={handleLocaleChange}
                >
                    <DropdownMenuRadioItem className="flex gap-2" value="en">
                        <span>English (EN)</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2" value="de">
                        <span>Deutsch (DE)</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2" value="fr">
                        <span>Français (FR)</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="flex gap-2" value="ru">
                        <span>Русский (RU)</span>
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
