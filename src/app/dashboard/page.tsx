import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ResourceChart } from "@/components/dashboard/resource-chart";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">
          ClassWise overview
        </h1>
        <p className="text-sm text-muted-foreground">
          A calm workspace for planning class-wise timetables and monitoring resources.
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <ResourceChart />

        <Card className="flex flex-col border-dashed bg-card/80">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              Quick actions
            </CardTitle>
            <CardDescription>
              Jump directly into the most common flows.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col justify-center gap-3">
            <Link href="/dashboard/timetable" passHref>
              <Button
                size="lg"
                className="w-full justify-between rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <div className="flex items-center gap-2">
                  <CalendarPlus className="h-5 w-5" />
                  <span>Generate or view timetable</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/conflicts" passHref>
              <Button
                size="lg"
                variant="outline"
                className="w-full justify-between rounded-xl border-muted bg-background/60 hover:bg-background"
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <span>Resolve conflicts with AI</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
