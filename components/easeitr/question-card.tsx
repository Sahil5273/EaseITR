import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function QuestionCard({
  title,
  description,
  why,
  flagged,
  onFlag,
  children,
}: {
  title: string;
  description?: string;
  why?: string;
  flagged?: boolean;
  onFlag?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="gap-2 border-b border-slate-100 px-5 py-5 sm:px-7 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl tracking-tight text-slate-900 dark:text-white">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-2 max-w-2xl leading-6 text-slate-600 dark:text-slate-400">
                {description}
              </CardDescription>
            )}
          </div>
          {onFlag && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onFlag}
              aria-pressed={flagged}
              className={cn(
                "shrink-0 rounded-lg",
                flagged &&
                  "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
              )}
            >
              <Flag />
              {flagged ? "Flagged" : "Review later"}
            </Button>
          )}
        </div>
        {why && (
          <Collapsible>
            <CollapsibleTrigger className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
              Why we ask this
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {why}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardHeader>
      <CardContent className="p-5 sm:p-7">{children}</CardContent>
    </Card>
  );
}
