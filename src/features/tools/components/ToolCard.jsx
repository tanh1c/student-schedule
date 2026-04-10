import React from "react";
import { ExternalLink, Github, Sparkles } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";

export default function ToolCard({ tool }) {
  const Icon = tool.icon;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-0">
        <div className={`h-1.5 w-full bg-gradient-to-r ${tool.gradient}`} />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {tool.category}
                </p>
                <h3 className="text-xl font-bold text-foreground">{tool.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tool.badges.map((badge) => (
              <Badge
                key={badge}
                variant="secondary"
                className="rounded-full border border-border/50 bg-muted/60 px-3 py-1 text-[11px] font-medium"
              >
                {badge}
              </Badge>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Điểm mạnh
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {tool.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="text-sm font-semibold text-foreground">
                Cài đặt nhanh
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {tool.installSteps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-slate-50/80 p-4 text-sm text-slate-600 dark:bg-slate-950/40 dark:text-slate-300">
            <span className="font-semibold text-foreground">Credit:</span>{" "}
            {tool.credit}
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </a>
            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Trang chủ
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
